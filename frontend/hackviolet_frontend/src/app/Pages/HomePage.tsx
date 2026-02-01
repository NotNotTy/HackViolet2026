/**
 * HomePage
 */
import Banner from '../../components/HomePage/Banner.tsx'
import InfoBlock from '../../components/HomePage/InfoBlock.tsx'
import Footer from '../../components/HomePage/Footer.tsx'
import StatBlock from '../../components/HomePage/StatBlock.tsx'
import { Page } from '../../types/page.ts'
import '../App.css'
import MainBlock from '../../components/HomePage/MainBlock.tsx'
interface HomePage {
  setPage: (page: Page) => void;
}
function HomePage({setPage} : HomePage) {
  return (
    <>
      <Banner text='LiftLink' setPage={setPage}></Banner>
      <MainBlock text="Lifting together. Always."
       buttonText='Get Started' 
       setPage={setPage}></MainBlock>
      <InfoBlock 
      text='"Your Gym Buddy, One Click Away."'>

      </InfoBlock>
      <StatBlock></StatBlock>
      <Footer text="HackViolet 2026 Submission"></Footer>
    </>
  )
}

export default HomePage
