import { useState, useEffect } from 'react'
import HomePage from './Pages/HomePage.tsx'
import LoginPage from './Pages/LoginPage.tsx'
import CreationPage from './Pages/CreationPage.tsx'
import GymInfoPage from './Pages/GymInfoPage.tsx'
import PostPage from './Pages/PostPage.tsx'
import VerifyEmailPage from './Pages/VerifyEmailPage.tsx'
import './App.css'

import { Page } from "../types/page.ts";
function App() {

  const [page, setPage] = useState<Page>(Page.Home);

  // Check URL on mount to handle verification links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    // If there's a token in the URL, show verify email page
    if (token) {
      setPage(Page.VerifyEmail);
    }
  }, []);

  if (page === Page.Home){ 
    return  (
      <>
        <HomePage setPage={setPage}>

        </HomePage>
      </>
    )
  }
  else if (page === Page.Login) {
    return (
      <>
      <LoginPage setPage={setPage}></LoginPage>
      </>
    )
  }

  else if (page === Page.CreateAccount) {
    return <>
    <CreationPage setPage={setPage}></CreationPage>
    </>
  }

  else if (page === Page.GymInfo) {
    return <>
      <GymInfoPage setPage={setPage}></GymInfoPage>
    </>
  }

  else if (page === Page.PostPage) {
    return <>
      <PostPage setPage={setPage}></PostPage>
    </>
  }

  else if (page === Page.VerifyEmail) {
    return <>
      <VerifyEmailPage setPage={setPage}></VerifyEmailPage>
    </>
  }

  return null;
}

export default App
