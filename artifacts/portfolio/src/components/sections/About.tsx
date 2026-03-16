import { motion } from "framer-motion";

export function About() {
  return (
    <section id="about" className="py-24 bg-secondary-bg/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">About Me</h2>
            <div className="h-px bg-border flex-grow max-w-xs"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-highlight to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-2 aspect-square max-w-sm w-full">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/avatar.png`} 
                    alt="Aman Goel Avatar" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {/* Decorative corner accents */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/50"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-secondary/50"></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Aman Goel is a Computer Science undergraduate at SRM Institute of Science and Technology with strong interests in <span className="text-primary font-medium">artificial intelligence</span>, <span className="text-highlight font-medium">reasoning systems</span>, and <span className="text-secondary font-medium">scalable backend engineering</span>.
              </p>
              <p>
                His work focuses on building AI platforms that combine machine learning models with robust software infrastructure, ensuring models don't just exist in notebooks, but scale in production environments.
              </p>
              <p>
                His projects range from reasoning-driven AI systems and LLM orchestration platforms to scalable machine learning pipelines and probabilistic ML research.
              </p>
              <p className="p-4 border-l-2 border-primary bg-primary/5 rounded-r-lg text-foreground mt-6">
                He recently completed a research internship at the <strong className="text-primary">Indian Institute of Science (IISc) Bangalore</strong> working on probabilistic machine learning and Bayesian inference methods.
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
