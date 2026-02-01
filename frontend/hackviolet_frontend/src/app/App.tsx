import { useState } from 'react'
import HomePage from './Pages/HomePage.tsx'
import LoginPage from './Pages/LoginPage.tsx'
import CreationPage from './Pages/CreationPage.tsx'
import GymInfoPage from './Pages/GymInfoPage.tsx'
import PostPage from './Pages/PostPage.tsx'
import './App.css'

import { Page } from "../types/page.ts";
function App() {


  const [page, setPage] = useState<Page>(Page.Home);

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

}

export default App
