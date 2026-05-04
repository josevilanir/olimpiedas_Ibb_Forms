import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./LandingPage.css";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { AboutSection } from "../components/landing/AboutSection";
import { ModalitiesSection, modalities } from "../components/landing/ModalitiesSection";
import { RegistrationSteps } from "../components/landing/RegistrationSteps";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const onGoToRegistration = () => navigate("/inscricao");
  const onGoToAdmin = () => navigate("/admin/login");
  const [scrolled, setScrolled] = useState(false);
  const [countdown, setCountdown] = useState({ d: "--", h: "--", m: "--", s: "--" });
  const [activeFilter, setActiveFilter] = useState("all");

  const tickerItems = modalities.map(m => m.name);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    const EVENT_DATE = new Date(2026, 6, 4, 8, 0, 0);
    const updateCountdown = () => {
      const now = new Date();
      const diff = EVENT_DATE.getTime() - now.getTime();
      if (diff <= 0) { setCountdown({ d: "00", h: "00", m: "00", s: "00" }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({
        d: String(d).padStart(2, "0"),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    updateCountdown();
    const cdInterval = setInterval(updateCountdown, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(cdInterval);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page-container">
      <Navbar scrolled={scrolled} onGoToRegistration={onGoToRegistration} />
      <HeroSection countdown={countdown} tickerItems={tickerItems} onGoToRegistration={onGoToRegistration} />
      <AboutSection />
      <ModalitiesSection activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <RegistrationSteps onGoToRegistration={onGoToRegistration} />
      <Footer onGoToAdmin={onGoToAdmin} />
    </div>
  );
}
