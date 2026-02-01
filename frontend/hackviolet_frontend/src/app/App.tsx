import { useState, useEffect } from 'react'
import HomePage from './Pages/HomePage.tsx'
import LoginPage from './Pages/LoginPage.tsx'
import CreationPage from './Pages/CreationPage.tsx'
import GymInfoPage from './Pages/GymInfoPage.tsx'
import PostPage from './Pages/PostPage.tsx'
import VerifyEmailPage from './Pages/VerifyEmailPage.tsx'
import CatChatbot from '../components/Chatbot/CatChatbot.tsx'
import './App.css'

import { Page } from "../types/page.ts";
function App() {

  const [page, setPage] = useState<Page>(Page.Home);

  // Check URL on mount to handle verification links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    // If there's a token in the URL and we haven't already verified, show verify email page
    // Check sessionStorage to avoid redirecting after successful verification
    const alreadyVerified = sessionStorage.getItem('email_verified') === 'true';
    if (token && !alreadyVerified && page === Page.Home) {
      setPage(Page.VerifyEmail);
    } else if (token && alreadyVerified) {
      // Token exists but already verified - clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    <>
      {page === Page.Home && <HomePage setPage={setPage} />}
      {page === Page.Login && <LoginPage setPage={setPage} />}
      {page === Page.CreateAccount && <CreationPage setPage={setPage} />}
      {page === Page.GymInfo && <GymInfoPage setPage={setPage} />}
      {page === Page.PostPage && <PostPage setPage={setPage} />}
      {page === Page.VerifyEmail && <VerifyEmailPage setPage={setPage} />}
      <CatChatbot />
    </>
  );
}

export default App
