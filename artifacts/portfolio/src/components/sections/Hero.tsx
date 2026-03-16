import { motion } from "framer-motion";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, Microscope, Trophy, GraduationCap, ChevronRight } from "lucide-react";

export function Hero() {
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

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
      <ThreeBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-8 text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-primary font-mono text-lg mb-2">Hello, I'm</h2>
              <h1 className="text-5xl sm:text-7xl font-extrabold text-foreground tracking-tight mb-4">
                Aman Goel.
              </h1>
              
              <div className="h-20 sm:h-16">
                <motion.p 
                  className="text-2xl sm:text-3xl font-light text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <span className="text-foreground font-medium">AI / ML Engineer</span> focusing on{' '}
                  <span className="text-gradient font-medium">Reasoning Systems</span> & <span className="text-secondary font-medium">Backend Architecture</span>.
                </motion.p>
              </div>
            </motion.div>

            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Computer Science undergraduate building intelligent systems that combine machine learning, reasoning engines, and scalable backend architecture. Focused on probabilistic ML, LLM pipelines, and production-grade AI platforms.
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
