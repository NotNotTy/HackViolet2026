import { useState, useEffect } from "react";
import { profilesAPI } from "../../util/api";
import './ProfilesFeed.css';

interface Profile {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    gender?: string;
    age?: string;
    experience_level?: string;
    focus?: string;
    bio?: string;
}

function ProfilesFeed() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({
        gender: "",
        experience_level: "",
        focus: "",
    });

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await profilesAPI.getProfiles(filters);
            setProfiles(data.profiles || []);
        } catch (err: any) {
            setError(err.message || "Failed to load profiles");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const applyFilters = () => {
        loadProfiles();
    };

    const clearFilters = () => {
        setFilters({
            gender: "",
            experience_level: "",
            focus: "",
        });
        setTimeout(() => loadProfiles(), 100);
    };

    const handleExpressInterest = async (profileId: string) => {
        try {
            await profilesAPI.expressInterest(profileId);
            alert("Interest expressed! The user will be notified.");
        } catch (err: any) {
            alert(err.message || "Failed to express interest");
        }
    };

    return (
        <div className="profiles-feed-container">
            <h2>Browse Profiles</h2>
            
            {/* Filters */}
            <div className="filters">
                <div className="filter-group">
                    <label>Gender</label>
                    <select
                        value={filters.gender}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to answer">Prefer not to answer</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Experience Level</label>
                    <select
                        value={filters.experience_level}
                        onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                    >
                        <option value="">All levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Advance">Advance</option>
                        <option value="Expert">Expert</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Fitness Focus</label>
                    <select
                        value={filters.focus}
                        onChange={(e) => handleFilterChange('focus', e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gains">Muscle Gains</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="filter-actions">
                    <button onClick={applyFilters}>Apply Filters</button>
                    <button onClick={clearFilters} className="clear-btn">Clear</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="loading">Loading profiles...</div>
            ) : profiles.length === 0 ? (
                <div className="no-profiles">
                    <p>No profiles found. Be the first to create one!</p>
                    <p className="hint">Profiles will appear here once users complete their registration.</p>
                </div>
            ) : (
                <div className="profiles-grid">
                    {profiles.map((profile) => (
                        <div key={profile.id} className="profile-card">
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    {profile.first_name?.[0] || 'U'}
                                </div>
                                <div className="profile-name">
                                    <h3>{profile.first_name} {profile.last_name}</h3>
                                    <span className="profile-username">@{profile.username}</span>
                                </div>
                            </div>
                            <div className="profile-details">
                                {profile.gender && (
                                    <p><strong>Gender:</strong> {profile.gender}</p>
                                )}
                                {profile.age && (
                                    <p><strong>Age:</strong> {profile.age}</p>
                                )}
                                {profile.experience_level && (
                                    <p><strong>Experience:</strong> {profile.experience_level}</p>
                                )}
                                {profile.focus && (
                                    <p><strong>Focus:</strong> {profile.focus}</p>
                                )}
                                {profile.bio && (
                                    <p className="profile-bio">{profile.bio}</p>
                                )}
                            </div>
                            <button 
                                className="express-interest-btn"
                                onClick={() => handleExpressInterest(profile.id)}
                            >
                                Express Interest
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProfilesFeed;
