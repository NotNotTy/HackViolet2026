import './Footer.css'

interface Footer {
    text: string;
}
function Footer({text} : Footer) {
    return (
        <>
        <div className='footer'>
            <div>
            <h1> {text} </h1>
            </div>
        </div>
        </>
    );

}
 



export default Footer