# LiftLink Backend API

Flask-based REST API for the LiftLink fitness partner matching application.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

The server will start on `http://localhost:5001`

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user info

### Gym Info
- `POST /api/gym-info` - Save user's gym preferences
- `GET /api/gym-info` - Get user's gym preferences

### Posts/Sessions
- `POST /api/posts` - Create a new gym session post
- `GET /api/posts` - Get all posts (with optional filters)
- `GET /api/posts/<post_id>` - Get a specific post
- `DELETE /api/posts/<post_id>` - Delete a post
- `GET /api/posts/my-posts` - Get current user's posts

### Health Check
- `GET /api/health` - Health check endpoint

## Request/Response Examples

### Register User
```json
POST /api/register
{
  "username": "johndoe",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@university.edu",
  "gender": "Male",
  "age": "20"
}
```

### Login
```json
POST /api/login
{
  "username": "johndoe",
  "password": "password123"
}
```

### Create Post
```json
POST /api/posts
Headers: { "Authorization": "<token>" }
{
  "workout_type": "Weight Training",
  "date_time": "2024-01-15T10:00:00",
  "location": "University Gym",
  "party_size": "1-on-1",
  "experience_level": "Beginner",
  "gender_preference": "Male",
  "notes": "Looking for a workout partner"
}
```

### Get Posts with Filters
```
GET /api/posts?workout_type=Weight Training&experience_level=Beginner
Headers: { "Authorization": "<token>" }
```

## Notes

- This backend uses in-memory storage. For production, replace with a database (PostgreSQL, MongoDB, etc.)
- Password hashing is simplified. Use bcrypt or similar in production.
- CORS is enabled for all origins. Restrict in production.
