import './GymInfoBlock.css'
import { Page } from "../../types/page";
import Dropdown from "../../util/Dropdown";
import { useState, useEffect } from "react";
import { gymInfoAPI, authAPI } from "../../util/api";

interface GymInfoBlock {
    buttonText: string;
    setPage: (page: Page) => void;
}
function GymInfoBlock({buttonText, setPage} : GymInfoBlock) {
    const [focus, setFocus] = useState("");
    const [experience, setExperience] = useState("");
    const [bio, setBio] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Load existing gym info when component mounts
    useEffect(() => {
        const loadGymInfo = async () => {
            try {
                const data = await gymInfoAPI.getGymInfo();
                if (data.focus) setFocus(data.focus);
                if (data.experience) setExperience(data.experience);
                if (data.bio) setBio(data.bio);
            } catch (err: any) {
                // If no gym info exists, that's okay - user can set it up
                console.log("No existing gym info found");
            } finally {
                setLoadingData(false);
            }
        };
        loadGymInfo();
    }, []);

    const handleSave = async () => {
        if (!focus || !experience) {
            setError("Please select both focus and experience level");
            return;
        }

        if (bio && bio.length > 200) {
            setError("Bio must be 200 characters or less");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await gymInfoAPI.saveGymInfo(focus, experience, bio || undefined);
            // Show success message and stay on profile page
            setError(""); // Clear any previous errors
            alert("Profile updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to save gym info. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        setLoading(true);
        setError("");
        try {
            const { userAPI } = await import("../../util/api");
            await userAPI.deleteAccount();
            authAPI.logout();
            setPage(Page.Home);
            alert("Account deleted successfully");
        } catch (err: any) {
            setError(err.message || "Failed to delete account. Please try again.");
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loadingData) {
        return (
            <div className='gymblock'>
                <div className='gymcard'>
                    <h1 id="header">Profile Settings</h1>
                    <div>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className='gymblock'>
            <div className='gymcard'>
                <h1 id="header">Profile Settings</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="input-group">
                    <h1> What do you plan to focus on? </h1>
                    <Dropdown  options={["Weight Loss","Muscle Gains","Cardio", "Other"]} value={focus} onChange={setFocus}/>
                </div>

                <div className="input-group">
                    <h1> What's your experience level? </h1>
                    <Dropdown options={["Beginner","Moderate","Advance", "Expert"]} value={experience} onChange={setExperience}/>
                </div>
                <div className="input-group">
                    <h1> Bio (Optional, max 200 characters) </h1>
                    <textarea
                        placeholder="Tell others about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={200}
                        rows={4}
                        style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit', fontSize: '1rem' }}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                        {bio.length}/200 characters
                    </p>
                </div>
                <button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : buttonText}
                </button>
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ fontSize: '1rem', color: '#dc2626', marginBottom: '1rem' }}>Danger Zone</h2>
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{ 
                            backgroundColor: '#dc2626', 
                            color: 'white', 
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Delete Account
                    </button>
                    {showDeleteConfirm && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee', borderRadius: '6px' }}>
                            <p style={{ marginBottom: '1rem', color: '#c33' }}>Are you sure? This cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={handleDeleteAccount} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                    Yes, Delete
                                </button>
                                <button onClick={() => setShowDeleteConfirm(false)} style={{ backgroundColor: '#6b7280', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );

}
 



export default GymInfoBlock