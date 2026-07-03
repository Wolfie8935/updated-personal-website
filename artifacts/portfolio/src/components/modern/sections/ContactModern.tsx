import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Github,
  Linkedin,
  Mail,
  Send,
  TerminalSquare,
  Link2,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";
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
  { icon: <Github className="h-5 w-5" />, label: "GitHub", handle: "@Wolfie8935", href: "https://github.com/Wolfie8935" },
  { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn", handle: "amangoel8935", href: "https://www.linkedin.com/in/amangoel8935" },
  { icon: <TerminalSquare className="h-5 w-5" />, label: "LeetCode", handle: "Wolfie8935", href: "https://leetcode.com/u/Wolfie8935/" },
  { icon: <Link2 className="h-5 w-5" />, label: "ORCID", handle: "0009-0000-0899-9400", href: "https://orcid.org/0009-0000-0899-9400" },
];

/** Floating-label field: the label rests inside the input and lifts on focus/value. */
function FloatField({
  label,
  error,
  textarea,
  inputProps,
}: {
  label: string;
  error?: string;
  textarea?: boolean;
  inputProps: Record<string, unknown>;
}) {
  const shared =
    "peer w-full rounded-xl border bg-white/5 px-4 pb-2.5 pt-6 text-sm text-foreground outline-none transition-all placeholder-transparent " +
    (error
      ? "border-red-400/70 focus:border-red-400"
      : "border-white/10 hover:border-white/20 focus:border-indigo-400/70 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]");

  return (
    <div className="relative">
      {textarea ? (
        <textarea
          rows={5}
          placeholder=" "
          className={`${shared} resize-none`}
          {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          placeholder=" "
          className={shared}
          {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      <label
        className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
          peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400"
      >
        {label}
      </label>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactModern() {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(TO_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the mailto link still works
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setStatus("sending");
      const response = await fetch(`https://formsubmit.co/ajax/${TO_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || result.success === "false") throw new Error("Failed to send message");
      setStatus("sent");
      toast({ title: "Message sent", description: "Your message has been sent successfully. Check your inbox." });
      form.reset();
      resetTimer.current = window.setTimeout(() => setStatus("idle"), 2600);
    } catch (error) {
      console.error(error);
      setStatus("idle");
      toast({
        title: "Something went wrong",
        description: "Unable to send your message right now. Please try again later.",
        variant: "destructive",
      } as never);
    }
  };

  return (
    <section id="contact" className="cv-auto relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="08" title="Get In" accent="Touch" />

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ——— Left: the invitation ——— */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <h3 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Have an idea?
              <br />
              <span className="text-aurora">Let&apos;s build it together.</span>
            </h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Open to new opportunities, collaborations, and interesting problems.
              Messages land straight in my inbox — I actually read them.
            </p>

            {/* the big email CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={`mailto:${TO_EMAIL}`} className="email-cta group inline-flex items-center gap-2">
                <Mail className="h-5 w-5 flex-shrink-0 text-indigo-400 transition-transform group-hover:-rotate-6 group-hover:scale-110" />
                <span className="email-cta-text text-lg font-semibold text-foreground sm:text-xl">
                  {TO_EMAIL}
                </span>
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={copied ? "Email copied" : "Copy email address"}
                className="press grid h-9 w-9 place-items-center rounded-full glass text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <span
                aria-live="polite"
                className={`font-mono text-xs text-emerald-400 transition-opacity duration-300 ${copied ? "opacity-100" : "opacity-0"}`}
              >
                copied!
              </span>
            </div>

            {/* socials */}
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {socialLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.07 }}
                  className="group lift flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-indigo-400/40"
                >
                  <span className="flex items-center gap-3.5">
                    <span className="icon-tile grid h-10 w-10 place-items-center rounded-lg glass text-muted-foreground group-hover:text-indigo-300">
                      {link.icon}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{link.label}</span>
                      <span className="block font-mono text-xs text-muted-foreground">{link.handle}</span>
                    </span>
                  </span>
                  <ArrowUpRight className="arrow-nudge h-4 w-4 text-muted-foreground group-hover:text-indigo-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ——— Right: the form ——— */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <GlassCard tilt={false} className="glass-blur conic-border p-7 md:p-8">
              <p className="mb-6 font-mono text-sm text-muted-foreground">
                <span className="text-indigo-400">~ $</span> send --direct
              </p>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FloatField
                    label="Name"
                    error={form.formState.errors.name?.message}
                    inputProps={{ ...form.register("name"), autoComplete: "name" }}
                  />
                  <FloatField
                    label="Email"
                    error={form.formState.errors.email?.message}
                    inputProps={{ ...form.register("email"), type: "email", autoComplete: "email", inputMode: "email" }}
                  />
                </div>
                <FloatField
                  label="Message"
                  textarea
                  error={form.formState.errors.message?.message}
                  inputProps={form.register("message")}
                />

                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className={`send-btn group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-all disabled:cursor-default
                    ${status === "sent"
                      ? "bg-emerald-500 shadow-[0_8px_30px_-6px_rgba(52,211,153,0.6)]"
                      : "bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 shadow-[0_8px_30px_-6px_rgba(99,102,241,0.6)] hover:shadow-[0_12px_40px_-6px_rgba(99,102,241,0.85)]"}
                    ${status === "sending" ? "opacity-80" : ""}`}
                >
                  {status === "sent" ? (
                    <>
                      Sent <Check className="h-4 w-4" />
                    </>
                  ) : status === "sending" ? (
                    <>
                      Sending
                      <Send className="send-plane h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Sends directly to <span className="font-mono text-indigo-400">{TO_EMAIL}</span> · no spam, ever
                </p>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
