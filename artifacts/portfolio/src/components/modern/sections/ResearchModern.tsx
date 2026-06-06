import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, ExternalLink, FileText, Calendar, MapPin, User, BookMarked, Link2 } from "lucide-react";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { GlassCard } from "@/components/modern/GlassCard";

const topics = [
  { name: "Gibbs Sampling", desc: "Iterative conditional sampling from joint distributions", brief: "Isme hum ek baar me ek variable sample karte hain. Aise step-by-step chalke difficult posterior ko practically estimate kar lete hain." },
  { name: "Variational Inference", desc: "Approximating posteriors via optimization", brief: "True posterior tough hota hai, to hum ek simpler distribution choose karke usko optimize karte hain taki woh original ke close aa jaye." },
  { name: "Laplace Approximation", desc: "Gaussian approximation around MAP estimates", brief: "Posterior ke peak (MAP point) ke around curve ko Gaussian maan lete hain. Isse calculations fast aur manageable ho jaati hain." },
  { name: "Monte Carlo Methods", desc: "Stochastic simulation for intractable integrals", brief: "Jab exact integration mushkil ho, tab random samples se average nikalke answer ka accha estimate banaya jata hai." },
  { name: "Bayesian Model Selection", desc: "Marginal likelihood and empirical Bayes", brief: "Different models compare karne ke liye dekhte hain data kis model ko zyada support karta hai, sirf accuracy nahi balki uncertainty bhi consider hoti hai." },
  { name: "Uncertainty Modeling", desc: "Epistemic vs aleatoric uncertainty quantification", brief: "Prediction ke saath confidence samajhna: data noisy hai (aleatoric) ya model ko knowledge kam hai (epistemic)." },
  { name: "Rejection Sampling", desc: "Accept-reject strategies for complex densities", brief: "Easy distribution se sample leke rule ke basis par accept/reject karte hain, taki final samples target distribution ko follow karein." },
  { name: "Metropolis-Hastings", desc: "Markov Chain Monte Carlo proposal mechanics", brief: "Naya sample propose hota hai aur probability ke basis par accept hota hai. Time ke saath chain target posterior ko represent karne lagti hai." },
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
  },
];

export function ResearchModern() {
  const reportUrl = `${import.meta.env.BASE_URL}IISc_Research_Report.pdf`;
  const [selected, setSelected] = useState(topics[0]);

  const downloadReport = () => {
    const a = document.createElement("a");
    a.href = reportUrl;
    a.download = "Aman_Goel_IISc_Research_Report.pdf";
    a.click();
  };

  return (
    <section id="research" className="cv-auto relative py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <SectionHeading index="05" title="Research" className="mb-0" />
          <a
            href="https://orcid.org/0009-0000-0899-9400"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-shrink-0 items-center gap-2 rounded-full glass px-3.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-white/30"
          >
            <Link2 className="h-3.5 w-3.5" /> ORCID
          </a>
        </div>

        <div className="mt-10 space-y-6">
          {/* Publications */}
          <div className="mb-2 flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-foreground">Publications</h3>
          </div>
          {publications.map((pub, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-5" tiltMax={4}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-indigo-400/40 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-300">
                    {pub.type}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{pub.year}</span>
                  <span className="font-mono text-xs text-muted-foreground">· {pub.publisher}</span>
                </div>
                <h4 className="mt-2 text-base font-semibold text-foreground">{pub.title}</h4>
                <p className="mt-1 text-sm italic text-muted-foreground">{pub.venue}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{pub.contributors}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <a href={pub.doiUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-xs text-indigo-400 hover:underline">
                    <ExternalLink className="h-3 w-3" /> DOI: {pub.doi}
                  </a>
                  <span className="font-mono text-xs text-muted-foreground">ISBN: {pub.isbn}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}

          {/* IISc report */}
          <GlassCard tilt={false} className="relative overflow-hidden p-8 md:p-10">
            <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.05]">
              <BookOpen size={220} />
            </div>
            <div className="relative space-y-7">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg glass">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">
                    Research Internship · IISc Bangalore
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground md:text-3xl">
                  Studies on Probabilistic Methods in Machine Learning
                </h3>
                <p className="mt-1 font-mono text-sm text-indigo-400">Summer Internship Report · IISc Bangalore · 2025</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { icon: <MapPin className="h-4 w-4" />, label: "Institution", value: "IISc Bangalore – 560012" },
                  { icon: <Calendar className="h-4 w-4" />, label: "Duration", value: "2 June – 27 July 2025" },
                  { icon: <User className="h-4 w-4" />, label: "Supervisor", value: "Prof. C. Pandurangan" },
                ].map((m) => (
                  <div key={m.label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <span className="mt-0.5 text-indigo-400">{m.icon}</span>
                    <div>
                      <p className="mb-0.5 text-xs font-medium text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-medium text-foreground">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 leading-relaxed text-muted-foreground">
                <p>
                  During this internship I explored core probabilistic methods in machine learning, focusing on
                  Bayesian inference — moving beyond point estimates to full posterior distributions over model
                  parameters.
                </p>
                <p className="rounded-2xl border-l-2 border-indigo-400 bg-indigo-500/5 p-4 text-sm text-foreground">
                  Certified by <strong>Prof. Chandrasekaran Pandurangan</strong> — the report was described as
                  &ldquo;technically sound, well-organized… a commendable effort in blending theory with practical
                  understanding.&rdquo;
                </p>
              </div>

              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Topics Explored</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.name}
                      type="button"
                      onClick={() => setSelected(topic)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                        selected.name === topic.name
                          ? "border-indigo-400/60 bg-indigo-500/10 ring-1 ring-indigo-400/40"
                          : "border-white/10 bg-white/5 hover:border-indigo-400/40"
                      }`}
                    >
                      <span className="mt-0.5 text-sm font-bold text-indigo-400">▹</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{topic.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{topic.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-indigo-400/30 bg-indigo-500/5 p-4">
                  <p className="mb-1 font-mono text-xs uppercase tracking-wider text-indigo-400">Quick Explanation</p>
                  <p className="mb-1 text-sm font-semibold text-foreground">{selected.name}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selected.brief}</p>
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-400/30 bg-indigo-500/5 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl glass">
                    <FileText className="h-6 w-6 text-indigo-400" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Full Internship Report</p>
                    <p className="text-sm text-muted-foreground">PDF · IISc Bangalore Summer Internship 2025</p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 gap-3">
                  <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-white/30">
                    <ExternalLink className="h-4 w-4" /> View
                  </a>
                  <button onClick={downloadReport} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                    <Download className="h-4 w-4" /> Download
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
