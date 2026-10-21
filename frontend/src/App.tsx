import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { PageShell } from "./components/layout/PageShell";
import Dashboard from "./pages/Dashboard";
import CycleTracking from "./pages/CycleTracking";
import Education from "./pages/Education";
import Journal from "./pages/Journal";
import AnemiaScreening from "./pages/AnemiaScreening";
import { ComingSoon } from "./components/layout/ComingSoon";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageShell />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cycle-tracking" element={<CycleTracking />} />
          <Route path="education" element={<Education />} />
          <Route path="education/:articleId" element={<Education />} />
          <Route path="journal" element={<Journal />} />
          <Route path="screening/anemia" element={<AnemiaScreening />} />
          <Route path="reports" element={<ComingSoon feature="Reports & history" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
