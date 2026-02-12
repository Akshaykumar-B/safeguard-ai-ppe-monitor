"""
SafeGuard AI — Firebase Auth Middleware
========================================
Verifies Firebase ID tokens on backend API requests.
Fetches user role from Firestore and enforces RBAC.

Usage:
    from firebase_auth import require_auth, require_role

    @app.route("/api/workers", methods=["POST"])
    @require_auth
    @require_role("admin")
    def add_worker():
        ...
"""

import os
import functools
from flask import request, jsonify, g

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, auth, firestore

# ─── Initialize Firebase Admin ──────────────────────────────
# Option 1: Use a service account key file (recommended for production)
# Set environment variable: GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
# Option 2: Use Application Default Credentials (for Cloud environments)
# Option 3: Initialize with project ID only (limited features)

_firebase_initialized = False

def init_firebase():
    """Initialize Firebase Admin SDK."""
    global _firebase_initialized
    if _firebase_initialized:
        return

    try:
        # Check if a service account key file exists
        service_account_path = os.environ.get(
            "GOOGLE_APPLICATION_CREDENTIALS",
            os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
        )

        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin initialized with service account key")
        else:
            # Initialize with project ID for environments with ADC
            firebase_admin.initialize_app(options={
                "projectId": "safeguard-ai-d0edb"
            })
            print("⚠️  Firebase Admin initialized with project ID only (limited features)")
            print("   For full features, add serviceAccountKey.json to backend/ directory")

        _firebase_initialized = True

    except Exception as e:
        print(f"⚠️  Firebase Admin initialization failed: {e}")
        print("   Authentication middleware will run in permissive mode")


def get_firestore_client():
    """Get Firestore client."""
    try:
        return firestore.client()
    except Exception:
        return None


def verify_token(id_token):
    """Verify a Firebase ID token and return decoded claims."""
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None


def get_user_role(uid):
    """Fetch user role from Firestore."""
    try:
        db = get_firestore_client()
        if not db:
            return None

        doc = db.collection("users").document(uid).get()
        if doc.exists:
            data = doc.to_dict()
            # Check if user is active
            if data.get("status") == "disabled":
                return None
            return data.get("role", "viewer")
        return None
    except Exception as e:
        print(f"Error fetching user role: {e}")
        return None


# ─── Decorators ─────────────────────────────────────────────

def require_auth(f):
    """
    Decorator: Verify Firebase ID token on each request.
    Sets g.user_uid and g.user_role for downstream use.
    
    If Firebase Admin is not initialized, runs in permissive mode
    (allows all requests with role='admin').
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if not _firebase_initialized:
            # Permissive mode: allow all requests when Firebase is not configured
            g.user_uid = "local-dev"
            g.user_role = "admin"
            return f(*args, **kwargs)

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        id_token = auth_header.split("Bearer ")[1]
        decoded = verify_token(id_token)
        if not decoded:
            return jsonify({"error": "Invalid or expired token"}), 401

        uid = decoded.get("uid")
        if not uid:
            return jsonify({"error": "No UID in token"}), 401

        # Fetch role from Firestore
        role = get_user_role(uid)
        if not role:
            return jsonify({"error": "Account disabled or not found"}), 403

        # Store user info in Flask's request context
        g.user_uid = uid
        g.user_role = role

        return f(*args, **kwargs)

    return decorated


def require_role(*roles):
    """
    Decorator: Require specific role(s) for the endpoint.
    Must be used AFTER @require_auth.
    
    Usage:
        @require_auth
        @require_role("admin")
        def admin_only_endpoint(): ...

        @require_auth
        @require_role("admin", "staff")
        def staff_or_admin_endpoint(): ...
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated(*args, **kwargs):
            user_role = getattr(g, "user_role", None)
            if user_role not in roles:
                return jsonify({
                    "error": f"Access denied. Required role: {', '.join(roles)}. Your role: {user_role}"
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


# ─── Permission Matrix ─────────────────────────────────────
PERMISSIONS = {
    "admin": {
        "dashboard", "liveMonitoring", "workerManagement",
        "faceDatasetUpload", "violationLogs", "acknowledgeViolations",
        "analyticsReports", "systemSettings", "userManagement",
    },
    "staff": {
        "dashboard", "liveMonitoring", "violationLogs",
        "acknowledgeViolations", "analyticsReports",
    },
    "viewer": {
        "dashboard", "liveMonitoring", "violationLogs",
        "analyticsReports",
    },
}


def has_permission(role, permission):
    """Check if a role has a specific permission."""
    return permission in PERMISSIONS.get(role, set())


# Initialize on import
init_firebase()
