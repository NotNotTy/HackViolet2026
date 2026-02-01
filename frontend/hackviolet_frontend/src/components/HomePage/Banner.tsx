import "./Banner.css"
import logo from "../../app/assets/liftLogo.png"
import { Page } from "../../types/page";
import { getAuthToken } from "../../util/api";

interface Banner {
    setPage: (page: Page) => void;
    text: string;
}
function Banner({setPage, text} : Banner) {
    const isLoggedIn = !!getAuthToken();
    
    return (
        <>
        <div className="banner">
            <div className="banner-left">
            <button onClick={() => setPage(Page.Home)}>
                    <img src={logo} alt="Company Logo"></img>
                </button>
                
            </div>
            <div className="banner-center">
                <h2>{text}</h2>
            </div>
            <div className="banner-right">
                {isLoggedIn && (
                    <button 
                        className="profile-button"
                        onClick={() => setPage(Page.GymInfo)}
                        title="Profile Settings"
                    >
                        Profile
                    </button>
                )}
            </div>
        
            
        </div>
        

        </>
    );

}
 



export default Banner