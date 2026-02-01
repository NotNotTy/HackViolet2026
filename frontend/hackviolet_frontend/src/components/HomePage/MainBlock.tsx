import './MainBlock.css'
import { Page } from "../../types/page";

interface MainBlock {
    text: string;
    buttonText: string;
    setPage: (page: Page) => void;
}
function MainBlock({text, buttonText, setPage} : MainBlock) {
    return (
        <>
        <div className="mainpage">
        <div className="sloganBlock">
        <header>
            <h1>
                {text}
            </h1>
        </header>
        </div>
        <div className="buttonBlock">
            <button onClick={() => setPage(Page.Login)}>{buttonText}</button>
        </div>
        </div>
        </>
    );

}
 



export default MainBlock