/**
 * CreationPage
 */
import Banner from '../DefaultBanner/Banner.tsx'
import CreationBlock from '../../components/CreationPage/CreationBlock.tsx'
import { Page } from '../../types/page.ts'
import '../App.css'
interface CreationPage {
  setPage: (page: Page) => void;
}
function CreationPage({setPage} : CreationPage) {
  return (
    <>
      <Banner setPage = {setPage} text='LiftLink'></Banner>
      <CreationBlock buttonText='Submit' setPage={setPage}></CreationBlock>
    </>
  )
}

export default CreationPage
