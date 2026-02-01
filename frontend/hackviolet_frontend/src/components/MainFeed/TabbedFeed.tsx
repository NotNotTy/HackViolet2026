import { useState } from 'react';
import ProfilesFeed from '../ProfilesFeed/ProfilesFeed';
import PostList from '../PostPage/PostList';
import PostCreation from '../PostPage/PostCreation';
import RequestsList from '../Requests/RequestsList';
import './TabbedFeed.css';

type TabType = 'profiles' | 'sessions' | 'requests';

interface TabbedFeedProps {
    refreshTrigger?: number;
}

function TabbedFeed({ refreshTrigger }: TabbedFeedProps) {
    const [activeTab, setActiveTab] = useState<TabType>('sessions');
    const [postRefreshTrigger, setPostRefreshTrigger] = useState(0);

    const handlePostCreated = () => {
        setPostRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="tabbed-feed-container">
            {/* Tabs */}
            <div className="feed-tabs">
                <button
                    className={`tab-button ${activeTab === 'profiles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profiles')}
                >
                    Profiles
                </button>
                <button
                    className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sessions')}
                >
                    Gym Sessions
                </button>
                <button
                    className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Requests
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'profiles' && (
                    <div className="profiles-tab">
                        <ProfilesFeed />
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="sessions-tab">
                        <PostCreation onPostCreated={handlePostCreated} />
                        <PostList refreshTrigger={postRefreshTrigger} />
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="requests-tab">
                        <RequestsList />
                    </div>
                )}
            </div>
        </div>
    );
}

export default TabbedFeed;
