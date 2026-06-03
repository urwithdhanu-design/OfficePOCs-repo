import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { Pause, Play, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

interface TabCarouselShellProps {
  tabs: TabItem[];
  headerLeft?: ReactNode;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  rotateIntervalMs?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  renderContent?: (tab: TabItem, index: number) => ReactNode;
}

const TabCarouselShell = ({
  tabs,
  headerLeft,
  headerCenter,
  headerRight,
  rotateIntervalMs = 8000,
  activeIndex: controlledIndex,
  onActiveIndexChange,
  renderContent,
}: TabCarouselShellProps) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeIndex = controlledIndex ?? internalIndex;

  const goToTab = useCallback(
    (index: number) => {
      if (controlledIndex === undefined) {
        setInternalIndex(index);
      }
      onActiveIndexChange?.(index);
      setProgress(0);
    },
    [controlledIndex, onActiveIndexChange]
  );

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    container.querySelectorAll(".animate-on-scroll").forEach((el) => el.classList.add("visible"));
  }, [activeIndex]);

  useEffect(() => {
    if (paused) return;

    setProgress(0);
    const tickMs = 50;
    const increment = (tickMs / rotateIntervalMs) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + increment));
    }, tickMs);

    const rotateTimer = setInterval(() => {
      const next = (activeIndex + 1) % tabs.length;
      goToTab(next);
    }, rotateIntervalMs);

    return () => {
      clearInterval(progressTimer);
      clearInterval(rotateTimer);
    };
  }, [paused, activeIndex, rotateIntervalMs, tabs.length, goToTab]);

  const activeTab = tabs[activeIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 md:px-6 h-16 gap-4">
          <div className="shrink-0">{headerLeft}</div>
          <div className="hidden md:block flex-1 text-center">{headerCenter}</div>
          <div className="shrink-0">{headerRight}</div>
        </div>

        <div className="px-4 md:px-6 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => goToTab(index)}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300",
                  activeIndex === index
                    ? "bg-primary text-primary-foreground font-medium scale-[1.02] shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto shrink-0 h-8 w-8 p-0"
              onClick={() => setPaused((p) => !p)}
              title={paused ? "Resume auto-rotation" : "Pause auto-rotation"}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
          <Progress value={paused ? 0 : progress} className="h-1 mt-3 transition-all" />
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div
          ref={contentRef}
          key={activeTab.id}
          className="animate-fade-up tab-content-enter"
          style={{ animationDuration: "0.5s" }}
        >
          {renderContent ? renderContent(activeTab, activeIndex) : activeTab.content}
        </div>
      </main>
    </div>
  );
};

export default TabCarouselShell;
