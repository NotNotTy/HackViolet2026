import { Page } from "../types/page"

interface NavProps {
  setPage: (page: Page) => void;
}

function Nav({ setPage }: NavProps) {
  return (
    <nav className="nav">
      <button onClick={() => setPage(Page.Home)}>Home</button>
      <button onClick={() => setPage(Page.About)}>About</button>
    </nav>
  );
}

export default Nav;