import './LoginBlock.css'
import { Page } from "../../types/page";

interface LoginBlock {
    setPage: (page: Page) => void;
}
function LoginBlock({setPage} : LoginBlock) {
    return (
        <>
        <div className='loginblock'>
            <div className='login'>
                <h1 id="signup"> Sign Up </h1>
                <div className="input-group">
                    <h1> Username </h1>
                    <input id="username" type="text" placeholder="Enter your username" />
                </div>

                <div className="input-group">
                    <h1> Password </h1>
                    <input id="password" type="password" placeholder="Enter your password" />
                </div>
                <button>
                    Login
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