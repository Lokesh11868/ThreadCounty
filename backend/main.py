import os
import json
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import Client, create_client, ClientOptions

from auth import get_current_user, get_user_client, require_admin, supabase_master, SUPABASE_URL, SUPABASE_KEY
import services as services

app = FastAPI(title="Thread County API")

# Configure CORS — restrict origins in production via ALLOWED_ORIGINS env var
# Set ALLOWED_ORIGINS on Render to your Vercel URL, e.g.: https://your-app.vercel.app
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allow_origins = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StatusUpdate(BaseModel):
    status: str

class ContactMessageSubmit(BaseModel):
    name: str
    email: str
    subject: Optional[str] = None
    message: str

class ContactStatusUpdate(BaseModel):
    status: str

class NotificationBroadcast(BaseModel):
    title: str
    message: str
    type: str = "info"
    link: Optional[str] = None

class RoleUpdate(BaseModel):
    role: str

class BanUpdate(BaseModel):
    is_banned: bool

class SubscriptionUpdate(BaseModel):
    plan: str
    uploads_limit: int
    status: str

@app.get("/")
def read_root():
    return {"message": "Welcome to Thread County API (Python)"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Chatbot models & endpoint
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/api/chat")
async def chatbot_chat(
    req: ChatRequest,
    user = Depends(get_current_user)
):
    import urllib.request
    import json
    import os
    
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return {
            "role": "assistant",
            "content": "Hello! I am the ThreadCounty AI Assistant. To activate my fully capable Groq LLM brain, please configure your `GROQ_API_KEY` in the environment variables (.env.local)."
        }
    
    payload_messages = [{"role": m.role, "content": m.content} for m in req.messages]
    system_prompt = {
        "role": "system",
        "content": "You are ThreadCounty AI, a helpful, knowledgeable AI assistant specializing in textiles, fabrics, thread counting, weaving patterns, quality grading, and optical analysis. Answer the user's questions accurately and professionally."
    }
    payload_messages.insert(0, system_prompt)
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": payload_messages,
        "temperature": 0.7
    }
    
    try:
        req_obj = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req_obj) as response:
            res_body = response.read().decode("utf-8")
            res_data = json.loads(res_body)
            choice = res_data["choices"][0]["message"]
            return {
                "role": choice["role"],
                "content": choice["content"]
            }
    except Exception as err:
        import urllib.error
        if isinstance(err, urllib.error.HTTPError):
            error_body = err.read().decode("utf-8")
            print(f"[Groq API] HTTPError {err.code}: {error_body}")
            return {
                "role": "assistant",
                "content": f"Sorry, I encountered an error communicating with my AI model (HTTP {err.code}): {error_body}. Please try again."
            }
        print(f"[Groq API] Error calling Groq: {err}")
        return {
            "role": "assistant",
            "content": f"Sorry, I encountered an error communicating with my AI model: {str(err)}. Please try again."
        }

# ─────────────────────────────────────────────
# Auth / User Profile
# ─────────────────────────────────────────────

