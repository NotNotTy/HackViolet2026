from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import hashlib
import uuid
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Add CORS headers to all responses (use set() to avoid duplicates)
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response

# Handle OPTIONS preflight requests explicitly for all API routes
# Headers will be added by after_request, so we just need to return empty response
@app.route('/api/register', methods=['OPTIONS'])
@app.route('/api/login', methods=['OPTIONS'])
@app.route('/api/logout', methods=['OPTIONS'])
@app.route('/api/gym-info', methods=['OPTIONS'])
@app.route('/api/posts', methods=['OPTIONS'])
@app.route('/api/posts/<path:path>', methods=['OPTIONS'])
@app.route('/api/user', methods=['OPTIONS'])
@app.route('/api/profiles', methods=['OPTIONS'])
@app.route('/api/profiles/<path:path>', methods=['OPTIONS'])
@app.route('/api/profiles/interest', methods=['OPTIONS'])
@app.route('/api/requests', methods=['OPTIONS'])
@app.route('/api/verify-email', methods=['OPTIONS'])
@app.route('/api/resend-verification', methods=['OPTIONS'])
@app.route('/api/reset', methods=['OPTIONS'])
@app.route('/api/seed', methods=['OPTIONS'])
def options_handler(path=None):
    return jsonify({}), 200

# In-memory storage (replace with database in production)
emails: Dict[str, Dict] = {}
user_sessions: Dict[str, str] = {}  # token -> user_id
gym_info: Dict[str, Dict] = {}  # user_id -> gym preferences
posts: List[Dict] = []  # List of all posts/sessions
interest_requests: List[Dict] = []  # List of interest requests
verification_tokens: Dict[str, Dict] = {}  # token -> {user_id, email, created_at}

# Email configuration (from environment variables)
GMAIL_USER = os.getenv('GMAIL_USER', '')
GMAIL_PASSWORD = os.getenv('GMAIL_PASSWORD', '')  # Use Gmail App Password
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

def hash_password(password: str) -> str:
    """Simple password hashing (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Generate a simple session token"""
    return str(uuid.uuid4())

def generate_verification_token() -> str:
    """Generate a verification token"""
    return str(uuid.uuid4())

