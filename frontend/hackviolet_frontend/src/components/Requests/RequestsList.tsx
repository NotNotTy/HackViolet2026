import { useState, useEffect } from "react";
import { requestsAPI } from "../../util/api";
import './RequestsList.css';

interface Request {
    id: string;
    sender_id: string;
    receiver_id: string;
    type: 'profile' | 'post';
    status: 'pending' | 'accepted' | 'rejected';
    post_id?: string;
    post_title?: string;
    post_date_time?: string;
    post_location?: string;
    sender_name?: string;
    sender_email?: string;
    receiver_name?: string;
    receiver_email?: string;
    created_at: string;
    responded_at?: string;
}

function RequestsList() {
    const [requests, setRequests] = useState<{ received: Request[]; sent: Request[] }>({ received: [], sent: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    const loadRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await requestsAPI.getRequests();
            setRequests({
                received: data.received || [],
                sent: data.sent || []
            });
        } catch (err: any) {
            setError(err.message || "Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleRespond = async (requestId: string, response: 'accept' | 'reject') => {
        try {
            await requestsAPI.respondToRequest(requestId, response);
            loadRequests(); // Reload to show updated status
        } catch (err: any) {
            alert(err.message || "Failed to respond to request");
        }
    };

    const formatDateTime = (dateTime: string) => {
        try {
            const date = new Date(dateTime);
            return date.toLocaleString();
        } catch {
            return dateTime;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusClass = status === 'accepted' ? 'status-accepted' : 
                           status === 'rejected' ? 'status-rejected' : 
                           'status-pending';
        return <span className={`status-badge ${statusClass}`}>{status}</span>;
    };

    const displayRequests = activeTab === 'received' ? requests.received : requests.sent;
    const postRequests = displayRequests.filter(r => r.type === 'post');
    const profileRequests = displayRequests.filter(r => r.type === 'profile');

    return (
        <div className="requests-container">
            <h2>Requests</h2>
            
            {/* Tabs */}
            <div className="requests-tabs">
                <button
                    className={`request-tab ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => setActiveTab('received')}
                >
                    Received ({requests.received.filter(r => r.type === 'post').length})
                </button>
                <button
                    className={`request-tab ${activeTab === 'sent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sent')}
                >
                    Sent ({requests.sent.filter(r => r.type === 'post').length})
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="loading">Loading requests...</div>
            ) : (
                <div className="requests-content">
                    {/* Gym Session Requests */}
                    {postRequests.length > 0 && (
                        <div className="requests-section">
                            <h3>Gym Session Requests</h3>
                            <div className="requests-grid">
                                {postRequests.map((request) => (
                                    <div key={request.id} className="request-card">
                                        <div className="request-header">
                                            <h4>{request.post_title || 'Gym Session'}</h4>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <div className="request-details">
                                            {activeTab === 'received' ? (
                                                <>
                                                    <p><strong>From:</strong> {request.sender_name || 'Unknown User'}</p>
                                                    {request.post_date_time && (
                                                        <p><strong>Session Date:</strong> {formatDateTime(request.post_date_time)}</p>
                                                    )}
                                                    {request.post_location && (
                                                        <p><strong>Location:</strong> {request.post_location}</p>
                                                    )}
                                                    <p><strong>Requested:</strong> {formatDateTime(request.created_at)}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p><strong>To:</strong> {request.receiver_name || 'Unknown User'}</p>
                                                    {request.post_date_time && (
                                                        <p><strong>Session Date:</strong> {formatDateTime(request.post_date_time)}</p>
                                                    )}
                                                    {request.post_location && (
                                                        <p><strong>Location:</strong> {request.post_location}</p>
                                                    )}
                                                    <p><strong>Sent:</strong> {formatDateTime(request.created_at)}</p>
                                                    {request.responded_at && (
                                                        <p><strong>Response:</strong> {formatDateTime(request.responded_at)}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {activeTab === 'received' && request.status === 'pending' && (
                                            <div className="request-actions">
                                                <button
                                                    onClick={() => handleRespond(request.id, 'accept')}
                                                    className="accept-btn"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(request.id, 'reject')}
                                                    className="reject-btn"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Profile Interest Requests */}
                    {profileRequests.length > 0 && (
                        <div className="requests-section">
                            <h3>Profile Interest Requests</h3>
                            <div className="requests-grid">
                                {profileRequests.map((request) => (
                                    <div key={request.id} className="request-card">
                                        <div className="request-header">
                                            <h4>Profile Interest</h4>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <div className="request-details">
                                            {activeTab === 'received' ? (
                                                <>
                                                    <p><strong>From:</strong> {request.sender_name || 'Unknown User'}</p>
                                                    <p><strong>Requested:</strong> {formatDateTime(request.created_at)}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p><strong>To:</strong> {request.receiver_name || 'Unknown User'}</p>
                                                    <p><strong>Sent:</strong> {formatDateTime(request.created_at)}</p>
                                                    {request.responded_at && (
                                                        <p><strong>Response:</strong> {formatDateTime(request.responded_at)}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {activeTab === 'received' && request.status === 'pending' && (
                                            <div className="request-actions">
                                                <button
                                                    onClick={() => handleRespond(request.id, 'accept')}
                                                    className="accept-btn"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(request.id, 'reject')}
                                                    className="reject-btn"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {displayRequests.length === 0 && (
                        <div className="no-requests">
                            {activeTab === 'received' 
                                ? "No requests received yet." 
                                : "You haven't sent any requests yet."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default RequestsList;
