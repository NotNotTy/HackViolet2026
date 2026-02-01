import './GymInfoBlock.css'
import { Page } from "../../types/page";
import Dropdown from "../../util/Dropdown";
import { useState } from "react";
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

    const handleSave = async () => {
        if (!focus || !experience) {
            setError("Please select both focus and experience level");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await gymInfoAPI.saveGymInfo(focus, experience);
            // Navigate to post page after saving
            setPage(Page.PostPage);
        } catch (err: any) {
            setError(err.message || "Failed to save gym info. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className='gymblock'>
            <div className='gymcard'>
                <h1 id="header"> Gym Information </h1>
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