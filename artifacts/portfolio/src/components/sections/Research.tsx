import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, ExternalLink, FileText, Calendar, MapPin, User, BookMarked, Link2 } from "lucide-react";

const topics = [
  { name: "Gibbs Sampling", desc: "Iterative conditional sampling from joint distributions" },
  { name: "Variational Inference", desc: "Approximating posteriors via optimization" },
  { name: "Laplace Approximation", desc: "Gaussian approximation around MAP estimates" },
  { name: "Monte Carlo Methods", desc: "Stochastic simulation for intractable integrals" },
  { name: "Bayesian Model Selection", desc: "Marginal likelihood and empirical Bayes" },
  { name: "Uncertainty Modeling", desc: "Epistemic vs aleatoric uncertainty quantification" },
  { name: "Rejection Sampling", desc: "Accept-reject strategies for complex densities" },
  { name: "Metropolis-Hastings", desc: "Markov Chain Monte Carlo proposal mechanics" },
];

const publications = [
  {
    title: "Cyclone Intensity Prediction using ERA5",
    venue: "Proceedings of 8th International Conference on Computing Methodologies and Communication (ICCMC 2025)",
    type: "Conference Paper",
    year: "2025",
    doi: "10.1109/ICCMC65190.2025.11140783",
    doiUrl: "https://doi.org/10.1109/ICCMC65190.2025.11140783",
    isbn: "9798331512118",
    contributors: "Goel, A.; Yadav, R.; Priya, S.",
    publisher: "IEEE",
    color: "primary",
  },
  {
    title: "Smart Hotel Automation System",
    venue: "Intelligent Computing Techniques and Applications",
    type: "Book Chapter",
    year: "2025",
    doi: "10.1201/9781003658221-44",
    doiUrl: "https://doi.org/10.1201/9781003658221-44",
    isbn: "9781003658221",
    contributors: "Aman Goel; Jayanth Nair; Rishaan Yadav; Dhruv Veragiwala; A. Jeyasekar",
    publisher: "CRC Press / Taylor & Francis",
    color: "secondary",
  },
];

export function Research() {
  const reportUrl = `${import.meta.env.BASE_URL}IISc_Research_Report.pdf`;

  return (
    <section id="research" className="py-24 bg-secondary-bg/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          {/* Section header */}
          <div className="flex items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Research</h2>
            <div className="h-px bg-border flex-grow max-w-xs"></div>
            <a
              href="https://orcid.org/0009-0000-0899-9400"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/50 hover:border-primary/50 hover:bg-card text-xs font-mono text-muted-foreground hover:text-primary transition-all flex-shrink-0"
            >
              <Link2 className="w-3.5 h-3.5" />
              ORCID
            </a>
          </div>

          {/* Published Papers */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <BookMarked className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Publications</h3>
            </div>
            <div className="space-y-4">
              {publications.map((pub, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border/60 rounded-xl p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${pub.color === 'primary' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-secondary/40 bg-secondary/10 text-secondary'}`}>
                          {pub.type}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{pub.year}</span>
                        <span className="text-xs text-muted-foreground font-mono">· {pub.publisher}</span>
                      </div>
                      <h4 className="text-base font-semibold text-foreground">{pub.title}</h4>
                      <p className="text-sm text-muted-foreground italic">{pub.venue}</p>
                      <p className="text-xs text-muted-foreground font-mono">{pub.contributors}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <a
                          href={pub.doiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          DOI: {pub.doi}
                        </a>
                        <span className="text-xs text-muted-foreground font-mono">ISBN: {pub.isbn}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* IISc Internship Research */}
          <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none">
              <BookOpen size={220} />
            </div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-mono text-primary uppercase tracking-widest">Research Internship · IISc Bangalore</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Studies on Probabilistic Methods in Machine Learning
                </h3>
                <p className="text-primary font-mono text-sm">Summer Internship Report · IISc Bangalore · 2025</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <MapPin className="w-4 h-4" />, label: "Institution", value: "IISc Bangalore – 560012" },
                  { icon: <Calendar className="w-4 h-4" />, label: "Duration", value: "2nd June – 27th July 2025" },
                  { icon: <User className="w-4 h-4" />, label: "Supervisor", value: "Prof. C. Pandurangan" },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary-bg/60 border border-border/50">
                    <span className="text-primary mt-0.5">{m.icon}</span>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">{m.label}</p>
                      <p className="text-sm text-foreground font-medium">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  During this internship I explored core probabilistic methods in machine learning, focusing on Bayesian inference — moving beyond point estimates to full posterior distributions over model parameters.
                </p>
                <p className="p-4 border-l-2 border-primary bg-primary/5 rounded-r-lg text-foreground text-sm">
                  Certified by <strong>Prof. Chandrasekaran Pandurangan</strong> — the report was described as "technically sound, well-organized… a commendable effort in blending theory with practical understanding."
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Topics Explored</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topics.map((topic, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary-bg/40 hover:border-primary/40 transition-colors"
                    >
                      <span className="text-primary mt-0.5 text-sm font-bold">▹</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{topic.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{topic.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border border-primary/30 bg-primary/5 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Full Internship Report</p>
                    <p className="text-sm text-muted-foreground">PDF · IISc Bangalore Summer Internship 2025</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => window.open(reportUrl, "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" /> View
                  </Button>
                  <Button size="sm" onClick={() => {
                    const a = document.createElement("a");
                    a.href = reportUrl;
                    a.download = "Aman_Goel_IISc_Research_Report.pdf";
                    a.click();
                  }}>
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
