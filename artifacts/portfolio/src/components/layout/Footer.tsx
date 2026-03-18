export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-sm font-mono">
          &copy; {new Date().getFullYear()} Aman Goel
        </p>
        <p className="text-muted-foreground text-sm">
          Built with <span className="text-primary font-medium">Love</span> and <span className="text-secondary font-medium">Care</span>
        </p>
      </div>
    </footer>
  );
}
