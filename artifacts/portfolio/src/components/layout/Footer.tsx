export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-muted-foreground text-sm font-mono">
            &copy; {new Date().getFullYear()} Aman Goel
          </p>
          <a
            href="https://wolfie8935.github.io/My_Personal_Website/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/70 text-xs hover:text-primary transition-colors"
          >
            Old website
          </a>
        </div>
        <p className="text-muted-foreground text-sm">
          Built with <span className="text-primary font-medium">Love</span> and <span className="text-secondary font-medium">Care</span>
        </p>
      </div>
    </footer>
  );
}
