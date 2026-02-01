
import logo from "../../app/assets/liftLogo.png"
interface Filter {
    text: string;
}
function Banner({text} : Filter) {
    return (
        <>
        <div className="banner">
            <div className="banner-left">
                <img src={logo} alt="Company Logo"></img>
            </div>
            <div className="banner-center">
                <h2>{text}</h2>
            </div>
            <div className="banner-right"></div>
        
            
        </div>
        

        </>
    );

}
 



export default Banner