import './GymInfoBlock.css'
import { Page } from "../../types/page";
import Dropdown from "../../util/Dropdown";
import { useState, useEffect } from "react";
import { gymInfoAPI } from "../../util/api";

interface GymInfoBlock {
    buttonText: string;
    setPage: (page: Page) => void;
}
function GymInfoBlock({buttonText, setPage} : GymInfoBlock) {
    const [focus, setFocus] = useState("");
    const [experience, setExperience] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Load existing gym info when component mounts
    useEffect(() => {
        const loadGymInfo = async () => {
            try {
                const data = await gymInfoAPI.getGymInfo();
                if (data.focus) setFocus(data.focus);
                if (data.experience) setExperience(data.experience);
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

        setLoading(true);
        setError("");
        try {
            await gymInfoAPI.saveGymInfo(focus, experience);
            // Show success message and stay on profile page
            setError(""); // Clear any previous errors
            alert("Profile updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to save gym info. Please try again.");
        } finally {
            setLoading(false);
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
                <button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : buttonText}
                </button>
            </div>
        </div>
        </>
    );

}
 



export default GymInfoBlock