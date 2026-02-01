from flask import Flask, request, jsonify
from datetime import datetime
import hashlib
import uuid
from typing import Dict, List, Optional

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
def options_handler(path=None):
    return jsonify({}), 200

# In-memory storage (replace with database in production)
emails: Dict[str, Dict] = {}
user_sessions: Dict[str, str] = {}  # token -> user_id
gym_info: Dict[str, Dict] = {}  # user_id -> gym preferences
posts: List[Dict] = []  # List of all posts/sessions

def hash_password(password: str) -> str:
    """Simple password hashing (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Generate a simple session token"""
    return str(uuid.uuid4())

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
        
        # Validate email is .edu domain
        if not email.endswith('.edu'):
            return jsonify({'error': 'Please use a valid .edu email address'}), 400
        
        # Check if user already exists
        if email in emails:
            return jsonify({'error': 'Account already exists'}), 409
        
        # Create user
        user_id = str(uuid.uuid4())
        emails[email] = {
            'id': user_id,
            'password_hash': hash_password(password),
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'gender': gender,
            'age': age,
            'created_at': datetime.now().isoformat()
        }
        
        # Generate session token
        token = generate_token()
        user_sessions[token] = user_id
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user_id': user_id,
            'email': email
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
        
        # Check if email exists
        if email_input not in emails:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        user_data = emails[email_input]
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
            'email': email_input
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
        
        gym_info[user_id] = {
            'user_id': user_id,
            'focus': focus,
            'experience': experience,
            'updated_at': datetime.now().isoformat()
        }
        
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
        workout_type = data.get('workout_type')
        date_time = data.get('date_time')
        location = data.get('location')
        party_size = data.get('party_size')
        experience_level = data.get('experience_level')
        gender_preference = data.get('gender_preference')
        notes = data.get('notes')
        
        # Validation
        if not all([workout_type, date_time, location, party_size, experience_level]):
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
        email = None
        for u in emails.values():
            if u['id'] == user_id:
                emails = u.copy()
                del emails['password_hash']  # Don't return password
                break
        
        if not emails:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(emails), 200
        
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
        
        # Get filter parameters
        gender = request.args.get('gender')
        experience_level = request.args.get('experience_level')
        focus = request.args.get('focus')
        
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
                'bio': '',  # TODO: Add bio field to user data
            }
            
            # Apply filters
            if gender and profile['gender'] != gender:
                continue
            if experience_level and profile['experience_level'] != experience_level:
                continue
            if focus and profile['focus'] != focus:
                continue
            
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
            'bio': '',  # TODO: Add bio field
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
        
        # TODO: Store interest requests in database
        # For now, just return success
        return jsonify({
            'message': 'Interest expressed successfully',
            'profile_id': profile_id
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

if __name__ == '__main__':
    print("Starting LiftLink Backend Server...")
    print("API endpoints available at http://localhost:5001/api/")
    app.run(debug=True, port=5001)