def send_verification_email(email: str, token: str, first_name: str) -> bool:
    """Send verification email using Gmail SMTP"""
    if not GMAIL_USER or not GMAIL_PASSWORD:
        print("WARNING: Gmail credentials not configured. Email verification disabled.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Verify your LiftLink account'
        msg['From'] = GMAIL_USER
        msg['To'] = email
        
        # Create verification link
        verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
        
        # Create email body
        text = f"""
        Hi {first_name},
        
        Welcome to LiftLink! Please verify your email address by clicking the link below:
        
        {verification_link}
        
        If you didn't create an account, please ignore this email.
        
        Best regards,
        The LiftLink Team
        """
        
        html = f"""
        <html>
          <body>
            <h2>Hi {first_name},</h2>
            <p>Welcome to LiftLink! Please verify your email address by clicking the button below:</p>
            <p><a href="{verification_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>{verification_link}</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>Best regards,<br>The LiftLink Team</p>
          </body>
        </html>
        """
        
        # Attach parts
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        return False

# ==================== AUTHENTICATION ENDPOINTS ====================

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    """Register a new user"""
    # Handle OPTIONS preflight (headers added by after_request)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        data = request.json
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        gender = data.get('gender')
        age = data.get('age')
        
        # Validation - email, password, first_name, last_name are required
        if not all([password, first_name, last_name, email]):
            return jsonify({'error': 'Missing required fields: email, password, first name, and last name are required'}), 400
        
        # Normalize email (lowercase, strip whitespace)
        email = email.lower().strip()
        
        # Validate email is .edu domain
        if not email.endswith('.edu'):
            return jsonify({'error': 'Please use a valid .edu email address'}), 400
        
        # Check if user already exists (case-insensitive)
        if email in emails:
            return jsonify({'error': 'Account already exists'}), 409
        
        # Create user (unverified by default)
        user_id = str(uuid.uuid4())
        emails[email] = {
            'id': user_id,
            'password_hash': hash_password(password),
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'gender': gender,
            'age': age,
            'verified': False,  # Email not verified yet
            'created_at': datetime.now().isoformat()
        }
        
        # Generate verification token
        verification_token = generate_verification_token()
        verification_tokens[verification_token] = {
            'user_id': user_id,
            'email': email,
            'created_at': datetime.now().isoformat()
        }
        
        # Send verification email
        email_sent = send_verification_email(email, verification_token, first_name)
        
        # Generate session token (user can login but may have limited access)
        token = generate_token()
        user_sessions[token] = user_id
        
        return jsonify({
            'message': 'User registered successfully. Please check your email to verify your account.',
            'token': token,
            'user_id': user_id,
            'email': email,
            'verified': False,
            'email_sent': email_sent
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    """Login user"""
    # Handle OPTIONS preflight (headers added by after_request)
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        data = request.json
        email_input = data.get('email')
        password = data.get('password')
        
        if not email_input or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Normalize email (lowercase) for lookup
        email_input_lower = email_input.lower().strip()
        
        # Check if email exists (case-insensitive)
        user_data = None
        user_email_key = None
        for email_key in emails.keys():
            if email_key.lower() == email_input_lower:
                user_data = emails[email_key]
                user_email_key = email_key
                break
        
        if not user_data:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        password_hash = hash_password(password)
        
        # Verify password
        if user_data['password_hash'] != password_hash:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate session token
        token = generate_token()
        user_sessions[token] = user_data['id']
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user_id': user_data['id'],
            'email': user_email_key or email_input,  # Use the actual email key from storage
            'verified': user_data.get('verified', False)  # Include verification status
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        token = request.headers.get('Authorization')
        if token and token in user_sessions:
            del user_sessions[token]
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-email', methods=['GET'])
def check_verification_status():
    """Check verification status by token (without consuming it)"""
    try:
        token = request.args.get('token')
        
        # If no token provided, return a helpful message instead of error
        if not token:
            return jsonify({
                'message': 'No token provided. Please use the verification link from your email.',
                'token_provided': False
            }), 200
        
        # Check if token exists
        if token not in verification_tokens:
            # Token doesn't exist - might be already used or expired
            return jsonify({
                'message': 'Token not found. It may have already been used or expired.',
                'token_exists': False
            }), 200
        
        verification_data = verification_tokens[token]
        email = verification_data['email']
        
        # Check if user is already verified
        if email in emails and emails[email].get('verified', False):
            return jsonify({
                'message': 'Email already verified',
                'verified': True,
                'already_verified': True
            }), 200
        
        return jsonify({
            'message': 'Token is valid',
            'verified': False,
            'token_exists': True
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-email', methods=['POST'])
def verify_email():
    """Verify user email with token"""
    try:
        data = request.json
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Verification token required'}), 400
        
        # Check if token exists
        if token not in verification_tokens:
            # Token might have been used already - check if user is already verified
            # Try to find user by checking all users and see if any are verified
            # But we don't have a way to map token to user without the token...
            # So we'll just return the error, but make it more helpful
            return jsonify({'error': 'Invalid or expired verification token. The token may have already been used. If you already verified your email, you can log in normally.'}), 400
        
        verification_data = verification_tokens[token]
        user_id = verification_data['user_id']
        email = verification_data['email']
        
        # Find user and check if already verified
        if email in emails:
            if emails[email].get('verified', False):
                # User already verified - remove token and return success
                del verification_tokens[token]
                return jsonify({
                    'message': 'Email already verified',
                    'verified': True,
                    'already_verified': True
                }), 200
            
            # Mark as verified
            emails[email]['verified'] = True
            emails[email]['verified_at'] = datetime.now().isoformat()
        else:
            return jsonify({'error': 'User not found'}), 404
        
        # Remove used token
        del verification_tokens[token]
        
        return jsonify({
            'message': 'Email verified successfully',
            'verified': True
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Find user
        user = None
        user_email = None
        for email_addr, u in emails.items():
            if u['id'] == user_id:
                user = u
                user_email = email_addr
                break
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if already verified
        if user.get('verified', False):
            return jsonify({'error': 'Email already verified'}), 400
        
        # Generate new verification token
        verification_token = generate_verification_token()
        verification_tokens[verification_token] = {
            'user_id': user_id,
            'email': user_email,
            'created_at': datetime.now().isoformat()
        }
        
        # Send verification email
        email_sent = send_verification_email(
            user_email, 
            verification_token, 
            user.get('first_name', 'User')
        )
        
        if not email_sent:
            return jsonify({'error': 'Failed to send verification email. Please check server configuration.'}), 500
        
        return jsonify({
            'message': 'Verification email sent successfully',
            'email_sent': True
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_user_from_token() -> Optional[str]:
    """Helper to get user_id from token"""
    token = request.headers.get('Authorization')
    if token and token in user_sessions:
        return user_sessions[token]
    return None

# ==================== GYM INFO ENDPOINTS ====================

@app.route('/api/gym-info', methods=['POST'])
def save_gym_info():
    """Save user's gym preferences"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.json
        focus = data.get('focus')
        experience = data.get('experience')
        
        if not focus or not experience:
            return jsonify({'error': 'Focus and experience are required'}), 400
        
        # Get existing gym info or create new
        if user_id not in gym_info:
            gym_info[user_id] = {}
        
        gym_info[user_id].update({
            'user_id': user_id,
            'focus': focus,
            'experience': experience,
            'updated_at': datetime.now().isoformat()
        })
        
        # Update bio if provided
        bio = data.get('bio')
        if bio is not None:
            if len(bio) > 200:
                return jsonify({'error': 'Bio must be 200 characters or less'}), 400
            gym_info[user_id]['bio'] = bio
        
        return jsonify({
            'message': 'Gym info saved successfully',
            'gym_info': gym_info[user_id]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/gym-info', methods=['GET'])
def get_gym_info():
    """Get user's gym preferences"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        if user_id in gym_info:
            return jsonify(gym_info[user_id]), 200
        else:
            return jsonify({'message': 'No gym info found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== POSTS/SESSIONS ENDPOINTS ====================

@app.route('/api/posts', methods=['POST'])
def create_post():
    """Create a new gym session post"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.json
        title = data.get('title')
        workout_type = data.get('workout_type')
        date_time = data.get('date_time')
        location = data.get('location')
        party_size = data.get('party_size')
        experience_level = data.get('experience_level')
        gender_preference = data.get('gender_preference')
        notes = data.get('notes')
        
        # Validation
        if not all([title, workout_type, date_time, location, party_size, experience_level]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get user info
        email = None
        for u in emails.values():
            if u['id'] == user_id:
                email = u['email']
                break
        
        post = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'username': email,
            'title': title,
            'workout_type': workout_type,
            'date_time': date_time,
            'location': location,
            'party_size': party_size,
            'experience_level': experience_level,
            'gender_preference': gender_preference,
            'notes': notes,
            'created_at': datetime.now().isoformat()
        }
        
        posts.append(post)
        
        return jsonify({
            'message': 'Post created successfully',
            'post': post
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Get all posts with optional filtering"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Check if user is verified (PRD requirement: unverified users cannot view posts)
        current_user = None
        for u in emails.values():
            if u['id'] == user_id:
                current_user = u
                break
        
        if not current_user or not current_user.get('verified', False):
            return jsonify({'error': 'Please verify your email to view posts'}), 403
        
        # Get filter parameters
        workout_type = request.args.get('workout_type')
        location = request.args.get('location')
        experience_level = request.args.get('experience_level')
        gender_preference = request.args.get('gender_preference')
        party_size = request.args.get('party_size')
        
        # Filter posts
        filtered_posts = posts.copy()
        
        if workout_type:
            filtered_posts = [p for p in filtered_posts if p['workout_type'].lower() == workout_type.lower()]
        if location:
            filtered_posts = [p for p in filtered_posts if location.lower() in p['location'].lower()]
        if experience_level:
            filtered_posts = [p for p in filtered_posts if p['experience_level'].lower() == experience_level.lower()]
        if gender_preference:
            filtered_posts = [p for p in filtered_posts if p.get('gender_preference', '').lower() == gender_preference.lower() or not p.get('gender_preference')]
        if party_size:
            filtered_posts = [p for p in filtered_posts if p['party_size'].lower() == party_size.lower()]
        
        # Filter out expired posts (optional - you might want to keep them)
        now = datetime.now()
        active_posts = []
        for post in filtered_posts:
            try:
                post_time = datetime.fromisoformat(post['date_time'].replace('Z', '+00:00'))
                if post_time > now:
                    active_posts.append(post)
            except:
                active_posts.append(post)  # Include if date parsing fails
        
        return jsonify({
            'posts': active_posts,
            'count': len(active_posts)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific post by ID"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        post = next((p for p in posts if p['id'] == post_id), None)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        return jsonify(post), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    """Update a post"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        global posts
        post = next((p for p in posts if p['id'] == post_id), None)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Only allow user to edit their own posts
        if post['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized to edit this post'}), 403
        
        data = request.json
        if 'title' in data:
            post['title'] = data['title']
        if 'workout_type' in data:
            post['workout_type'] = data['workout_type']
        if 'date_time' in data:
            post['date_time'] = data['date_time']
        if 'location' in data:
            post['location'] = data['location']
        if 'party_size' in data:
            post['party_size'] = data['party_size']
        if 'experience_level' in data:
            post['experience_level'] = data['experience_level']
        if 'gender_preference' in data:
            post['gender_preference'] = data['gender_preference']
        if 'notes' in data:
            post['notes'] = data['notes']
        
        post['updated_at'] = datetime.now().isoformat()
        
        return jsonify({
            'message': 'Post updated successfully',
            'post': post
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a post"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        global posts
        post = next((p for p in posts if p['id'] == post_id), None)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Only allow user to delete their own posts
        if post['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized to delete this post'}), 403
        
        posts = [p for p in posts if p['id'] != post_id]
        return jsonify({'message': 'Post deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/my-posts', methods=['GET'])
def get_my_posts():
    """Get current user's posts"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        my_posts = [p for p in posts if p['user_id'] == user_id]
        return jsonify({
            'posts': my_posts,
            'count': len(my_posts)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== USER ENDPOINTS ====================

@app.route('/api/user', methods=['GET'])
def get_user():
    """Get current user info"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Find user
        user = None
        for u in emails.values():
            if u['id'] == user_id:
                user = u.copy()
                del user['password_hash']  # Don't return password
                break
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Add gym info and bio
        user_gym_info = gym_info.get(user_id, {})
        user['bio'] = user_gym_info.get('bio', '')
        user['focus'] = user_gym_info.get('focus')
        user['experience'] = user_gym_info.get('experience')
        user['verified'] = user.get('verified', False)  # Include verification status
        
        return jsonify(user), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user', methods=['PUT'])
def update_user():
    """Update current user info"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.json
        
        # Find user
        user = None
        user_email = None
        for email_addr, u in emails.items():
            if u['id'] == user_id:
                user = u
                user_email = email_addr
                break
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update allowed fields
        if 'first_name' in data:
            user['first_name'] = data['first_name']
        if 'last_name' in data:
            user['last_name'] = data['last_name']
        if 'gender' in data:
            user['gender'] = data['gender']
        if 'age' in data:
            user['age'] = data['age']
        
        # Update bio in gym_info
        if 'bio' in data:
            bio = data['bio']
            if len(bio) > 200:
                return jsonify({'error': 'Bio must be 200 characters or less'}), 400
            if user_id not in gym_info:
                gym_info[user_id] = {}
            gym_info[user_id]['bio'] = bio
        
        user['updated_at'] = datetime.now().isoformat()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user', methods=['DELETE'])
def delete_account():
    """Delete current user account"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Find and remove user
        user_email = None
        for email_addr, u in emails.items():
            if u['id'] == user_id:
                user_email = email_addr
                break
        
        if user_email:
            del emails[user_email]
        
        # Remove gym info
        if user_id in gym_info:
            del gym_info[user_id]
        
        # Remove user's posts
        global posts
        posts = [p for p in posts if p['user_id'] != user_id]
        
        # Remove user's interest requests
        global interest_requests
        interest_requests = [r for r in interest_requests if r['sender_id'] != user_id and r['receiver_id'] != user_id]
        
        # Remove user sessions
        tokens_to_remove = [token for token, uid in user_sessions.items() if uid == user_id]
        for token in tokens_to_remove:
            del user_sessions[token]
        
        return jsonify({'message': 'Account deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== PROFILES ENDPOINTS ====================

@app.route('/api/profiles', methods=['GET'])
def get_profiles():
    """Get all user profiles with optional filtering"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Check if user is verified (PRD requirement: unverified users cannot view profiles)
        current_user = None
        for u in emails.values():
            if u['id'] == user_id:
                current_user = u
                break
        
        if not current_user or not current_user.get('verified', False):
            return jsonify({'error': 'Please verify your email to view profiles'}), 403
        
        # Get filter parameters
        gender = request.args.get('gender')
        experience_level = request.args.get('experience_level')
        focus = request.args.get('focus')
        age_min = request.args.get('age_min')
        age_max = request.args.get('age_max')
        same_gender_only = request.args.get('same_gender_only', 'false').lower() == 'true'
        
        # Get current user's gender for same-gender filter
        current_user_gender = None
        if same_gender_only:
            for email_addr, user_data in emails.items():
                if user_data['id'] == user_id:
                    current_user_gender = user_data.get('gender')
                    break
        
        # Build profiles from emails data (users stored by email)
        profiles_list = []
        for email_addr, user_data in emails.items():
            # Skip current user
            if user_data['id'] == user_id:
                continue
            
            # Get user's gym info if available
            user_gym_info = gym_info.get(user_data['id'], {})
            
            profile = {
                'id': user_data['id'],
                'username': email_addr.split('@')[0],  # Use email prefix as username
                'first_name': user_data.get('first_name', ''),
                'last_name': user_data.get('last_name', ''),
                'gender': user_data.get('gender'),
                'age': user_data.get('age'),
                'experience_level': user_gym_info.get('experience'),
                'focus': user_gym_info.get('focus'),
                'bio': user_gym_info.get('bio', ''),
            }
            
            # Apply filters
            if gender and profile['gender'] and profile['gender'] != gender:
                continue
            if same_gender_only and current_user_gender and profile['gender'] != current_user_gender:
                continue
            if experience_level and profile['experience_level'] and profile['experience_level'] != experience_level:
                continue
            if focus and profile['focus'] and profile['focus'] != focus:
                continue
            # Age range filter
            if age_min or age_max:
                try:
                    profile_age = int(profile['age']) if profile['age'] else None
                    if profile_age:
                        if age_min and profile_age < int(age_min):
                            continue
                        if age_max and profile_age > int(age_max):
                            continue
                except:
                    pass  # Skip age filter if age is not a number
            
            profiles_list.append(profile)
        
        return jsonify({
            'profiles': profiles_list,
            'count': len(profiles_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profiles/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    """Get a specific profile by ID"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Find user
        user = None
        for u in emails.values():
            if u['id'] == profile_id:
                user = u
                break
        
        if not user:
            return jsonify({'error': 'Profile not found'}), 404
        
        # Get gym info
        user_gym_info = gym_info.get(profile_id, {})
        
        profile = {
            'id': user['id'],
            'username': user.get('username', ''),
            'first_name': user.get('first_name', ''),
            'last_name': user.get('last_name', ''),
            'gender': user.get('gender'),
            'age': user.get('age'),
            'experience_level': user_gym_info.get('experience'),
            'focus': user_gym_info.get('focus'),
            'bio': user_gym_info.get('bio', ''),
        }
        
        return jsonify(profile), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profiles/interest', methods=['POST'])
def express_interest():
    """Express interest in a profile"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.json
        profile_id = data.get('profile_id')
        
        if not profile_id:
            return jsonify({'error': 'Profile ID required'}), 400
        
        if profile_id == user_id:
            return jsonify({'error': 'Cannot express interest in your own profile'}), 400
        
        # Check if request already exists
        existing = next((r for r in interest_requests if r['sender_id'] == user_id and r['receiver_id'] == profile_id and r['type'] == 'profile'), None)
        if existing:
            return jsonify({'error': 'Interest already expressed'}), 409
        
        # Create interest request
        request_id = str(uuid.uuid4())
        interest_request = {
            'id': request_id,
            'sender_id': user_id,
            'receiver_id': profile_id,
            'type': 'profile',  # 'profile' or 'post'
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
        interest_requests.append(interest_request)
        
        return jsonify({
            'message': 'Interest expressed successfully',
            'request_id': request_id,
            'status': 'pending'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/<post_id>/request', methods=['POST', 'OPTIONS'])
def request_to_join(post_id):
    """Request to join a gym session"""
    # Handle OPTIONS preflight - headers will be added by after_request
    if request.method == 'OPTIONS':
        response = jsonify({})
        # Explicitly set CORS headers for OPTIONS
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response, 200
    
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        if not post_id:
            return jsonify({'error': 'Post ID required'}), 400
        
        post = next((p for p in posts if p['id'] == post_id), None)
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        if post['user_id'] == user_id:
            return jsonify({'error': 'Cannot request to join your own post'}), 400
        
        # Check if request already exists (check by post_id in the request)
        existing = next((r for r in interest_requests if r['sender_id'] == user_id and r.get('post_id') == post_id and r['type'] == 'post'), None)
        if existing:
            return jsonify({'error': 'Request already sent'}), 409
        
        # Create join request
        request_id = str(uuid.uuid4())
        interest_request = {
            'id': request_id,
            'sender_id': user_id,
            'receiver_id': post['user_id'],
            'post_id': post_id,
            'type': 'post',
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
        interest_requests.append(interest_request)
        
        return jsonify({
            'message': 'Request to join sent successfully',
            'request_id': request_id,
            'status': 'pending'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/requests', methods=['GET'])
def get_requests():
    """Get interest/join requests for current user"""
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get requests where user is the receiver (all statuses for gym sessions)
        received_requests = []
        for r in interest_requests:
            if r['receiver_id'] == user_id:
                # For post requests, include all statuses; for profile requests, only pending
                if r.get('type') == 'post' or r.get('status') == 'pending':
                    request_data = r.copy()
                    # Add sender info
                    sender = None
                    for u in emails.values():
                        if u['id'] == r['sender_id']:
                            sender = u
                            break
                    if sender:
                        request_data['sender_name'] = f"{sender.get('first_name', '')} {sender.get('last_name', '')}".strip()
                        request_data['sender_email'] = sender.get('email', '')
                    
                    # Add post info if it's a post request
                    if r.get('type') == 'post' and r.get('post_id'):
                        post = next((p for p in posts if p['id'] == r['post_id']), None)
                        if post:
                            request_data['post_title'] = post.get('title', post.get('workout_type', 'Gym Session'))
                            request_data['post_date_time'] = post.get('date_time')
                            request_data['post_location'] = post.get('location')
                    
                    received_requests.append(request_data)
        
        # Get requests where user is the sender
        sent_requests = []
        for r in interest_requests:
            if r['sender_id'] == user_id:
                request_data = r.copy()
                # Add receiver info
                receiver = None
                for u in emails.values():
                    if u['id'] == r['receiver_id']:
                        receiver = u
                        break
                if receiver:
                    request_data['receiver_name'] = f"{receiver.get('first_name', '')} {receiver.get('last_name', '')}".strip()
                    request_data['receiver_email'] = receiver.get('email', '')
                
                # Add post info if it's a post request
                if r.get('type') == 'post' and r.get('post_id'):
                    post = next((p for p in posts if p['id'] == r['post_id']), None)
                    if post:
                        request_data['post_title'] = post.get('title', post.get('workout_type', 'Gym Session'))
                        request_data['post_date_time'] = post.get('date_time')
                        request_data['post_location'] = post.get('location')
                
                sent_requests.append(request_data)
        
        return jsonify({
            'received': received_requests,
            'sent': sent_requests
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/requests/<request_id>/respond', methods=['POST', 'OPTIONS'])
def respond_to_request(request_id):
    """Respond to an interest/join request (accept or reject)"""
    # Handle OPTIONS preflight - headers will be added by after_request
    if request.method == 'OPTIONS':
        response = jsonify({})
        # Explicitly set CORS headers for OPTIONS
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response, 200
    
    try:
        user_id = get_user_from_token()
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.json
        response_action = data.get('response')  # 'accept' or 'reject'
        
        if response_action not in ['accept', 'reject']:
            return jsonify({'error': 'Response must be "accept" or "reject"'}), 400
        
        if not request_id:
            return jsonify({'error': 'Request ID required'}), 400
        
        interest_request = next((r for r in interest_requests if r['id'] == request_id), None)
        
        if not interest_request:
            return jsonify({'error': 'Request not found'}), 404
        
        if interest_request['receiver_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        if interest_request['status'] != 'pending':
            return jsonify({'error': 'Request already responded to'}), 400
        
        # Update request status
        interest_request['status'] = 'accepted' if response_action == 'accept' else 'rejected'
        interest_request['responded_at'] = datetime.now().isoformat()
        
        # TODO: Send email notification if accepted
        if response_action == 'accept':
            # Get sender and receiver emails for notification
            sender_email = None
            receiver_email = None
            for u in emails.values():
                if u['id'] == interest_request['sender_id']:
                    sender_email = u['email']
                if u['id'] == interest_request['receiver_id']:
                    receiver_email = u['email']
            
            # TODO: Implement email sending (SendGrid, Resend, etc.)
            # For MVP, just log that notification would be sent
            print(f"TODO: Send email to {sender_email} and {receiver_email} about match")
        
        return jsonify({
            'message': f'Request {response_action}ed successfully',
            'request': interest_request
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'LiftLink API is running'
    }), 200

# ==================== ADMIN/DATA MANAGEMENT ====================

@app.route('/api/reset', methods=['POST'])
def reset_database():
    """Reset all in-memory data (development only)"""
    try:
        global emails, user_sessions, gym_info, posts, interest_requests, verification_tokens
        
        # Clear all data
        emails.clear()
        user_sessions.clear()
        gym_info.clear()
        posts.clear()
        interest_requests.clear()
        verification_tokens.clear()
        
        return jsonify({
            'message': 'Database reset successfully',
            'status': 'cleared'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset', methods=['OPTIONS'])
def reset_options():
    """Handle OPTIONS for reset endpoint"""
    return jsonify({}), 200

@app.route('/api/seed', methods=['POST'])
def seed_database():
    """Seed database with mock data (development only)"""
    try:
        global emails, gym_info, posts, interest_requests
        
        # Clear existing data first
        emails.clear()
        gym_info.clear()
        posts.clear()
        interest_requests.clear()
        
        # Mock users
        mock_users = [
            {
                'id': 'user1',
                'email': 'alice.smith@university.edu',
                'password_hash': hash_password('password123'),
                'first_name': 'Alice',
                'last_name': 'Smith',
                'gender': 'Female',
                'age': '20',
                'verified': True,
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'user2',
                'email': 'bob.jones@university.edu',
                'password_hash': hash_password('password123'),
                'first_name': 'Bob',
                'last_name': 'Jones',
                'gender': 'Male',
                'age': '22',
                'verified': True,
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'user3',
                'email': 'charlie.brown@university.edu',
                'password_hash': hash_password('password123'),
                'first_name': 'Charlie',
                'last_name': 'Brown',
                'gender': 'Male',
                'age': '21',
                'verified': True,
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'user4',
                'email': 'diana.prince@university.edu',
                'password_hash': hash_password('password123'),
                'first_name': 'Diana',
                'last_name': 'Prince',
                'gender': 'Female',
                'age': '23',
                'verified': True,
                'created_at': datetime.now().isoformat()
            },
            {
                'id': 'user5',
                'email': 'emma.wilson@university.edu',
                'password_hash': hash_password('password123'),
                'first_name': 'Emma',
                'last_name': 'Wilson',
                'gender': 'Female',
                'age': '19',
                'verified': False,  # Unverified user
                'created_at': datetime.now().isoformat()
            },
        ]
        
        # Add users to emails dict
        for user in mock_users:
            emails[user['email']] = user
        
        # Mock gym info
        gym_info_data = {
            'user1': {
                'user_id': 'user1',
                'focus': 'Cardio',
                'experience': 'Beginner',
                'bio': 'Love running and cycling! Looking for a workout buddy to stay motivated.',
                'updated_at': datetime.now().isoformat()
            },
            'user2': {
                'user_id': 'user2',
                'focus': 'Bodybuilding',
                'experience': 'Advance',
                'bio': 'Serious lifter, 5 years experience. Looking for a training partner for heavy lifting sessions.',
                'updated_at': datetime.now().isoformat()
            },
            'user3': {
                'user_id': 'user3',
                'focus': 'General fitness',
                'experience': 'Moderate',
                'bio': 'Just trying to stay active and healthy. Open to any workout type!',
                'updated_at': datetime.now().isoformat()
            },
            'user4': {
                'user_id': 'user4',
                'focus': 'Pilates',
                'experience': 'Expert',
                'bio': 'Pilates instructor and enthusiast. Happy to help beginners or work out with experienced practitioners.',
                'updated_at': datetime.now().isoformat()
            },
        }
        
        for user_id, info in gym_info_data.items():
            gym_info[user_id] = info
        
        # Mock posts
        now = datetime.now()
        
        mock_posts = [
            {
                'id': 'post1',
                'user_id': 'user1',
                'username': 'alice.smith@university.edu',
                'title': 'Morning Cardio Session',
                'workout_type': 'Cardio',
                'date_time': (now + timedelta(days=1, hours=8)).isoformat(),
                'location': 'University Recreation Center',
                'party_size': '2',
                'experience_level': 'Beginner',
                'gender_preference': 'Female',
                'notes': 'Looking for someone to join me for a 5K run around campus!',
                'created_at': (now - timedelta(hours=2)).isoformat()
            },
            {
                'id': 'post2',
                'user_id': 'user2',
                'username': 'bob.jones@university.edu',
                'title': 'Leg Day - Heavy Squats',
                'workout_type': 'Weight Training',
                'date_time': (now + timedelta(days=2, hours=14)).isoformat(),
                'location': 'Main Gym - Weight Room',
                'party_size': '1',
                'experience_level': 'Advance',
                'gender_preference': None,
                'notes': 'Need a spotter for heavy squats. Willing to spot in return!',
                'created_at': (now - timedelta(hours=5)).isoformat()
            },
            {
                'id': 'post3',
                'user_id': 'user3',
                'username': 'charlie.brown@university.edu',
                'title': 'Weekend Workout Group',
                'workout_type': 'General fitness',
                'date_time': (now + timedelta(days=3, hours=10)).isoformat(),
                'location': 'University Recreation Center',
                'party_size': '4',
                'experience_level': 'Moderate',
                'gender_preference': None,
                'notes': 'Casual workout session, all levels welcome!',
                'created_at': (now - timedelta(hours=1)).isoformat()
            },
            {
                'id': 'post4',
                'user_id': 'user4',
                'username': 'diana.prince@university.edu',
                'title': 'Pilates Class',
                'workout_type': 'Pilates',
                'date_time': (now + timedelta(days=1, hours=18)).isoformat(),
                'location': 'Yoga Studio - Room 201',
                'party_size': '3',
                'experience_level': 'Beginner',
                'gender_preference': 'Female',
                'notes': 'Leading a beginner-friendly Pilates session. Bring a mat!',
                'created_at': (now - timedelta(hours=3)).isoformat()
            },
        ]
        
        posts.extend(mock_posts)
        
        # Mock interest requests
        mock_requests = [
            {
                'id': 'req1',
                'sender_id': 'user2',
                'receiver_id': 'user1',
                'type': 'profile',
                'status': 'pending',
                'created_at': (now - timedelta(hours=1)).isoformat()
            },
            {
                'id': 'req2',
                'sender_id': 'user3',
                'receiver_id': 'user4',
                'post_id': 'post4',
                'type': 'post',
                'status': 'pending',
                'created_at': (now - timedelta(minutes=30)).isoformat()
            },
            {
                'id': 'req3',
                'sender_id': 'user2',
                'receiver_id': 'user1',
                'post_id': 'post1',
                'type': 'post',
                'status': 'pending',
                'created_at': (now - timedelta(hours=2)).isoformat()
            },
            {
                'id': 'req4',
                'sender_id': 'user3',
                'receiver_id': 'user1',
                'post_id': 'post1',
                'type': 'post',
                'status': 'pending',
                'created_at': (now - timedelta(minutes=45)).isoformat()
            },
            {
                'id': 'req5',
                'sender_id': 'user4',
                'receiver_id': 'user2',
                'post_id': 'post2',
                'type': 'post',
                'status': 'pending',
                'created_at': (now - timedelta(minutes=15)).isoformat()
            },
            {
                'id': 'req6',
                'sender_id': 'user1',
                'receiver_id': 'user3',
                'post_id': 'post3',
                'type': 'post',
                'status': 'pending',
                'created_at': (now - timedelta(minutes=20)).isoformat()
            },
        ]
        
        interest_requests.extend(mock_requests)
        
        return jsonify({
            'message': 'Database seeded successfully',
            'users_created': len(mock_users),
            'posts_created': len(mock_posts),
            'requests_created': len(mock_requests),
            'note': 'All users have password: password123'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seed', methods=['OPTIONS'])
def seed_options():
    """Handle OPTIONS for seed endpoint"""
    return jsonify({}), 200

if __name__ == '__main__':
    print("Starting LiftLink Backend Server...")
    print("API endpoints available at http://localhost:5001/api/")
    print("⚠️  WARNING: Using in-memory storage. Data will be lost on server restart.")
    app.run(debug=True, port=5001)
