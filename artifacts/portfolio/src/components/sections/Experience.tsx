import { motion } from "framer-motion";
import { Building2, Calendar, MapPin } from "lucide-react";

export function Experience() {
  const experiences = [
    {
      title: "Research Intern",
      company: "Indian Institute of Science (IISc)",
      location: "Bangalore",
      date: "June 2025 – July 2025",
      isFeatured: true,
      description: [
        "Implemented Bayesian inference algorithms in Python translating mathematical formulations into efficient code.",
        "Built modular experimentation pipelines for posterior estimation, sampling, and evaluation.",
        "Worked on probabilistic machine learning frameworks involving uncertainty modeling and inference.",
        "Optimized numerical computations using vectorized operations to improve scalability."
      ]
    },
    {
      title: "Industrial Trainee",
      company: "Intel Unnati",
      location: "Remote",
      date: "May 2024 – July 2024",
      isFeatured: false,
      description: [
        "Developed ETL pipelines for preprocessing large text datasets used for LLM fine-tuning.",
        "Integrated LLaMA models using Intel Extension for Transformers enabling efficient CPU-based inference.",
        "Designed end-to-end data to model inference workflows.",
        "Improved execution stability for long-running ML workflows."
      ]
    }
  ];

  return (
    <section id="experience" className="py-24 bg-secondary-bg/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Experience</h2>
            <div className="h-px bg-border flex-grow max-w-xs"></div>
          </div>

          <div className="relative border-l border-border/80 ml-3 md:ml-6 space-y-12">
            {experiences.map((exp, index) => (
              <motion.div 
                key={index}
                className="relative pl-8 md:pl-12"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Timeline Dot */}
                <div className={`absolute left-[-5px] top-1.5 w-[11px] h-[11px] rounded-full border-2 bg-background ${exp.isFeatured ? 'border-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'border-muted-foreground'}`}></div>

                <div className={`p-6 rounded-2xl border transition-all duration-300 ${exp.isFeatured ? 'bg-card border-primary/30 shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:border-primary/60' : 'bg-card/50 border-border hover:border-border/80 hover:bg-card'}`}>
                  
                  {exp.isFeatured && (
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase">
                      Featured Experience
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-foreground mb-1">{exp.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1 font-medium text-foreground/80"><Building2 size={16}/> {exp.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {exp.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {exp.date}</span>
                  </div>

                  <ul className="space-y-3">
                    {exp.description.map((item, i) => (
                      <li key={i} className="flex items-start text-muted-foreground leading-relaxed text-[15px]">
                        <span className="mr-3 mt-2 block w-1.5 h-1.5 bg-primary/50 rounded-full flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
