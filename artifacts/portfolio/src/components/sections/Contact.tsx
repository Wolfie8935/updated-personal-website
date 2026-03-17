import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Github, Linkedin, Mail, Send, TerminalSquare, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const TO_EMAIL = "goel07.aman@gmail.com";

export function Contact() {
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === "false") {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully. Check your inbox.",
      });

      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Unable to send your message right now. Please try again later.",
        variant: "destructive",
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, label: "GitHub", href: "https://github.com/Wolfie8935" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", href: "https://www.linkedin.com/in/amangoel8935" },
    { icon: <TerminalSquare className="w-5 h-5" />, label: "LeetCode", href: "https://leetcode.com/u/Wolfie8935/" },
    { icon: <Link2 className="w-5 h-5" />, label: "ORCID", href: "https://orcid.org/0009-0000-0899-9400" },
    { icon: <Mail className="w-5 h-5" />, label: "Email", href: `mailto:${TO_EMAIL}` },
  ];

  return (
    <section id="contact" className="py-24 bg-secondary-bg/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get In Touch</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              I'm open to new opportunities and collaborations. Fill out the form and your email client will open pre-filled — or reach out directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-6 font-mono">&gt; Connect</h3>
                <div className="flex flex-col gap-3">
                  {socialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      target={link.href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 hover:text-primary transition-all group"
                    >
                      <div className="p-2 bg-secondary-bg rounded-lg group-hover:bg-primary/10 transition-colors">
                        {link.icon}
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card className="bg-card border-border/80">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Name</label>
                        <Input
                          placeholder="Your name"
                          {...form.register("name")}
                          className={form.formState.errors.name ? "border-red-500" : ""}
                        />
                        {form.formState.errors.name && (
                          <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
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
                          <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
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
                        <p className="text-xs text-red-500">{form.formState.errors.message.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : (
                        <>Send Message <Send className="ml-2 w-4 h-4" /></>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Sends directly to <span className="text-primary font-mono">{TO_EMAIL}</span> without opening your email app
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
