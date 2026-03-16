import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Trophy, Medal, Star, Code2 } from "lucide-react";

export function Achievements() {
  const achievements = [
    {
      icon: <Medal className="w-6 h-6 text-yellow-500" />,
      title: "2nd Place",
      subtitle: "IIT BHU Vista Codefest 2024"
    },
    {
      icon: <Trophy className="w-6 h-6 text-primary" />,
      title: "Rank 77",
      subtitle: "ICPC Asia Regional"
    },
    {
      icon: <Award className="w-6 h-6 text-secondary" />,
      title: "Rank 27",
      subtitle: "Zindi Air Quality Challenge"
    },
    {
      icon: <Star className="w-6 h-6 text-highlight" />,
      title: "Top 200",
      subtitle: "Amazon ML Challenge"
    },
    {
      icon: <Code2 className="w-6 h-6 text-green-400" />,
      title: "400+ DSA problems solved",
      subtitle: "Competitive Programming"
    }
  ];

  return (
    <section id="achievements" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Achievements</h2>
            <div className="h-px bg-border flex-grow max-w-xs"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {achievements.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full bg-card/40 hover:bg-card hover:border-primary/50 transition-all text-center">
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-4 h-full">
                    <div className="p-4 rounded-full bg-secondary-bg border border-border">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{item.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
