import os
from fastapi import Header, HTTPException, status, Depends
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

# Load .env.local for local development; on Render, env vars are injected directly
# override=False means injected env vars always win over the file
load_dotenv(dotenv_path="../.env.local", override=False)
load_dotenv(dotenv_path=".env.local", override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials not configured in environment variables.")

# Base master client
supabase_master: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_token(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization credentials"
        )
    return authorization.split(" ")[1]

async def get_current_user(token: str = Depends(get_token)):
    try:
        # Retrieve user details from Supabase Auth using the JWT
        res = supabase_master.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token or user not found"
            )
        return res.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Auth validation failed: {str(e)}"
        )

# Dependency to get a Supabase client scoped to the current user's session
def get_user_client(token: str = Depends(get_token)) -> Client:
    options = ClientOptions(headers={"Authorization": f"Bearer {token}"})
    client = create_client(SUPABASE_URL, SUPABASE_KEY, options=options)
    client.postgrest.auth(token)
    return client

async def require_admin(user = Depends(get_current_user), client: Client = Depends(get_user_client)):
    try:
        # Check user role in profiles table
        res = client.table("profiles").select("role").eq("id", user.id).single().execute()
        profile = res.data
        if not profile or profile.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Admin access required"
            )
        return user
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin check failed: {str(e)}"
        )
