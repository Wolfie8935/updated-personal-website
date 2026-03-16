import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Terminal, Zap, FolderGit2 } from "lucide-react";

const GITHUB_REPOS = "https://github.com/Wolfie8935?tab=repositories";

export function Projects() {
  const projects = [
    {
      id: "ceras",
      title: "CERAS",
      subtitle: "Cognitive Efficiency & Reasoning Alignment System",
      tag: "Major Project",
      description: "A reasoning-driven AI platform designed to evaluate and improve cognitive problem solving through structured multi-step reasoning and adaptive task decomposition.",
      features: [
        "Custom Tree-of-Thought reasoning architecture",
        "Multi-stage planning and verification",
        "Greedy reasoning path optimization",
        "Asynchronous backend pipelines",
        "Dynamic model orchestration",
        "Telemetry-based cognitive efficiency scoring",
        "Adaptive subtask decomposition for learning workflows"
      ],
      tech: ["FastAPI", "React", "Async Python", "LLM Pipelines", "Distributed inference"],
      demo: "https://ceras-frontend.onrender.com/",
      github: "https://github.com/Wolfie8935/CERAS-Cognitive-Efficiency-Reasoning-Alignment-System",
      featured: true
    },
    {
      id: "cyclone",
      title: "Cyclone Intensity Prediction Pipeline",
      tag: "IEEE Published",
      description: "Machine learning pipeline to predict cyclone intensity from large-scale meteorological data. Published at ICCMC 2025.",
      features: [
        "Processed more than 1 million data points",
        "Advanced multi-stage feature engineering",
        "Optimized prediction workflows",
        "Achieved R² score of 0.993"
      ],
      tech: ["Python", "Scikit-Learn", "Pandas", "ERA5 Dataset", "Feature Engineering"],
      github: "https://github.com/Wolfie8935/Cyclone-Intensity-Prediction",
      featured: false
    },
    {
      id: "genai",
      title: "GenAI Chatbot",
      subtitle: "Intel Unnati",
      description: "LLM-powered chatbot pipeline built using ETL preprocessing, tokenization workflows, and LLaMA-based inference models optimized for CPU inference.",
      features: [
        "Dataset preprocessing pipelines",
        "Tokenization and batching",
        "CPU optimized inference",
        "Large scale summarization workflows"
      ],
      tech: ["LLaMA", "Intel Extension for Transformers", "ETL", "PEFT", "Python"],
      github: "https://github.com/Wolfie8935/Intel-Unnati-GenAI-Chatbot",
      featured: false
    },
  ];

  return (
    <section id="projects" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Projects</h2>
            <div className="h-px bg-border flex-grow max-w-xs"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                className={project.featured ? "md:col-span-2 lg:col-span-3" : ""}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className={`h-full flex flex-col ${project.featured ? 'border-primary/40 bg-gradient-to-br from-card to-card/50 shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:border-primary glow-border' : 'bg-card/50 hover:bg-card'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-3 rounded-lg bg-secondary-bg border border-border inline-block">
                        {project.featured ? <Zap className="w-6 h-6 text-highlight" /> : <Terminal className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      {project.tag && (
                        <Badge variant={project.featured ? "glow" : "secondary"}>{project.tag}</Badge>
                      )}
                    </div>
                    <CardTitle className={`font-bold ${project.featured ? 'text-2xl md:text-3xl mt-4 text-foreground' : 'text-xl text-foreground'}`}>
                      {project.title}
                    </CardTitle>
                    {project.subtitle && (
                      <p className="text-sm font-medium text-primary font-mono">{project.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="space-y-3 mb-6">
                      <h4 className="text-sm font-semibold text-foreground">Key Highlights:</h4>
                      <ul className={`grid gap-2 ${project.featured ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {project.features.map((feature, i) => (
                          <li key={i} className="flex items-start text-sm text-muted-foreground">
                            <span className="text-primary mr-2">▹</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
                      {project.tech.map((tech, i) => (
                        <span key={i} className="text-xs font-mono text-muted-foreground bg-secondary-bg px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3 pt-0">
                    {project.demo && (
                      <Button variant="glow" size={project.featured ? "default" : "sm"} onClick={() => window.open(project.demo, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
                      </Button>
                    )}
                    {project.github && (
                      <Button variant="outline" size={project.featured ? "default" : "sm"} onClick={() => window.open(project.github, '_blank')}>
                        <Github className="w-4 h-4 mr-2" /> GitHub Repository
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}

            {/* More Projects card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card
                className="h-full flex flex-col items-center justify-center bg-card/30 border-dashed border-border hover:border-primary/50 hover:bg-card/50 transition-all cursor-pointer group min-h-[260px]"
                onClick={() => window.open(GITHUB_REPOS, "_blank")}
              >
                <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
                  <div className="p-4 rounded-xl bg-secondary-bg border border-border group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                    <FolderGit2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">More Projects</p>
                    <p className="text-sm text-muted-foreground">Explore all repositories on GitHub</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Github className="w-4 h-4" />
                    <span>github.com/Wolfie8935</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
