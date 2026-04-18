import { useEffect, useRef } from "react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";
import { motion } from "framer-motion";
import { ChevronRight, Code2, GraduationCap, Microscope, Trophy } from "lucide-react";

const HERO_VIDEO_SRC = `${import.meta.env.BASE_URL}wizard_assets/background_wizard.mp4`;

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();

  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  const statCards = [
    { icon: <GraduationCap className="w-5 h-5 text-primary" />, label: "CGPA", value: "9.79 / 10" },
    { icon: <Microscope className="w-5 h-5 text-secondary" />, label: "Research Internship", value: "IISc Bangalore" },
    { icon: <Code2 className="w-5 h-5 text-highlight" />, label: "Competitive Programming", value: "400+ Solved" },
    { icon: <Trophy className="w-5 h-5 text-yellow-500" />, label: "ICPC Asia Regional", value: "Rank 77" },
  ];

  useEffect(() => {
    const heroVideo = videoRef.current;
    if (!heroVideo) return;

    if (theme !== "wizarding" || reducedMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute("src");
      heroVideo.load();
      return;
    }

    if (heroVideo.getAttribute("src") !== HERO_VIDEO_SRC) {
      heroVideo.setAttribute("src", HERO_VIDEO_SRC);
    }
  }, [theme, reducedMotion]);

  useEffect(() => {
    if (theme !== "wizarding" || reducedMotion) return;

    const heroVideo = videoRef.current;
    const heroSection = sectionRef.current;
    if (!heroVideo || !heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!document.documentElement.classList.contains("theme-wizarding")) return;

          if (entry.isIntersecting) {
            if (heroVideo.getAttribute("src") !== HERO_VIDEO_SRC) {
              heroVideo.setAttribute("src", HERO_VIDEO_SRC);
            }
            heroVideo.load();
            heroVideo.play().catch(() => {});
            return;
          }

          heroVideo.pause();
          heroVideo.removeAttribute("src");
          heroVideo.load();
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(heroSection);

    return () => {
      observer.disconnect();
      heroVideo.pause();
      heroVideo.removeAttribute("src");
      heroVideo.load();
    };
  }, [theme, reducedMotion]);

  return (
    <section id="home" ref={sectionRef} className="hero-section relative min-h-screen pt-20 overflow-hidden">
      <video
        id="hp-hero-bg"
        ref={videoRef}
        className="hp-video-bg"
        src={theme === "wizarding" && !reducedMotion ? HERO_VIDEO_SRC : undefined}
        muted
        loop
        playsInline
        preload="none"
      />
      <ThreeBackground />
      
      <div className="hero-content-layer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-8 text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-primary font-mono text-lg mb-2">Data Science • ML / Backend</h2>
              <h1 className="hero-site-title text-5xl sm:text-7xl font-extrabold text-foreground tracking-tight mb-4">
                Aman Goel.
              </h1>
              
              <div className="h-20 sm:h-16">
                <motion.p 
                  className="text-2xl sm:text-3xl font-light text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <span className="text-foreground font-medium">Former Indian Tennis Player</span> and{" "}
                  <span className="text-gradient font-medium">loves to play</span> with{" "}
                  <span className="text-secondary font-medium">AI and ML systems</span>.
                </motion.p>
              </div>
            </motion.div>

            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              I’m a CS undergrad who builds real systems: reasoning engines, ML pipelines, and backends that stay fast under load. Recent work includes CERAS — a cognitive efficiency & reasoning alignment platform — and research in probabilistic ML at IISc Bangalore.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Button size="lg" variant="glow" onClick={() => window.open('https://ceras-frontend.onrender.com/', '_blank')} className="group">
                Explore CERAS
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToProjects}>
                View Projects
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Stats Row */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-24 pb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, staggerChildren: 0.1 }}
        >
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="bg-card/40 backdrop-blur-sm border-border/50 h-full">
                <CardContent className="p-6 flex flex-col items-start gap-3">
                  <div className="p-3 rounded-lg bg-secondary-bg/80 border border-border">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground font-mono">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
