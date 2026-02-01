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
        age_min: "",
        age_max: "",
        same_gender_only: false,
    });

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setLoading(true);
        setError("");
        try {
            const filtersToSend: any = {};
            if (filters.gender) filtersToSend.gender = filters.gender;
            if (filters.experience_level) filtersToSend.experience_level = filters.experience_level;
            if (filters.focus) filtersToSend.focus = filters.focus;
            if (filters.age_min) filtersToSend.age_min = filters.age_min;
            if (filters.age_max) filtersToSend.age_max = filters.age_max;
            if (filters.same_gender_only) filtersToSend.same_gender_only = 'true';
            
            const data = await profilesAPI.getProfiles(filtersToSend);
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

    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

    const applyFilters = () => {
        loadProfiles();
    };

    const clearFilters = () => {
        setFilters({
            gender: "",
            experience_level: "",
            focus: "",
            age_min: "",
            age_max: "",
            same_gender_only: false,
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
                        <option value="Bodybuilding">Bodybuilding</option>
                        <option value="Powerlifting">Powerlifting</option>
                        <option value="Pilates">Pilates</option>
                        <option value="Cardio">Cardio</option>
                        <option value="General fitness">General fitness</option>
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gains">Muscle Gains</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Age Min</label>
                    <input
                        type="number"
                        min="18"
                        placeholder="Min age"
                        value={filters.age_min}
                        onChange={(e) => handleFilterChange('age_min', e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>Age Max</label>
                    <input
                        type="number"
                        min="18"
                        placeholder="Max age"
                        value={filters.age_max}
                        onChange={(e) => handleFilterChange('age_max', e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.same_gender_only}
                            onChange={(e) => setFilters({ ...filters, same_gender_only: e.target.checked })}
                        />
                        Same gender only
                    </label>
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
                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <button 
                                    className="express-interest-btn"
                                    style={{ flex: 1 }}
                                    onClick={() => handleExpressInterest(profile.id)}
                                >
                                    Express Interest
                                </button>
                                <button 
                                    className="view-profile-btn"
                                    style={{ 
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedProfile(profile)}
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Profile Modal */}
            {selectedProfile && (
                <div className="profile-modal-overlay" onClick={() => setSelectedProfile(null)}>
                    <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-modal-header">
                            <h2>{selectedProfile.first_name} {selectedProfile.last_name}</h2>
                            <button onClick={() => setSelectedProfile(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div className="profile-modal-content">
                            <div className="profile-avatar-large">
                                {selectedProfile.first_name?.[0] || 'U'}
                            </div>
                            <div className="profile-details-full">
                                <p><strong>Username:</strong> @{selectedProfile.username}</p>
                                {selectedProfile.gender && <p><strong>Gender:</strong> {selectedProfile.gender}</p>}
                                {selectedProfile.age && <p><strong>Age:</strong> {selectedProfile.age}</p>}
                                {selectedProfile.experience_level && <p><strong>Experience Level:</strong> {selectedProfile.experience_level}</p>}
                                {selectedProfile.focus && <p><strong>Fitness Focus:</strong> {selectedProfile.focus}</p>}
                                {selectedProfile.bio && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                                        <strong>Bio:</strong>
                                        <p style={{ marginTop: '0.5rem' }}>{selectedProfile.bio}</p>
                                    </div>
                                )}
                            </div>
                            <button 
                                className="express-interest-btn"
                                onClick={() => {
                                    handleExpressInterest(selectedProfile.id);
                                    setSelectedProfile(null);
                                }}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                Express Interest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfilesFeed;
