import './LoginBlock.css'
import { Page } from "../../types/page";
import { useState } from "react";
import { authAPI } from "../../util/api";

interface LoginBlock {
    setPage: (page: Page) => void;
}
function LoginBlock({setPage} : LoginBlock) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await authAPI.login(username, password);
            // Navigate to post page after successful login
            setPage(Page.PostPage);
        } catch (err: any) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className='loginblock'>
            <div className='login'>
                <h1 id="signup"> Sign In </h1>
                {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                <div className="input-group">
                    <h1> Username </h1>
                    <input 
                        id="username" 
                        type="text" 
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                </div>

                <div className="input-group">
                    <h1> Password </h1>
                    <input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                </div>
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <span onClick={() => setPage(Page.CreateAccount)}>
                    Don't have an account? Sign up
                    </span>
            </div>
        </div>
        </>
    );

}
 



export default LoginBlock