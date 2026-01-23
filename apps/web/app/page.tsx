'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { Send, Terminal, Wallet, ArrowRightLeft, Search, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UI Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components (Minimal Shadcn-like) ---
const Button = ({ className, size = 'default', variant = 'default', ...props }: any) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    icon: 'h-10 w-10',
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    icon: 'h-10 w-10',
  };
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant as keyof typeof variants],
        size === 'icon' ? sizes.icon : sizes.default,
        className
      )}
      {...props}
    />
  );
};

const Input = ({ className, ...props }: any) => (
  <input
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
);

const Card = ({ className, children }: any) => (
  <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
    {children}
  </div>
);

// --- Tool Renderers ---
const ToolCall = ({ toolName, args, result }: { toolName: string; args: any; result?: any }) => {
  const isPending = !result;

  let Icon = Terminal;
  if (toolName === 'swap') Icon = ArrowRightLeft;
  if (toolName === 'transfer') Icon = Send;
  if (toolName === 'get_portfolio') Icon = Wallet;
  if (toolName === 'search_knowledge') Icon = Search;

  return (
    <Card className="my-2 p-3 border-border/50 bg-secondary/20">
      <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
        <Icon className="w-3 h-3" />
        <span>Executing: {toolName}</span>
        {isPending && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
      </div>
      
      <div className="text-xs font-mono text-foreground/80 mb-2 whitespace-pre-wrap">
        {JSON.stringify(args, null, 2)}
      </div>

      {result && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="text-[10px] text-muted-foreground mb-1 uppercase">Result</div>
          <div className="text-xs font-mono text-green-400/90 whitespace-pre-wrap">
             {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
          </div>
        </div>
      )}
    </Card>
  );
};

// --- Main Chat Page ---
export default function ChatPage() {
  const { messages, status, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Send message using 'parts' structure
    await sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: input }]
    } as any); // Cast to any to bypass potential type mismatches in this specific setup
    
    setInput('');
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex items-center h-14 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Terminal className="w-5 h-5" />
          <span>Lucci SDK</span>
          <span className="text-xs font-mono font-normal text-muted-foreground px-2 py-0.5 rounded bg-secondary ml-2">
            v0.1.0-alpha
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <Terminal className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ready to execute DeFi actions. Try "Check my portfolio" or "Swap 1 SOL to USDC".
            </p>
          </div>
        )}

        {messages.map((m: any) => (
          <div key={m.id} className={cn("flex flex-col gap-2 max-w-3xl mx-auto", m.role === 'user' ? 'items-end' : 'items-start')}>
            
            {/* Render Parts */}
            {m.parts ? (
              m.parts.map((part: any, i: number) => {
                if (part.type === 'text') {
                  // Only render if text is not empty
                  if (!part.text) return null;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm shadow-sm max-w-[85%]",
                        m.role === 'user' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-foreground"
                      )}
                    >
                      {part.text}
                    </div>
                  );
                }

                if (part.type === 'tool-invocation') {
                  const toolInvocation = part.toolInvocation;
                  return (
                    <div key={i} className="w-full max-w-[85%]">
                       <ToolCall 
                          toolName={toolInvocation.toolName} 
                          args={toolInvocation.args} 
                          result={'result' in toolInvocation ? toolInvocation.result : undefined} 
                       />
                    </div>
                  );
                }
                
                return null;
              })
            ) : (
              // Fallback for content string if available
              m.content && (
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm shadow-sm max-w-[85%]",
                    m.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  )}
                >
                  {m.content}
                </div>
              )
            )}
            
            {/* Fallback for Tool Invocations if not in parts (legacy/helper check) */}
            {!m.parts && m.toolInvocations?.map((toolInvocation: any) => (
              <div key={toolInvocation.toolCallId} className="w-full max-w-[85%]">
                 <ToolCall 
                    toolName={toolInvocation.toolName} 
                    args={toolInvocation.args} 
                    result={'result' in toolInvocation ? toolInvocation.result : undefined} 
                 />
              </div>
            ))}

          </div>
        ))}
        
        {/* Thinking / Loading State */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse max-w-3xl mx-auto w-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Lucci is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t bg-background">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your command..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} size="icon">
              <Send className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}