import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ProductData } from "@/types/product";
import type { AssistantMessage } from "@/types/ai";
import { sendAssistantMessage } from "@/services/ai-api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "Set up a premium travel card for Lloyds with no FX fees and lounge access",
  "Create a cashback rewards card with digital insights",
  "Configure a responsible spending card with gambling blocks",
];

function formatAssistantReply(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIndex} className="block">
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  });
}

export interface AssistantApplyMeta {
  reply: string;
  featuresAddedCount: number;
}

interface ProductConfigurationAssistantProps {
  productData: ProductData;
  onApply: (productData: ProductData, meta: AssistantApplyMeta) => void;
  disabled?: boolean;
}

export function ProductConfigurationAssistant({
  productData,
  onApply,
  disabled,
}: ProductConfigurationAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AssistantMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: AssistantMessage = { role: "user", content: trimmed };
      setHistory((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const result = await sendAssistantMessage(trimmed, productData, history);
        setHistory((prev) => [...prev, { role: "assistant", content: result.reply }]);
        onApply(result.productData, {
          reply: result.reply,
          featuresAddedCount: result.featuresAdded.length,
        });
        if (result.featuresAdded.length > 0) {
          toast({
            title: "Configuration updated",
            description: `Added ${result.featuresAdded.length} feature(s) from your request.`,
          });
        }
      } catch {
        setHistory((prev) => prev.slice(0, -1));
        toast({
          variant: "destructive",
          title: "Assistant unavailable",
          description:
            "Could not reach the AI backend. Start it with npm run dev in the backend folder (port 3001).",
        });
      } finally {
        setLoading(false);
      }
    },
    [history, loading, onApply, productData, toast],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          className="h-8 gap-1.5 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Assistant</span>
          <span className="sm:hidden">AI</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-3 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            Product Configuration Assistant
          </SheetTitle>
          <SheetDescription className="text-xs">
            Describe your card in plain English — features are selected from the catalog automatically.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 py-4 min-h-[200px]">
            {history.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Try one of these examples:</p>
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="block w-full rounded-lg border bg-muted/40 px-3 py-2 text-left text-xs hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : (
              history.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs leading-relaxed",
                    msg.role === "user"
                      ? "ml-6 bg-primary text-primary-foreground"
                      : "mr-4 bg-muted",
                  )}
                >
                  {msg.role === "assistant" ? formatAssistantReply(msg.content) : msg.content}
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Configuring product…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-3 space-y-2 bg-background">
          {productData.features.length > 0 && (
            <Badge variant="outline" className="text-[10px] font-normal">
              {productData.features.length} features selected
            </Badge>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder="e.g. Premium travel card for Lloyds, no FX fees…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              rows={2}
              className="min-h-[60px] text-sm resize-none"
              disabled={loading}
            />
            <Button
              type="button"
              size="icon"
              className="shrink-0 h-[60px] w-10"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
