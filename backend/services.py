import os
import time
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from supabase import Client

# Quota checking
def check_upload_limit(client: Client, user_id: str):
    try:
        res = client.table("subscriptions").select("uploads_used, uploads_limit, plan, status").eq("user_id", user_id).single().execute()
        sub = res.data
    except Exception as e:
        # If no subscription, default to free-tier constraints
        return {"used": 0, "limit": 5, "remaining": 5}
    
    if not sub:
        return {"used": 0, "limit": 5, "remaining": 5}
    
    used = sub.get("uploads_used", 0)
    limit = sub.get("uploads_limit", 5)
    remaining = max(0, limit - used)
    
    if remaining <= 0 and sub.get("plan") == "free":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have reached your upload limit ({limit}). Upgrade your plan to continue."
        )
    
    return {"used": used, "limit": limit, "remaining": remaining}

# Upload operations
def create_upload(client: Client, user_id: str, file_name: str, file_type: str, file_size: int, file_bytes: bytes) -> Dict[str, Any]:
    # 1. Check Quota
    check_upload_limit(client, user_id)
    
    # 2. Upload to Storage
    timestamp = int(time.time() * 1000)
    ext = file_name.split(".")[-1]
    storage_path = f"{user_id}/{timestamp}.{ext}"
    
    try:
        # Note: supabase-py storage upload path is case-sensitive, file needs to be bytes
        client.storage.from_("fabric-uploads").upload(
            path=storage_path, 
            file=file_bytes, 
            file_options={"content-type": file_type}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage upload failed: {str(e)}"
        )
    
    # 3. Get Public URL
    try:
        file_url = client.storage.from_("fabric-uploads").get_public_url(storage_path)
    except Exception as e:
        # Cleanup
        client.storage.from_("fabric-uploads").remove([storage_path])
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve file URL."
        )
        
    # 4. Create DB record
    try:
        db_res = client.table("uploads").insert({
            "user_id": user_id,
            "file_url": file_url,
            "file_name": file_name,
            "file_size": file_size,
            "file_type": file_type,
            "thumbnail_url": file_url,
            "storage_path": storage_path,
            "status": "pending"
        }).execute()
        
        upload_record = db_res.data[0]
    except Exception as e:
        # Cleanup
        client.storage.from_("fabric-uploads").remove([storage_path])
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database insertion failed: {str(e)}"
        )
        
    # 5. Increment Usage counter (non-fatal)
    try:
        client.rpc("increment_upload_usage", {"p_user_id": user_id}).execute()
    except Exception:
        pass
        
    return upload_record

