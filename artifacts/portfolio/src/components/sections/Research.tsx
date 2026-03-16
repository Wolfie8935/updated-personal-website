import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export function Research() {
  const topics = [
    "Gibbs Sampling",
    "Variational Inference",
    "Laplace Approximation",
    "Monte Carlo methods",
    "Bayesian model selection",
    "Uncertainty modeling"
  ];

  return (
    <section id="research" className="py-24 bg-secondary-bg/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <BookOpen size={200} />
            </div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-md">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Probabilistic Machine Learning Research</h2>
              </div>

              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">
                <p>
                  During the <strong className="text-foreground">IISc Bangalore</strong> internship, Aman explored probabilistic machine learning methods focusing on Bayesian inference techniques.
                </p>
                
                <div>
                  <p className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Topics Explored</p>
                  <div className="flex flex-wrap gap-3">
                    {topics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm bg-background/50 border-border/80 text-foreground/90 hover:border-primary/50 transition-colors">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="pt-4 border-t border-border/50">
                  This work focused on understanding how probabilistic methods can improve <span className="text-primary font-medium">robustness</span> and <span className="text-secondary font-medium">uncertainty quantification</span> in machine learning systems, moving beyond point estimates to full posterior distributions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
