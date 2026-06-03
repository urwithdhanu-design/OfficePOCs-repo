const AspectRatio = ({ ratio = 1, children, className, ...props }: { ratio?: number; children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} style={{ position: 'relative', width: '100%', paddingBottom: `${100 / ratio}%` }} {...props}>
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
      {children}
    </div>
  </div>
);

export { AspectRatio };
