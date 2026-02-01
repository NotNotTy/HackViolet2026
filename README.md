# LiftLink - HackViolet2026

A fitness partner matching application for college students to find compatible workout partners.

## Project Structure

- `frontend/` - React + TypeScript + Vite frontend application
- `backend/` - Flask REST API backend

## Quick Start

### Prerequisites
- Node.js and npm
- Python 3.8+

### Running the Application

#### 1. Start the Backend Server
Navigate to the 'backend' folder

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend will run on `http://localhost:xxxx`

#### 2. Start the Frontend

Open a new terminal and navigate to the 'hackviolet_frontend' folder

```bash
cd ..
cd ..
cd frontend/hackviolet_frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:xxxx`

Click on the front end link printed in the terminal

NOTE: some packages may not be installed on your local system (such as npm). Make sure to pip install those packages if missing.

## Features

### 1. **HomePage** - Landing page with app information
- Static content, no backend required

### 2. **LoginPage** - User authentication
- Login with username and password
- Navigate to account creation

### 3. **CreationPage** - User registration
- Create account with:
  - Username and password
  - First name, last name
  - University email
  - Gender and age
- Automatically navigates to gym info after registration

### 4. **GymInfoPage** - User preferences
- Set workout focus (Weight Loss, Muscle Gains, Cardio, Other)
- Set experience level (Beginner, Moderate, Advance, Expert)
- Saves preferences to backend

### 5. **PostPage** - Gym session management
- Create new gym session posts with:
  - Workout type
  - Date and time
  - Location
  - Party size
  - Experience level
  - Gender preference (optional)
  - Notes (optional)
- View and filter existing posts
- Real-time updates when new posts are created

## API Endpoints

See `backend/README.md` for detailed API documentation.

## Development

### Backend
- Built with Flask
- Uses in-memory storage (replace with database for production)
- CORS enabled for development

### Frontend
- React 19 with TypeScript
- Vite for fast development
- API integration via `src/util/api.ts`

## Notes

- Backend uses in-memory storage - data will be lost on server restart
- For production, implement proper database (PostgreSQL, MongoDB, etc.)
- Password hashing should be upgraded to bcrypt for production
- Add proper error handling and validation
