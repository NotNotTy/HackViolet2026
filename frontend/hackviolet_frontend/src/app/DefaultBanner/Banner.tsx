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
        <div className="defaultbanner">
            <div className="defaultbanner-left">
            <button onClick={() => setPage(Page.Home)}>
                    <h2>{text}</h2>
                    <img src={logo} alt="Company Logo"></img>
                </button>
            </div>

                
            
            <div className="defaultbanner-center">
               
            </div>
            <div className="defaultbanner-right">
                {isLoggedIn && (
                    <button 
                        className="defaultprofile-button"
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