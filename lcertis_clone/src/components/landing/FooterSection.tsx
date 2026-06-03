const FooterSection = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="text-primary font-mono font-bold text-xs">IQ</span>
            </div>
            <span className="font-semibold text-foreground">
              Contract<span className="text-primary">IQ</span> AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Autonomous Contract Intelligence Platform — Contracts should manage themselves.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ContractIQ AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
