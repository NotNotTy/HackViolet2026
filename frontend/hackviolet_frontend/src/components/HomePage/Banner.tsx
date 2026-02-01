import "./Banner.css"
import logo from "../../app/assets/liftLogo.png"
interface Banner {
    logo_path: string;
    text: string;
}
function Banner({logo_path, text} : Banner) {
    return (
        <>
        <div className="banner">
            <div className="banner-left">
                <img src={logo} alt="Company Logo"></img>
            </div>
                
            <header>{text}</header>
            
        </div>
        

        </>
    );

}
 



export default Banner