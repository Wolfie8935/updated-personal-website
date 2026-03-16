import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Cpu, Database, Cloud, BrainCircuit } from "lucide-react";

export function Skills() {
  const skillCategories = [
    {
      title: "Programming Languages",
      icon: <Code className="w-5 h-5 text-primary" />,
      skills: ["Python", "C++", "Java", "JavaScript"]
    },
    {
      title: "Core Computer Science",
      icon: <Cpu className="w-5 h-5 text-highlight" />,
      skills: ["Data Structures", "Algorithms", "Dynamic Programming", "Graphs", "Greedy Algorithms", "Backtracking", "Object Oriented Design", "Complexity Analysis"]
    },
    {
      title: "Backend Engineering",
      icon: <Database className="w-5 h-5 text-secondary" />,
      skills: ["FastAPI", "REST API Design", "Asynchronous Programming", "System Design", "Distributed Systems", "API Lifecycle Management", "SDLC"]
    },
    {
      title: "Cloud & DevOps",
      icon: <Cloud className="w-5 h-5 text-blue-400" />,
      skills: ["AWS (EC2, S3, Lambda, RDS, SageMaker)", "Docker", "Jenkins", "CI/CD", "Git", "GitHub", "SQL", "NoSQL"]
    },
    {
      title: "Machine Learning",
      icon: <BrainCircuit className="w-5 h-5 text-green-400" />,
      skills: ["Machine Learning", "Deep Learning", "Neural Networks", "Natural Language Processing", "Bayesian Estimation", "Probabilistic Modeling", "PyTorch", "TensorFlow", "Keras", "NumPy", "Pandas"]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="skills" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Technical Arsenal</h2>
            <div className="h-px bg-border flex-grow max-w-xs"></div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {skillCategories.map((category, i) => (
              <motion.div key={i} variants={item} className={i === 4 ? "md:col-span-2 lg:col-span-3" : ""}>
                <Card className="h-full bg-card/50 hover:bg-card/80 transition-colors">
                  <CardHeader className="pb-3 flex flex-row items-center gap-3">
                    <div className="p-2 bg-secondary-bg rounded-lg border border-border">
                      {category.icon}
                    </div>
                    <CardTitle className="text-lg m-0">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, j) => (
                        <Badge key={j} variant="secondary" className="font-mono text-xs py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
