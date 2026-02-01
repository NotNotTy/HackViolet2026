import { useState } from "react";
import { postsAPI } from "../../util/api";
import './PostCreation.css';

interface PostCreation {
    onPostCreated?: () => void;
}

function PostCreation({ onPostCreated }: PostCreation) {
    const [title, setTitle] = useState("");
    const [workoutType, setWorkoutType] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [location, setLocation] = useState("");
    const [partySize, setPartySize] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [genderPreference, setGenderPreference] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title || !workoutType || !dateTime || !location || !partySize || !experienceLevel) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);
        
        try {
            await postsAPI.createPost({
                title: title,
                workout_type: workoutType,
                date_time: dateTime,
                location: location,
                party_size: partySize,
                experience_level: experienceLevel,
                gender_preference: genderPreference || undefined,
                notes: notes || undefined,
            });
            
            setSuccess(true);
            // Reset form
            setTitle("");
            setWorkoutType("");
            setDateTime("");
            setLocation("");
            setPartySize("");
            setExperienceLevel("");
            setGenderPreference("");
            setNotes("");
            
            if (onPostCreated) {
                onPostCreated();
            }
            
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to create post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-creation">
            <h2>Create a Gym Session</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Post created successfully!</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title *</label>
                    <input
                        type="text"
                        placeholder="e.g., Morning Cardio Session"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Workout Type *</label>
                    <input
                        type="text"
                        placeholder="e.g., Weight Training, Cardio, Yoga"
                        value={workoutType}
                        onChange={(e) => setWorkoutType(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Date & Time *</label>
                    <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Location *</label>
                    <input
                        type="text"
                        placeholder="Gym name or location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Party Size *</label>
                    <select
                        value={partySize}
                        onChange={(e) => setPartySize(e.target.value)}
                        required
                    >
                        <option value="">Select party size</option>
                        <option value="1">1 person</option>
                        <option value="2">2 people</option>
                        <option value="3">3 people</option>
                        <option value="4">4 people</option>
                        <option value="5">5 people</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Experience Level *</label>
                    <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        required
                    >
                        <option value="">Select experience level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Advance">Advance</option>
                        <option value="Expert">Expert</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Gender Preference (Optional)</label>
                    <select
                        value={genderPreference}
                        onChange={(e) => setGenderPreference(e.target.value)}
                    >
                        <option value="">No preference</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Notes (Optional)</label>
                    <textarea
                        placeholder="Additional information about the session"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}

export default PostCreation;
