/**
 * PostPage
 */
import Banner from '../../components/HomePage/Banner.tsx'
import PostCreation from '../../components/PostPage/PostCreation.tsx'
import PostList from '../../components/PostPage/PostList.tsx'
import { Page } from '../../types/page.ts'
import { useState } from 'react'
import '../App.css'

interface PostPage {
  setPage: (page: Page) => void;
}

function PostPage({setPage} : PostPage) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Banner setPage = {setPage} text='Lift Link'></Banner>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <PostCreation onPostCreated={handlePostCreated} />
        <PostList refreshTrigger={refreshTrigger} />
      </div>
    </>
  )
}

export default PostPage
