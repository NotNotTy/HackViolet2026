import './InfoBlock.css'

interface InfoBlock {
    text: string;
}
function InfoBlock({text} : InfoBlock) {
    return (
        <>
        <div className='subpage'>
            <p> {text} </p>
        </div>
        </>
    );

}
 



export default InfoBlock