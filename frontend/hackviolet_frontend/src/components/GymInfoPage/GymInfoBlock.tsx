import './GymInfoBlock.css'
import { Page } from "../../types/page";
import Dropdown from "../../util/Dropdown";
import { useState } from "react";

interface GymInfoBlock {
    buttonText: string;
    setPage: (page: Page) => void;
}
function GymInfoBlock({buttonText, setPage} : GymInfoBlock) {
    const [focus, setFocus] = useState("");
    const [experience, setExperience] = useState("");
    return (
        <>
        <div className='gymblock'>
            <div className='gymcard'>
                <h1 id="header"> Gym Information </h1>
                <div className="input-group">
                    <h1> What do you plan to focus on? </h1>
                    <Dropdown  options={["Weight Loss","Muscle Gains","Cardio", "Other"]} value={focus} onChange={setFocus}/>
                </div>

                <div className="input-group">
                    <h1> What's your experience level? </h1>
                    <Dropdown options={["Beginner","Moderate","Advance", "Expert"]} value={experience} onChange={setExperience}/>
                </div>
                <button onClick={() => setPage(Page.PostPage)}>{buttonText}</button>
            </div>
        </div>
        </>
    );

}
 



export default GymInfoBlock