import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const PageShell = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow" aria-label="Main content">
        <Outlet context={{ location }} />
      </main>
      <Footer />
    </div>
  );
};