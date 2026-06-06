import { Github, Linkedin, Mail, Heart } from "lucide-react";

const links = [
  { icon: <Github className="h-4 w-4" />, href: "https://github.com/Wolfie8935", label: "GitHub" },
  { icon: <Linkedin className="h-4 w-4" />, href: "https://www.linkedin.com/in/amangoel8935", label: "LinkedIn" },
  { icon: <Mail className="h-4 w-4" />, href: "mailto:goel07.aman@gmail.com", label: "Email" },
];

export function FooterModern() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-white/10 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="font-mono text-sm text-foreground">
              Aman<span className="text-aurora">Goel</span>
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              &copy; {year} · built with <Heart className="inline h-3 w-3 text-pink-400" /> caffeine &amp; curiosity
            </p>
            <a
              href="https://wolfie8935.github.io/My_Personal_Website/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              Old website ↗
            </a>
          </div>

          <div className="flex items-center gap-3">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={l.label}
                className="grid h-10 w-10 place-items-center rounded-full glass text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground hover:border-white/30"
              >
                {l.icon}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[11px] text-muted-foreground/50">
          psst… there&apos;s a third theme hiding in the toggle. ⚡
        </p>
      </div>
    </footer>
  );
}
