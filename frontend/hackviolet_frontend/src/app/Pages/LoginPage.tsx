/**
 * LoginPage
 */
import Banner from '../../components/HomePage/Banner.tsx'
import LoginBlock from '../../components/LoginPage/LoginBlock.tsx';
import { Page } from '../../types/page.ts'
import '../App.css'
interface LoginPage {
  setPage: (page: Page) => void;
}
function LoginPage({setPage} : LoginPage) {
  return (
    <>
      <Banner setPage = {setPage} text='LiftLink'></Banner>
      <LoginBlock setPage={setPage}></LoginBlock>
    </>
  )
}

export default LoginPage
