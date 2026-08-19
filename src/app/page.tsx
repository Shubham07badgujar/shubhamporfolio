import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { About } from "@/components/About/About";
import { Journey } from "@/components/Journey/Journey";
import { Projects } from "@/components/Projects/Projects";
import { Experience } from "@/components/Experience/Experience";
import { Achievements } from "@/components/Achievements/Achievements";
import { Leadership } from "@/components/Leadership/Leadership";
import { Skills } from "@/components/Skills/Skills";
import { Contact } from "@/components/Contact/Contact";
import { Footer } from "@/components/Footer/Footer";
import { Preloader } from "@/components/ui/Preloader";

export default function Home() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main id="main" className="relative">
        <Hero />
        <About />
        <Journey />
        <Projects />
        <Experience />
        <Achievements />
        <Leadership />
        <Skills />
      </main>

      {/*
        Stacked panels. Contact and Footer are siblings so that Contact can stick
        within this shared parent — a sticky element only stays pinned for as
        long as its own container extends, so with Contact as the last child of
        `main` it would unstick immediately. The footer follows in flow on a
        higher layer, and rides up over the pinned panel.
      */}
      <div className="relative">
        <Contact />
        <Footer />
      </div>
    </>
  );
}
