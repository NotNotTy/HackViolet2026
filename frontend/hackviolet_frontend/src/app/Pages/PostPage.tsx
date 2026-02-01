/**
 * PostPage - Main feed with Profiles and Gym Sessions tabs
 */
import Banner from '../DefaultBanner/Banner.tsx'
import TabbedFeed from '../../components/MainFeed/TabbedFeed.tsx'
import VerificationBanner from '../../components/VerificationBanner/VerificationBanner.tsx'
import { Page } from '../../types/page.ts'
import '../App.css'

interface PostPage {
  setPage: (page: Page) => void;
}

function PostPage({setPage} : PostPage) {
  return (
    <>
      <Banner setPage = {setPage} text='LiftLink'></Banner>
      <VerificationBanner />
      <TabbedFeed />
    </>
  )
}

export default PostPage
