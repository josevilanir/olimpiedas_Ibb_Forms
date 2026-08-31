import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./LandingPage.css";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { AboutSection } from "../components/landing/AboutSection";
import {
  ModalitiesSection,
  modalities,
} from "../components/landing/ModalitiesSection";
import { RegistrationSteps } from "../components/landing/RegistrationSteps";
import { SponsorsSection } from "../components/landing/SponsorsSection";
import { Footer } from "../components/landing/Footer";
import { useCountdown } from "../hooks/useCountdown";

export default function LandingPage() {
  const navigate = useNavigate();
  const onGoToRegistration = () => navigate("/inscricao");
  const onGoToAdmin = () => navigate("/admin/login");
  const [scrolled, setScrolled] = useState(false);
  const countdown = useCountdown();
  const [activeFilter, setActiveFilter] = useState("all");

  const tickerItems = modalities.map((m) => m.name);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          } else {
            e.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page-container">
      <Navbar scrolled={scrolled} onGoToRegistration={onGoToRegistration} />
      <HeroSection
        countdown={countdown}
        tickerItems={tickerItems}
        onGoToRegistration={onGoToRegistration}
      />
      <AboutSection />
      <ModalitiesSection
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <RegistrationSteps onGoToRegistration={onGoToRegistration} />
      <SponsorsSection />
      <Footer onGoToAdmin={onGoToAdmin} />
    </div>
  );
}