def get_upload(client: Client, user_id: str, upload_id: str) -> Dict[str, Any]:
    try:
        res = client.table("uploads").select("*, reports(*)").eq("id", upload_id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Upload not found.")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def list_uploads(client: Client, user_id: str, status_filter: Optional[str] = None, limit: int = 20, offset: int = 0):
    try:
        query = client.table("uploads").select("*, reports(id, quality_grade, confidence_score)", count="exact").eq("user_id", user_id).order("created_at", desc=True)
        if status_filter:
            query = query.eq("status", status_filter)
        
        res = query.range(offset, offset + limit - 1).execute()
        return {"data": res.data or [], "count": res.count or 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_upload_status(client: Client, user_id: str, upload_id: str, upload_status: str):
    try:
        res = client.table("uploads").update({"status": upload_status}).eq("id", upload_id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Upload not found.")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def delete_upload(client: Client, user_id: str, upload_id: str):
    try:
        # Get storage path
        res = client.table("uploads").select("storage_path").eq("id", upload_id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Upload not found.")
        storage_path = res.data[0].get("storage_path")
        
        # Delete from DB
        client.table("uploads").delete().eq("id", upload_id).eq("user_id", user_id).execute()
        
        # Delete from Storage
        if storage_path:
            client.storage.from_("fabric-uploads").remove([storage_path])
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# AI Fabric Analysis & Reports
import requests
import analyzer

def run_ai_analysis(file_url: str, language: str = 'en') -> Dict[str, Any]:
    try:
        # 1. Download image
        response = requests.get(file_url, timeout=15)
        response.raise_for_status()
        image_bytes = response.content
        mime_type = response.headers.get('Content-Type', 'image/jpeg')
        
        # 2. Process with OpenCV
        cv2_data = analyzer.calculate_thread_density(image_bytes)
        
        # 3. Analyze with Gemini
        analysis = analyzer.analyze_fabric_with_gemini(image_bytes, cv2_data, mime_type, language)
        
        return analysis
    except Exception as e:
        print(f"Error in run_ai_analysis: {e}")
        return analyzer.get_mock_analysis()

def send_brevo_email(to_email: str, subject: str, html_content: str):
    import requests
    brevo_api_key = os.getenv("BREVO_API_KEY")
    if not brevo_api_key:
        print("[Brevo] No BREVO_API_KEY found. Skipping email.")
        return
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": brevo_api_key,
        "content-type": "application/json"
    }
    payload = {
        "sender": {"name": "ThreadCounty", "email": "noreply@threadcounty.com"},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }
    
    try:
        res = requests.post(url, json=payload, headers=headers)
        res.raise_for_status()
        print(f"[Brevo] Email sent successfully to {to_email}")
    except Exception as e:
        print(f"[Brevo] Failed to send email: {e}")

def create_report(client: Client, user_id: str, upload_id: str, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        # Check upload belongs to user
        upload_res = client.table("uploads").select("file_url").eq("id", upload_id).eq("user_id", user_id).execute()
        if not upload_res.data:
            raise HTTPException(status_code=404, detail="Upload not found or does not belong to you.")
        file_url = upload_res.data[0].get("file_url")
        
        # Insert report
        report_data = {
            "upload_id": upload_id,
            "user_id": user_id,
            "image_url": file_url,
            **analysis_data
        }
        try:
            res = client.table("reports").insert(report_data).execute()
        except Exception as db_err:
            # If the database does not have the ocr_text column yet,
            # remove it and try inserting again, appending to detailed_analysis instead
            if "ocr_text" in report_data:
                print(f"[Database] ocr_text column not found, falling back: {db_err}")
                ocr_text = report_data.pop("ocr_text", None)
                if ocr_text:
                    report_data["detailed_analysis"] = f"{report_data.get('detailed_analysis', '')}\n\n[Extracted Label Text (OCR)]:\n{ocr_text}"
                res = client.table("reports").insert(report_data).execute()
            else:
                raise db_err
        report = res.data[0]
        
        # Update upload status
        client.table("uploads").update({"status": "completed"}).eq("id", upload_id).execute()
        
        # Create notification
        client.table("notifications").insert({
            "user_id": user_id,
            "title": "Analysis Complete",
            "message": f"Your fabric analysis is ready. Grade: {report.get('quality_grade', 'N/A')}",
            "type": "success",
            "link": f"/report/{report.get('id')}"
        }).execute()
        
        # Fetch user email to send an email notification
        try:
            profile_res = client.table("profiles").select("email").eq("id", user_id).single().execute()
            if profile_res.data and profile_res.data.get("email"):
                user_email = profile_res.data["email"]
                email_html = f"""
                <h2>Your Fabric Analysis is Ready!</h2>
                <p>Hello,</p>
                <p>We have successfully analyzed your uploaded fabric image.</p>
                <ul>
                    <li><strong>Fabric Type:</strong> {report.get('fabric_type', 'N/A')}</li>
                    <li><strong>Quality Grade:</strong> {report.get('quality_grade', 'N/A')}</li>
                </ul>
                <p>You can view the full report on your ThreadCounty Dashboard.</p>
                <br />
                <p>Thanks,<br />The ThreadCounty Team</p>
                """
                send_brevo_email(user_email, "ThreadCounty: Your Analysis is Complete", email_html)
        except Exception as ex:
            print(f"Failed to fetch profile or send email: {ex}")
        
        return report
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def get_report(client: Client, user_id: str, report_id: str) -> Dict[str, Any]:
    try:
        res = client.table("reports").select("*, uploads(id, file_name, file_url, file_type, file_size, status, created_at)").eq("id", report_id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Report not found.")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def list_reports(client: Client, user_id: str, fabric_type: Optional[str] = None, quality_grade: Optional[str] = None, limit: int = 20, offset: int = 0):
    try:
        query = client.table("reports").select("*, uploads(id, file_name, file_url, thumbnail_url)", count="exact").eq("user_id", user_id).order("created_at", desc=True)
        if fabric_type:
            query = query.eq("fabric_type", fabric_type)
        if quality_grade:
            query = query.eq("quality_grade", quality_grade)
            
        res = query.range(offset, offset + limit - 1).execute()
        return {"data": res.data or [], "count": res.count or 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_report(client: Client, user_id: str, report_id: str):
    try:
        client.table("reports").delete().eq("id", report_id).eq("user_id", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dashboard Stats
def get_dashboard_stats(client: Client, user_id: str) -> Dict[str, Any]:
    from datetime import datetime, timedelta
    one_week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    
    try:
        # Total uploads
        uploads_res = client.table("uploads").select("id", count="exact").eq("user_id", user_id).execute()
        # Completed reports
        reports_res = client.table("reports").select("id", count="exact").eq("user_id", user_id).execute()
        # Pending uploads
        pending_res = client.table("uploads").select("id", count="exact").eq("user_id", user_id).in_("status", ["pending", "analyzing"]).execute()
        # This week uploads
        week_res = client.table("uploads").select("id", count="exact").eq("user_id", user_id).gte("created_at", one_week_ago).execute()
        # Subscription
        sub_res = client.table("subscriptions").select("*").eq("user_id", user_id).execute()
        
        return {
            "totalUploads": uploads_res.count or 0,
            "completedReports": reports_res.count or 0,
            "pendingUploads": pending_res.count or 0,
            "thisWeekUploads": week_res.count or 0,
            "subscription": sub_res.data[0] if sub_res.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_recent_reports(client: Client, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    try:
        res = client.table("reports").select("id, fabric_type, quality_grade, confidence_score, thread_density, created_at, uploads(file_name, thumbnail_url)").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_storage_usage(client: Client, user_id: str) -> Dict[str, Any]:
    try:
        res = client.table("subscriptions").select("uploads_used, uploads_limit, plan").eq("user_id", user_id).single().execute()
        sub = res.data
        if not sub:
            return {"used": 0, "limit": 5, "percentage": 0, "plan": "free"}
        used = sub.get("uploads_used", 0)
        limit = sub.get("uploads_limit", 5)
        return {
            "used": used,
            "limit": limit,
            "plan": sub.get("plan", "free"),
            "percentage": int((used / limit) * 100) if limit > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_activity_timeline(client: Client, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
    from datetime import datetime, timedelta
    since = (datetime.utcnow() - timedelta(days=days)).isoformat()
    try:
        res = client.table("uploads").select("created_at").eq("user_id", user_id).gte("created_at", since).order("created_at", desc=False).execute()
        counts = {}
        for row in (res.data or []):
            day = row["created_at"][:10]
            counts[day] = counts.get(day, 0) + 1
            
        timeline = []
        for i in range(days - 1, -1, -1):
            day = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
            timeline.append({"date": day, "count": counts.get(day, 0)})
        return timeline
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_grade_distribution(client: Client, user_id: str) -> List[Dict[str, Any]]:
    try:
        res = client.table("reports").select("quality_grade").eq("user_id", user_id).execute()
        counts = {}
        for row in (res.data or []):
            g = row.get("quality_grade")
            if g:
                counts[g] = counts.get(g, 0) + 1
        return [{"grade": g, "count": count} for g, count in counts.items()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_fabric_type_distribution(client: Client, user_id: str) -> List[Dict[str, Any]]:
    try:
        res = client.table("reports").select("fabric_type").eq("user_id", user_id).execute()
        counts = {}
        for row in (res.data or []):
            f = row.get("fabric_type")
            if f:
                counts[f] = counts.get(f, 0) + 1
        return sorted([{"fabric_type": f, "count": count} for f, count in counts.items()], key=lambda x: x["count"], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Contact submissions
def send_contact_email(name: str, email: str, subject: Optional[str], message: str):
    import urllib.request
    import json
    
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        print("[Resend] No RESEND_API_KEY found in environment. Skipping email sending.")
        return

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {resend_api_key}",
        "Content-Type": "application/json"
    }
    
    email_subject = f"New Contact Message: {subject or 'General Inquiry'}"
    email_body = f"""
    <h2>New Contact Message from ThreadCounty</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Subject:</strong> {subject or 'N/A'}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">{message}</p>
    """
    
    payload = {
        "from": "ThreadCounty <onboarding@resend.dev>",
        "to": "hello@threadcounty.com",
        "subject": email_subject,
        "html": email_body
    }
    
    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(payload).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            print(f"[Resend] Email sent successfully. Response: {res_body}")
    except Exception as err:
        print(f"[Resend] Failed to send email: {err}")

def create_contact_message(client: Client, user_id: Optional[str], name: str, email: str, subject: Optional[str], message: str) -> Dict[str, Any]:
    try:
        data = {
            "name": name,
            "email": email,
            "subject": subject,
            "message": message,
            "status": "new"
        }
        if user_id:
            data["user_id"] = user_id
        res = client.table("contact_messages").insert(data).execute()
        
        # Send notification email via Resend
        send_contact_email(name, email, subject, message)
        
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Notifications
def list_notifications(client: Client, user_id: str) -> List[Dict[str, Any]]:
    try:
        res = client.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def mark_notification_read(client: Client, user_id: str, notification_id: str) -> Dict[str, Any]:
    try:
        res = client.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Notification not found.")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def delete_notification(client: Client, user_id: str, notification_id: str):
    try:
        client.table("notifications").delete().eq("id", notification_id).eq("user_id", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def mark_all_notifications_read(client: Client, user_id: str):
    try:
        client.table("notifications").update({"is_read": True}).eq("user_id", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin functions
def get_platform_stats(client: Client) -> Dict[str, Any]:
    from datetime import datetime, timedelta
    one_week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    try:
        total_users = client.table("profiles").select("id", count="exact").execute().count or 0
        new_users = client.table("profiles").select("id", count="exact").gte("created_at", one_week_ago).execute().count or 0
        total_uploads = client.table("uploads").select("id", count="exact").execute().count or 0
        total_reports = client.table("reports").select("id", count="exact").execute().count or 0
        pending_uploads = client.table("uploads").select("id", count="exact").in_("status", ["pending", "analyzing"]).execute().count or 0
        unread_messages = client.table("contact_messages").select("id", count="exact").eq("status", "new").execute().count or 0
        
        subs_res = client.table("subscriptions").select("plan").execute()
        plans = {}
        for row in (subs_res.data or []):
            p = row["plan"]
            plans[p] = plans.get(p, 0) + 1
            
        return {
            "totalUsers": total_users,
            "newUsersThisWeek": new_users,
            "totalUploads": total_uploads,
            "totalReports": total_reports,
            "pendingUploads": pending_uploads,
            "unreadContactMessages": unread_messages,
            "planDistribution": plans
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_all_users(client: Client, page: int = 1, limit: int = 20, search: Optional[str] = None, role: Optional[str] = None) -> Dict[str, Any]:
    offset = (page - 1) * limit
    try:
        query = client.table("profiles").select("*, subscriptions(plan, status, uploads_used, uploads_limit)", count="exact").order("created_at", desc=True)
        if role:
            query = query.eq("role", role)
        if search:
            query = query.ilike("full_name", f"%{search}%")
            
        res = query.range(offset, offset + limit - 1).execute()
        count = res.count or 0
        return {
            "data": res.data or [],
            "count": count,
            "page": page,
            "totalPages": (count + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_user_by_id(client: Client, target_user_id: str) -> Dict[str, Any]:
    try:
        res = client.table("profiles").select("*, subscriptions(*), uploads(id, status, created_at), reports(id, quality_grade, created_at)").eq("id", target_user_id).single().execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="User not found.")

def update_user_role(client: Client, admin_id: str, target_user_id: str, role: str) -> Dict[str, Any]:
    if admin_id == target_user_id and role != "admin":
        raise HTTPException(status_code=400, detail="You cannot demote yourself from admin.")
    try:
        res = client.table("profiles").update({"role": role}).eq("id", target_user_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def set_ban_status(client: Client, admin_id: str, target_user_id: str, is_banned: bool) -> Dict[str, Any]:
    if admin_id == target_user_id:
        raise HTTPException(status_code=400, detail="You cannot ban yourself.")
    try:
        res = client.table("profiles").update({"is_banned": is_banned}).eq("id", target_user_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_all_uploads(client: Client, page: int = 1, limit: int = 20, status_filter: Optional[str] = None) -> Dict[str, Any]:
    offset = (page - 1) * limit
    try:
        query = client.table("uploads").select("*, profiles(full_name, avatar_url)", count="exact").order("created_at", desc=True)
        if status_filter:
            query = query.eq("status", status_filter)
        res = query.range(offset, offset + limit - 1).execute()
        count = res.count or 0
        return {
            "data": res.data or [],
            "count": count,
            "page": page,
            "totalPages": (count + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_all_reports(client: Client, page: int = 1, limit: int = 20, quality_grade: Optional[str] = None) -> Dict[str, Any]:
    offset = (page - 1) * limit
    try:
        query = client.table("reports").select("*, profiles(full_name), uploads(file_name)", count="exact").order("created_at", desc=True)
        if quality_grade:
            query = query.eq("quality_grade", quality_grade)
        res = query.range(offset, offset + limit - 1).execute()
        count = res.count or 0
        return {
            "data": res.data or [],
            "count": count,
            "page": page,
            "totalPages": (count + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_all_contact_messages(client: Client, page: int = 1, limit: int = 20, status_filter: Optional[str] = None) -> Dict[str, Any]:
    offset = (page - 1) * limit
    try:
        query = client.table("contact_messages").select("*", count="exact").order("created_at", desc=True)
        if status_filter:
            query = query.eq("status", status_filter)
        res = query.range(offset, offset + limit - 1).execute()
        count = res.count or 0
        return {
            "data": res.data or [],
            "count": count,
            "page": page,
            "totalPages": (count + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_contact_message_status(client: Client, message_id: str, status_val: str) -> Dict[str, Any]:
    try:
        res = client.table("contact_messages").update({"status": status_val}).eq("id", message_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def broadcast_notification(client: Client, title: str, message: str, type_val: str, link: Optional[str] = None):
    try:
        # Get all users profiles
        users = client.table("profiles").select("id").execute()
        notifications = []
        for u in (users.data or []):
            notifications.append({
                "user_id": u["id"],
                "title": title,
                "message": message,
                "type": type_val,
                "link": link
            })
        if notifications:
            client.table("notifications").insert(notifications).execute()
        return {"status": "broadcast_success", "count": len(notifications)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_contact_message(client: Client, message_id: str):
    try:
        client.table("contact_messages").delete().eq("id", message_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_profile(client: Client, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    from datetime import datetime
    try:
        # Prevent manual modification of restricted fields
        restricted = ["id", "role", "is_banned", "created_at"]
        clean_updates = {k: v for k, v in updates.items() if k not in restricted}
        clean_updates["updated_at"] = datetime.utcnow().isoformat()
        
        res = client.table("profiles").update(clean_updates).eq("id", user_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def upload_avatar(client: Client, user_id: str, file_name: str, file_type: str, file_bytes: bytes) -> Dict[str, Any]:
    timestamp = int(time.time())
    ext = file_name.split(".")[-1]
    storage_path = f"{user_id}/{timestamp}.{ext}"
    try:
        # Upload
        client.storage.from_("avatars").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": file_type}
        )
        # Get url
        avatar_url = client.storage.from_("avatars").get_public_url(storage_path)
        # Update profile
        res = client.table("profiles").update({"avatar_url": avatar_url}).eq("id", user_id).execute()
        return {"avatar_url": avatar_url, "profile": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_user_account(client: Client, user_id: str):
    try:
        client.table("profiles").delete().eq("id", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_admin_report(client: Client, report_id: str):
    try:
        client.table("reports").delete().eq("id", report_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_admin_upload(client: Client, upload_id: str):
    try:
        client.table("uploads").delete().eq("id", upload_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_user_subscription(client: Client, user_id: str, plan: str, uploads_limit: int, status: str) -> Dict[str, Any]:
    from datetime import datetime
    try:
        sub_res = client.table("subscriptions").select("*").eq("user_id", user_id).execute()
        data = {
            "plan": plan,
            "uploads_limit": uploads_limit,
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }
        if sub_res.data:
            res = client.table("subscriptions").update(data).eq("user_id", user_id).execute()
        else:
            data["user_id"] = user_id
            res = client.table("subscriptions").insert(data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────────
# BLOG
# ─────────────────────────────────────────────
def list_blogs(client: Client, published_only: bool = True, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
    try:
        query = client.table("blog_posts").select("*, profiles(full_name, avatar_url)")
        if published_only:
            query = query.eq("published", True)
        res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_blog(client: Client, slug: str) -> Dict[str, Any]:
    try:
        res = client.table("blog_posts").select("*, profiles(full_name, avatar_url)").eq("slug", slug).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Blog post not found")
        return res.data
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

def create_blog(client: Client, author_id: str, title: str, slug: str, content: str, thumbnail_url: Optional[str] = None, published: bool = False) -> Dict[str, Any]:
    try:
        res = client.table("blog_posts").insert({
            "author_id": author_id,
            "title": title,
            "slug": slug,
            "content": content,
            "thumbnail_url": thumbnail_url,
            "published": published
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────────
# FORUM
# ─────────────────────────────────────────────
def list_forum_topics(client: Client, category: Optional[str] = None, limit: int = 15, offset: int = 0) -> List[Dict[str, Any]]:
    try:
        query = client.table("forum_topics").select("*, profiles(full_name, avatar_url)")
        if category:
            query = query.eq("category", category)
        res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_forum_topic(client: Client, topic_id: str) -> Dict[str, Any]:
    try:
        res = client.table("forum_topics").select("*, profiles(full_name, avatar_url)").eq("id", topic_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Topic not found")
        return res.data
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

def create_forum_topic(client: Client, author_id: str, title: str, content: str, category: str = 'general') -> Dict[str, Any]:
    try:
        res = client.table("forum_topics").insert({
            "author_id": author_id,
            "title": title,
            "content": content,
            "category": category
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_forum_replies(client: Client, topic_id: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
    try:
        res = client.table("forum_replies").select("*, profiles(full_name, avatar_url)").eq("topic_id", topic_id).order("created_at", desc=False).range(offset, offset + limit - 1).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def create_forum_reply(client: Client, author_id: str, topic_id: str, content: str) -> Dict[str, Any]:
    try:
        res = client.table("forum_replies").insert({
            "topic_id": topic_id,
            "author_id": author_id,
            "content": content
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