@app.get("/api/users/me")
async def get_me(user = Depends(get_current_user), client: Client = Depends(get_user_client)):
    try:
        # Get profiles row
        res = client.table("profiles").select("*, subscriptions(*)").eq("id", user.id).single().execute()
        profile = res.data
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found.")
        
        # Merge with auth user data
        return {
            **profile,
            "email": user.email,
            "email_confirmed_at": user.email_confirmed_at,
            "last_sign_in_at": user.last_sign_in_at
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

@app.put("/api/users/profile")
async def update_user_profile(
    updates: ProfileUpdate,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    return services.update_profile(client, user.id, update_data)

@app.post("/api/users/avatar")
async def upload_user_avatar(
    file: UploadFile = File(...),
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
         raise HTTPException(status_code=400, detail="Only JPG and PNG images are allowed for avatars.")
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
         raise HTTPException(status_code=400, detail="Avatar image size must be under 5MB.")
    return services.upload_avatar(client, user.id, file.filename, file.content_type, file_bytes)

@app.delete("/api/users/me")
async def delete_my_account(
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    services.delete_user_account(client, user.id)
    return {"message": "Account deleted successfully"}

# ─────────────────────────────────────────────
# Uploads
# ─────────────────────────────────────────────

@app.get("/api/uploads/quota")
async def get_quota(user = Depends(get_current_user), client: Client = Depends(get_user_client)):
    return services.check_upload_limit(client, user.id)

@app.post("/api/uploads")
async def upload_fabric_image(
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None),
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are allowed.")
    
    file_bytes = await file.read()
    file_size = len(file_bytes)
    
    # Check max size (10MB)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 10MB.")
        
    return services.create_upload(
        client=client,
        user_id=user.id,
        file_name=file.filename,
        file_type=file.content_type,
        file_size=file_size,
        file_bytes=file_bytes
    )

@app.get("/api/uploads")
async def list_user_uploads(
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.list_uploads(client, user.id, status, limit, offset)

@app.get("/api/uploads/{id}")
async def get_user_upload(
    id: str,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.get_upload(client, user.id, id)

@app.put("/api/uploads/{id}/status")
async def update_status(
    id: str,
    status_update: StatusUpdate,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.update_upload_status(client, user.id, id, status_update.status)

@app.delete("/api/uploads/{id}")
async def delete_user_upload(
    id: str,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    services.delete_upload(client, user.id, id)
    return {"message": "Upload deleted successfully"}

# ─────────────────────────────────────────────
# Reports
# ─────────────────────────────────────────────

@app.post("/api/reports")
async def create_fabric_report(
    upload_id: str = Form(...),
    language: str = Form("en"),
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    # Retrieve the upload record first
    upload = services.get_upload(client, user.id, upload_id)
    
    # Run the simulated AI analysis (FastAPI/Python side!)
    analysis_data = services.run_ai_analysis(upload["file_url"], language)
    
    # Insert report into Database and notify user
    return services.create_report(client, user.id, upload_id, analysis_data)

@app.get("/api/reports")
async def list_user_reports(
    fabric_type: Optional[str] = None,
    quality_grade: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.list_reports(client, user.id, fabric_type, quality_grade, limit, offset)

@app.get("/api/reports/{id}")
async def get_user_report(
    id: str,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.get_report(client, user.id, id)

@app.get("/api/reports/{id}/export")
async def export_report_data(
    id: str,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    report = services.get_report(client, user.id, id)
    return {
        "exportedAt": services.time.strftime("%Y-%m-%dT%H:%M:%SZ", services.time.gmtime()),
        "report": report,
        "upload": report.get("uploads")
    }

@app.delete("/api/reports/{id}")
async def delete_user_report(
    id: str,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    services.delete_report(client, user.id, id)
    return {"message": "Report deleted successfully"}

# ─────────────────────────────────────────────
# Dashboard
# ─────────────────────────────────────────────

@app.get("/api/dashboard/stats")
async def get_dashboard_summary(
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.get_dashboard_stats(client, user.id)

@app.get("/api/dashboard/recent")
async def get_recent_dashboard_reports(
    limit: int = 5,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.get_recent_reports(client, user.id, limit)

@app.get("/api/dashboard/storage")
async def get_storage_quota_usage(
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.get_storage_usage(client, user.id)

@app.get("/api/dashboard/timeline")
async def get_timeline(
    days: int = 30,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.get_activity_timeline(client, user.id, days)

@app.get("/api/dashboard/grades")
async def get_grades(
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.get_grade_distribution(client, user.id)

@app.get("/api/dashboard/fabrics")
async def get_fabrics(
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.get_fabric_type_distribution(client, user.id)

# ─────────────────────────────────────────────
# Notifications
# ─────────────────────────────────────────────

@app.get("/api/notifications")
async def get_notifications(
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.list_notifications(client, user.id)

@app.put("/api/notifications/{id}/read")
async def mark_read(
    id: str,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.mark_notification_read(client, user.id, id)

@app.delete("/api/notifications/{id}")
async def dismiss_notification(
    id: str,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    services.delete_notification(client, user.id, id)
    return {"message": "Notification deleted successfully"}

@app.post("/api/notifications/read-all")
async def mark_all_read(
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    services.mark_all_notifications_read(client, user.id)
    return {"message": "All notifications marked as read"}

# ─────────────────────────────────────────────
# Contact messages
# ─────────────────────────────────────────────

@app.post("/api/contact")
async def submit_contact(
    msg: ContactMessageSubmit,
    authorization: Optional[str] = Header(None)
):
    user_id = None
    client = supabase_master
    
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            res = supabase_master.auth.get_user(token)
            if res and res.user:
                user_id = res.user.id
                options = ClientOptions(headers={"Authorization": f"Bearer {token}"})
                client = create_client(SUPABASE_URL, SUPABASE_KEY, options=options)
                client.postgrest.auth(token)
        except Exception:
            pass
            
    return services.create_contact_message(client, user_id, msg.name, msg.email, msg.subject, msg.message)

# ─────────────────────────────────────────────
# Admin
# ─────────────────────────────────────────────

@app.get("/api/admin/stats")
async def get_admin_stats(
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.get_platform_stats(client)

@app.get("/api/admin/users")
async def get_users(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.get_all_users(client, page, limit, search, role)

@app.get("/api/admin/users/{id}")
async def get_admin_user_detail(
    id: str,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.get_user_by_id(client, id)

@app.put("/api/admin/users/{id}/role")
async def update_role(
    id: str,
    role_update: RoleUpdate,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.update_user_role(client, admin.id, id, role_update.role)

@app.put("/api/admin/users/{id}/ban")
async def update_ban(
    id: str,
    ban_update: BanUpdate,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.set_ban_status(client, admin.id, id, ban_update.is_banned)

@app.get("/api/admin/uploads")
async def get_all_admin_uploads(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.get_all_uploads(client, page, limit, status)

@app.get("/api/admin/reports")
async def get_all_admin_reports(
    page: int = 1,
    limit: int = 20,
    quality_grade: Optional[str] = None,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.get_all_reports(client, page, limit, quality_grade)

@app.get("/api/admin/contact")
async def get_contact_messages(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.get_all_contact_messages(client, page, limit, status)

@app.put("/api/admin/contact/{id}/status")
async def update_contact_status(
    id: str,
    status_update: ContactStatusUpdate,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.update_contact_message_status(client, id, status_update.status)

@app.post("/api/admin/notifications/broadcast")
async def admin_broadcast(
    bc: NotificationBroadcast,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.broadcast_notification(client, bc.title, bc.message, bc.type, bc.link)

@app.delete("/api/admin/contact/{id}")
async def delete_contact_message(
    id: str,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    services.delete_contact_message(client, id)
    return {"message": "Contact message deleted successfully"}

@app.delete("/api/admin/reports/{id}")
async def admin_delete_report(
    id: str,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    services.delete_admin_report(client, id)
    return {"message": "Report deleted successfully"}

@app.delete("/api/admin/uploads/{id}")
async def admin_delete_upload(
    id: str,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    services.delete_admin_upload(client, id)
    return {"message": "Upload deleted successfully"}

@app.put("/api/admin/users/{user_id}/subscription")
async def admin_update_subscription(
    user_id: str,
    sub: SubscriptionUpdate,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.update_user_subscription(client, user_id, sub.plan, sub.uploads_limit, sub.status)

# ─────────────────────────────────────────────
# Blog endpoints
# ─────────────────────────────────────────────
class BlogPostCreate(BaseModel):
    title: str
    slug: str
    content: str
    thumbnail_url: Optional[str] = None
    published: bool = False

@app.get("/api/blogs")
async def list_blogs(published_only: bool = True, limit: int = 10, offset: int = 0):
    return services.list_blogs(supabase_master, published_only, limit, offset)

@app.get("/api/blogs/{slug}")
async def get_blog(slug: str):
    return services.get_blog(supabase_master, slug)

@app.post("/api/blogs")
async def create_blog(
    post: BlogPostCreate,
    admin = Depends(require_admin),
    client: Client = Depends(get_user_client)
):
    return services.create_blog(client, admin.id, post.title, post.slug, post.content, post.thumbnail_url, post.published)

# ─────────────────────────────────────────────
# Forum endpoints
# ─────────────────────────────────────────────
class ForumTopicCreate(BaseModel):
    title: str
    content: str
    category: str = 'general'

class ForumReplyCreate(BaseModel):
    content: str

@app.get("/api/forums")
async def list_forum_topics(category: Optional[str] = None, limit: int = 15, offset: int = 0):
    return services.list_forum_topics(supabase_master, category, limit, offset)

@app.get("/api/forums/{topic_id}")
async def get_forum_topic(topic_id: str):
    return services.get_forum_topic(supabase_master, topic_id)

@app.post("/api/forums")
async def create_forum_topic(
    topic: ForumTopicCreate,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.create_forum_topic(client, user.id, topic.title, topic.content, topic.category)

@app.get("/api/forums/{topic_id}/replies")
async def get_forum_replies(topic_id: str, limit: int = 20, offset: int = 0):
    return services.get_forum_replies(supabase_master, topic_id, limit, offset)

@app.post("/api/forums/{topic_id}/replies")
async def create_forum_reply(
    topic_id: str,
    reply: ForumReplyCreate,
    user = Depends(get_current_user),
    client: Client = Depends(get_user_client)
):
    return services.create_forum_reply(client, user.id, topic_id, reply.content)
