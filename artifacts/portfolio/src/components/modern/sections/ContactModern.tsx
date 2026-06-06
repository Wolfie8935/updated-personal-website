import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github, Linkedin, Mail, Send, TerminalSquare, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { GlassCard } from "@/components/modern/GlassCard";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const TO_EMAIL = "goel07.aman@gmail.com";

const socialLinks = [
  { icon: <Github className="h-5 w-5" />, label: "GitHub", href: "https://github.com/Wolfie8935" },
  { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn", href: "https://www.linkedin.com/in/amangoel8935" },
  { icon: <TerminalSquare className="h-5 w-5" />, label: "LeetCode", href: "https://leetcode.com/u/Wolfie8935/" },
  { icon: <Link2 className="h-5 w-5" />, label: "ORCID", href: "https://orcid.org/0009-0000-0899-9400" },
  { icon: <Mail className="h-5 w-5" />, label: "Email", href: `mailto:${TO_EMAIL}` },
];

export function ContactModern() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`https://formsubmit.co/ajax/${TO_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || result.success === "false") throw new Error("Failed to send message");
      toast({ title: "Message sent", description: "Your message has been sent successfully. Check your inbox." });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Unable to send your message right now. Please try again later.",
        variant: "destructive",
      } as never);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="cv-auto relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="08" title="Get In" accent="Touch" align="center" />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto -mt-6 mb-14 max-w-2xl text-center text-lg text-muted-foreground"
        >
          Open to new opportunities and collaborations. Send a message — it lands straight in my inbox —
          or reach out on any platform below.
        </motion.p>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <GlassCard tilt={false} className="h-full p-7">
              <h3 className="mb-6 font-mono text-xl font-bold text-foreground">&gt; Connect</h3>
              <div className="flex flex-col gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-400/40 hover:text-indigo-300"
                  >
                    <span className="icon-tile grid h-10 w-10 place-items-center rounded-lg glass group-hover:text-indigo-300">
                      {link.icon}
                    </span>
                    <span className="font-medium text-foreground group-hover:text-indigo-300">{link.label}</span>
                  </a>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <GlassCard tilt={false} className="h-full p-7">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <Input
                      placeholder="Your name"
                      {...form.register("name")}
                      className={form.formState.errors.name ? "border-red-500" : ""}
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...form.register("email")}
                      className={form.formState.errors.email ? "border-red-500" : ""}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea
                    rows={5}
                    placeholder="Hi Aman, I'd love to connect about..."
                    className={`resize-none ${form.formState.errors.message ? "border-red-500" : ""}`}
                    {...form.register("message")}
                  />
                  {form.formState.errors.message && (
                    <p className="text-xs text-red-400">{form.formState.errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_-6px_rgba(99,102,241,0.6)] transition-all hover:shadow-[0_12px_40px_-6px_rgba(99,102,241,0.85)] disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : (
                    <>Send Message <Send className="h-4 w-4" /></>
                  )}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Sends directly to <span className="font-mono text-indigo-400">{TO_EMAIL}</span>
                </p>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
