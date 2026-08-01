import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import Home from "./pages/Home";
import Work from "./pages/Work";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Inquire from "./pages/Inquire";
import NotFound from "./pages/NotFound";
import ClientPicks from "./pages/ClientPicks";
import StudioAdmin from "./pages/StudioAdmin";

// Routes that render their own nav/footer — skip the shared shell
const STANDALONE_ROUTES = ["/studio"];
const startsWithStandalone = (path) =>
  STANDALONE_ROUTES.some((r) => path === r || path.startsWith("/picks/"));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/inquire" element={<Inquire />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const standalone = startsWithStandalone(location.pathname);

  // Standalone pages (picks + studio) render without shared Navbar/Footer
  if (standalone) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/picks/:galleryId" element={<ClientPicks />} />
          <Route path="/studio" element={<StudioAdmin />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <BackToTop />
      <ScrollToTop />
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
