/**
 * HomePage
 */
import Banner from '../../components/HomePage/Banner.tsx'
import InfoBlock from '../../components/HomePage/InfoBlock.tsx'
import Footer from '../../components/HomePage/Footer.tsx'
import { Page } from '../../types/page.ts'
import '../App.css'
import MainBlock from '../../components/HomePage/MainBlock.tsx'
interface HomePage {
  setPage: (page: Page) => void;
}
function HomePage({setPage} : HomePage) {
  return (
    <>
      <Banner text='Lift Link' setPage={setPage}></Banner>
      <MainBlock text="Lifting together. Always."
       buttonText='Get Started' 
       setPage={setPage}></MainBlock>
      <InfoBlock 
      text="LiftLink’s mission is to make fitness more accessible, consistent, and safe for college students by removing the friction of finding a compatible workout partner. We empower students to build accountability and confidence in the gym through verified, preference-aware matching and thoughtful safety guardrails, while leveraging intelligent systems to streamline discovery, communication, and coordination. By combining social motivation with responsible technology, LiftLink helps students show up, stay committed, and feel supported in their fitness journeys.">

      </InfoBlock>
      <Footer text="Tyler Thach, Noah Glorria, Jett Ehlert, Allison Zhan"></Footer>
    </>
  )
}

export default HomePage
