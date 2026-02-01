import { useState, useEffect } from "react";
import { postsAPI, requestsAPI, authAPI } from "../../util/api";
import './PostList.css';

interface Post {
    id: string;
    user_id: string;
    username: string;
    title?: string;
    workout_type: string;
    date_time: string;
    location: string;
    party_size: string;
    experience_level: string;
    gender_preference?: string;
    notes?: string;
    created_at: string;
}

interface PostListProps {
    refreshTrigger?: number;
}

function PostList({ refreshTrigger }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [filters, setFilters] = useState({
        workout_type: "",
        location: "",
        experience_level: "",
        gender_preference: "",
        party_size: "",
    });

    const loadPosts = async () => {
        setLoading(true);
        setError("");
        try {
            const filtersToSend: any = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value) filtersToSend[key] = value;
            });
            
            const data = await postsAPI.getPosts(filtersToSend);
            setPosts(data.posts || []);
        } catch (err: any) {
            setError(err.message || "Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
        // Get current user ID
        const getUser = async () => {
            try {
                const userData = await authAPI.getCurrentUser();
                if (userData && userData.id) {
                    setCurrentUserId(userData.id);
                }
            } catch (err) {
                console.log("Could not get current user");
            }
        };
        getUser();
    }, [refreshTrigger]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const applyFilters = () => {
        loadPosts();
    };

    const clearFilters = () => {
        setFilters({
            workout_type: "",
            location: "",
            experience_level: "",
            gender_preference: "",
            party_size: "",
        });
        setTimeout(() => loadPosts(), 100);
    };

    const formatDateTime = (dateTime: string) => {
        try {
            const date = new Date(dateTime);
            return date.toLocaleString();
        } catch {
            return dateTime;
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            return;
        }
        try {
            await postsAPI.deletePost(postId);
            loadPosts();
        } catch (err: any) {
            alert(err.message || "Failed to delete post");
        }
    };

    const handleRequestToJoin = async (postId: string) => {
        try {
            await requestsAPI.requestToJoin(postId);
            alert("Request to join sent! The post owner will be notified.");
        } catch (err: any) {
            alert(err.message || "Failed to send request");
        }
    };

    const handleEditPost = async (post: Post, updatedData: Partial<Post>) => {
        try {
            await postsAPI.updatePost(post.id, updatedData);
            setEditingPost(null);
            loadPosts();
            alert("Post updated successfully!");
        } catch (err: any) {
            alert(err.message || "Failed to update post");
        }
    };

    return (
        <div className="post-list-container">
            <h2>Available Gym Sessions</h2>
            
            {/* Filters */}
            <div className="filters">
                <div className="filter-group">
                    <label>Workout Type</label>
                    <input
                        type="text"
                        placeholder="Filter by workout type"
                        value={filters.workout_type}
                        onChange={(e) => handleFilterChange('workout_type', e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>Location</label>
                    <input
                        type="text"
                        placeholder="Filter by location"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
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
                    <label>Party Size</label>
                    <select
                        value={filters.party_size}
                        onChange={(e) => handleFilterChange('party_size', e.target.value)}
                    >
                        <option value="">All sizes</option>
                        <option value="1-on-1">1-on-1</option>
                        <option value="Small Group (2-3)">Small Group (2-3)</option>
                        <option value="Group (4+)">Group (4+)</option>
                    </select>
                </div>
                <div className="filter-actions">
                    <button onClick={applyFilters}>Apply Filters</button>
                    <button onClick={clearFilters} className="clear-btn">Clear</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="loading">Loading posts...</div>
            ) : posts.length === 0 ? (
                <div className="no-posts">No posts found. Be the first to create one!</div>
            ) : (
                <div className="posts-grid">
                    {posts.map((post) => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <h3>{post.title || post.workout_type}</h3>
                                <span className="post-author">by {post.username}</span>
                            </div>
                            {editingPost?.id === post.id ? (
                                <EditPostForm 
                                    post={post} 
                                    onSave={(data) => handleEditPost(post, data)}
                                    onCancel={() => setEditingPost(null)}
                                />
                            ) : (
                                <>
                                    <div className="post-details">
                                        {post.title && <p><strong>Title:</strong> {post.title}</p>}
                                        <p><strong>Workout Type:</strong> {post.workout_type}</p>
                                        <p><strong>When:</strong> {formatDateTime(post.date_time)}</p>
                                        <p><strong>Where:</strong> {post.location}</p>
                                        <p><strong>Party Size:</strong> {post.party_size}</p>
                                        <p><strong>Experience Level:</strong> {post.experience_level}</p>
                                        {post.gender_preference && (
                                            <p><strong>Gender Preference:</strong> {post.gender_preference}</p>
                                        )}
                                        {post.notes && (
                                            <p><strong>Notes:</strong> {post.notes}</p>
                                        )}
                                    </div>
                                    <div className="post-actions">
                                        {currentUserId === post.user_id ? (
                                            <>
                                                <button onClick={() => setEditingPost(post)} className="edit-btn">Edit</button>
                                                <button onClick={() => handleDeletePost(post.id)} className="delete-btn">Delete</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleRequestToJoin(post.id)} className="request-btn">Request to Join</button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

interface EditPostFormProps {
    post: Post;
    onSave: (data: Partial<Post>) => void;
    onCancel: () => void;
}

function EditPostForm({ post, onSave, onCancel }: EditPostFormProps) {
    const [title, setTitle] = useState(post.title || "");
    const [workoutType, setWorkoutType] = useState(post.workout_type);
    const [dateTime, setDateTime] = useState(post.date_time);
    const [location, setLocation] = useState(post.location);
    const [partySize, setPartySize] = useState(post.party_size);
    const [experienceLevel, setExperienceLevel] = useState(post.experience_level);
    const [genderPreference, setGenderPreference] = useState(post.gender_preference || "");
    const [notes, setNotes] = useState(post.notes || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title: title || undefined,
            workout_type: workoutType,
            date_time: dateTime,
            location: location,
            party_size: partySize,
            experience_level: experienceLevel,
            gender_preference: genderPreference || undefined,
            notes: notes || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
                type="text"
                placeholder="Workout Type"
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <select
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
                <option value="1">1 person</option>
                <option value="2">2 people</option>
                <option value="3">3 people</option>
                <option value="4">4 people</option>
                <option value="5">5 people</option>
            </select>
            <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
                <option value="Beginner">Beginner</option>
                <option value="Moderate">Moderate</option>
                <option value="Advance">Advance</option>
                <option value="Expert">Expert</option>
            </select>
            <select
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
                <option value="">No preference</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
            <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Save
                </button>
                <button type="button" onClick={onCancel} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default PostList;
