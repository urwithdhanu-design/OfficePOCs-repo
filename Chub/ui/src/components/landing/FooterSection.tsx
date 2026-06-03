const FooterSection = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/15 flex items-center justify-center">
            <span className="text-primary font-mono font-bold text-xs">C</span>
          </div>
          <span className="text-sm text-muted-foreground">C Hub — Central Configuration Platform</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="#" className="hover:text-foreground transition-colors">Status</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
