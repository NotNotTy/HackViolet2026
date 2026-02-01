/**
 * PostPage
 */
import Banner from '../../components/HomePage/Banner.tsx'
import Filter from '../../components/PostPage/Filter.tsx'
import CreationBlock from '../../components/CreationPage/CreationBlock.tsx'
import { Page } from '../../types/page.ts'
import '../App.css'
interface FilterPage {
  setPage: (page: Page) => void;
}
function LoginPage({setPage} : FilterPage) {
  return (
    <>
      <Banner setPage = {setPage} text='Lift Link'></Banner>
      <Filter text='Temp'>
      </Filter>
      <CreationBlock buttonText='Submit' setPage={setPage}></CreationBlock>
    </>
  )
}

export default LoginPage
