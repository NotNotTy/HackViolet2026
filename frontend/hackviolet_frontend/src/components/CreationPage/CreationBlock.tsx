import './CreationBlock.css'
import { Page } from "../../types/page";
import Dropdown from "../../util/Dropdown";
import { useState } from "react";
import { authAPI } from "../../util/api";

interface CreationBlock {
    buttonText: string;
    setPage: (page: Page) => void;
}
function CreationBlock({buttonText, setPage} : CreationBlock) {
    const [gender, setGender] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!firstName || !lastName || !email || !password) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await authAPI.register({
                password,
                first_name: firstName,
                last_name: lastName,
                email,
                gender: gender || undefined,
                age: age || undefined,
            });
            // Navigate to gym info page after successful registration
            setPage(Page.GymInfo);
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className='creationblock'>
            <div className='creationcard'>
                <h1 id="createaccount"> Create Account </h1>
                {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                <div className="infoblock">
                <div className="leftblock">
                    <div className="input-group">
                        <p> First Name </p>
                        <input 
                            type="text" 
                            placeholder="Enter your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <p> Last Name </p>
                        <input 
                            type="text" 
                            placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                            <p> University Email </p>
                            <input 
                                type="email" 
                                placeholder="username@xxx.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                    </div>

                </div>
                <div className="rightblock">
                        <div className="input-group">
                            <p> Password </p>
                            <input 
                                type="password" 
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    <div className="input-group">
                        <p> Gender </p>
                        <Dropdown options={["Male","Female","Prefer not to answer"]} value={gender} onChange={setGender}/>
                    </div>
                    <div className="input-group">
                        <p> Age </p>
                        <input 
                            type="number" 
                            placeholder="Enter your age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                    </div>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : buttonText}
                </button>
            </div>
            <div>
            </div>
        </div>
        </>
    );

}
 



export default CreationBlock