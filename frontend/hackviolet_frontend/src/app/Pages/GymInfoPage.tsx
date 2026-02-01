/**
 * GymInfoPage
 */
import Banner from '../../components/HomePage/Banner.tsx'
import GymInfoBlock from '../../components/GymInfoPage/GymInfoBlock.tsx';
import { Page } from '../../types/page.ts'
import '../App.css'
interface GymInfoPage {
  setPage: (page: Page) => void;
}
function GymInfoPage({setPage} : GymInfoPage) {
  return (
    <>
      <Banner setPage = {setPage} text='Lift Link'></Banner>
      <GymInfoBlock buttonText='Save Changes' setPage={setPage}></GymInfoBlock>
    </>
  )
}

export default GymInfoPage
