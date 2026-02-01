import { useState, useEffect } from "react";
import { postsAPI } from "../../util/api";
import './PostList.css';

interface Post {
    id: string;
    username: string;
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
                                <h3>{post.workout_type}</h3>
                                <span className="post-author">by {post.username}</span>
                            </div>
                            <div className="post-details">
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PostList;
