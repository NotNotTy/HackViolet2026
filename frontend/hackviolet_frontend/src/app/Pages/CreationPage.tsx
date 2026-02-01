/**
 * CreationPage
 */
import Banner from '../../components/HomePage/Banner.tsx'
import CreationBlock from '../../components/CreationPage/CreationBlock.tsx'
import { Page } from '../../types/page.ts'
import '../App.css'
interface CreationPage {
  setPage: (page: Page) => void;
}
function LoginPage({setPage} : CreationPage) {
  return (
    <>
      <Banner logo_path='temp' text='Lift Link'></Banner>
      <CreationBlock buttonText='Submit' setPage={setPage}></CreationBlock>
    </>
  )
}

export default LoginPage
