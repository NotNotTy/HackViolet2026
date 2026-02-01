import './CreationBlock.css'
import { Page } from "../../types/page";
import Dropdown from "../../util/Dropdown";
import { useState } from "react";

interface CreationBlock {
    buttonText: string;
    setPage: (page: Page) => void;
}
function CreationBlock({buttonText, setPage} : CreationBlock) {
    const [role, setRole] = useState("");
    return (
        <>
        <div className='creationblock'>
            <div className='creationcard'>
                <h1 id="createaccount"> Create Account </h1>
                <div className="infoblock">
                <div className="leftblock">
                    <div className="input-group">
                        <p> First Name </p>
                        <input type="text" placeholder="Enter your first name" />
                    </div>
                    <div className="input-group">
                        <p> Last Name </p>
                    <input  type="password" placeholder="Enter your last name" />
                    </div>
                    <div className="input-group">
                        <p> University Email </p>
                    <input  type="password" placeholder="username@xxx.edu" />
                    </div>
                </div>
                <div className="rightblock">
                    <div className="input-group">
                        <p> Gender </p>
                        <Dropdown label="Role" options={["Male","Female","Prefer not to answer"]} value={role} onChange={setRole}/>
                    </div>
                    <div className="input-group">
                        <p> Age </p>
                    <input  type="password" placeholder="Enter your age" />
                    </div>

                    </div>
                </div>
                <button onClick={() => setPage(Page.GymInfo)}>{buttonText}</button>
            </div>
            <div>
            </div>
        </div>
        </>
    );

}
 



export default CreationBlock