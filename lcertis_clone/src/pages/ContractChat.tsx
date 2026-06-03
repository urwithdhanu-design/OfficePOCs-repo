import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatResponses } from "@/data/mockContracts";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedPrompts = [
  "When does this contract expire?",
  "What penalties exist?",
  "Show all payment obligations.",
  "Compare with company policy.",
];

const findResponse = (input: string): string => {
  const normalized = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(chatResponses)) {
    if (normalized.includes(key) || key.includes(normalized.slice(0, 20))) {
      return value;
    }
  }
  return "I've analyzed the Enterprise SaaS License Agreement. Based on my review, this contract has **3 critical risk areas** and expires on March 31, 2026. Would you like me to elaborate on renewal terms, payment obligations, or policy compliance gaps?";
};

const ContractChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your ContractIQ AI assistant. I have full context on the **Enterprise SaaS License Agreement**. Ask me anything about expiry dates, penalties, obligations, or policy compliance.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: findResponse(text) }]);
      setIsTyping(false);
    }, 1200);
  };

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      if (line.startsWith("|")) {
        return (
          <span key={i} className="block font-mono text-xs text-muted-foreground">
            {line}
          </span>
        );
      }
      if (line.startsWith("•") || /^\d+\./.test(line)) {
        return (
          <span key={i} className="block pl-2" dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
      return line ? (
        <span key={i} className="block" dangerouslySetInnerHTML={{ __html: formatted }} />
      ) : (
        <br key={i} />
      );
    });
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Contract Chat</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ask questions about your contracts in natural language
        </p>
      </div>

      <Card className="flex-1 glass-surface gradient-border flex flex-col min-h-0">
        <CardHeader className="pb-3 border-b border-border shrink-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Enterprise SaaS License Agreement
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  )}
                >
                  {renderMarkdown(msg.content)}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border shrink-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about this contract..."
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractChat;
