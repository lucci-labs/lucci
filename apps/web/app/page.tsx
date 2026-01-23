'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { Send, Terminal, Wallet, ArrowRightLeft, Search, Loader2, ListChecks } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- UI Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Thêm import này vào đầu file
import { CheckCircle2, CheckCircle, XCircle } from 'lucide-react';

const ToolCall = ({
  toolName,
  args,
  result,
  toolCallId,
  isConfirmed,
  onConfirm,
  onCancel
}: {
  toolName: string;
  args: any;
  result?: any;
  toolCallId?: string;
  isConfirmed?: boolean;
  onConfirm?: (txHash: string) => void;
  onCancel?: () => void;
}) => {
  const isPending = !result;
  const requiresConfirmation = result?.status === 'requires_confirmation';
  const showConfirmedState = isConfirmed || result?.status === 'confirmed'; // Show confirmed if legally confirmed OR locally confirmed

  let Icon = Terminal;
  if (toolName === 'swap') Icon = ArrowRightLeft;
  if (toolName === 'transfer') Icon = Send;
  if (toolName === 'get_portfolio') Icon = Wallet;
  if (toolName === 'search_knowledge') Icon = Search;

  return (
    <Card className={cn(
      "my-2 p-3 border-border/50 transition-all",
      requiresConfirmation && !showConfirmedState ? "border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "bg-secondary/20"
    )}>
      <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
        <Icon className={cn("w-3 h-3", requiresConfirmation && !showConfirmedState && "text-primary animate-pulse")} />
        <span>{requiresConfirmation && !showConfirmedState ? "Action Required" : `Executing: ${toolName}`}</span>
        {isPending && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
      </div>

      {/* Hiển thị thông tin tóm tắt thay vì JSON thô nếu cần confirm */}
      {requiresConfirmation && !showConfirmedState ? (
        <div className="py-2">
          <div className="text-sm font-medium mb-1 text-foreground">
            {result.summary || `Confirm ${toolName} operation`}
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Please sign the transaction in your wallet to proceed.
          </p>
        </div>
      ) : (
        <div className="text-xs font-mono text-foreground/80 mb-2 whitespace-pre-wrap bg-background/40 p-2 rounded">
          {JSON.stringify(args, null, 2)}
        </div>
      )}

      {/* Render Nút Confirm nếu trạng thái là chờ ký và chưa confirm */}
      {requiresConfirmation && !showConfirmedState && onConfirm && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-2"
            onClick={async () => {
              try {
                // ĐOẠN NÀY BẠN SẼ GỌI WALLET ADAPTER THẬT
                console.log("Signing TX:", result.unsignedTx);

                // Giả lập việc ký ví thành công
                const mockTxHash = "5H6p...vW2Z";

                onConfirm(mockTxHash);
              } catch (err) {
                console.error("User rejected", err);
              }
            }}
          >
            <CheckCircle2 className="w-3 h-3" />
            Sign & Execute
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] text-muted-foreground"
            onClick={() => onCancel && onCancel()}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Kết quả sau khi đã confirmed HOẶC kết quả từ tool lấy dữ liệu */}
      {(result && !requiresConfirmation) || showConfirmedState ? (
        <div className="mt-2 pt-2 border-t border-border/50">
          {(toolName === 'swap' || toolName === 'transfer') ? (
            // Layout cho Transaction (Swap, Transfer)
            <>
              <div className="flex items-center gap-2 text-green-400/90">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Transaction Confirmed</span>
              </div>
              <div className="text-xs font-mono mt-1 break-all opacity-80">
                Hash: {isConfirmed ? "5H6p...vW2Z" : (result?.txHash || JSON.stringify(result))}
              </div>
            </>
          ) : (
            // Layout cho Data Fetching (Get Portfolio, Search, etc.)
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary/80">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Result Fetched</span>
              </div>
              <div className="text-xs font-mono text-foreground/80 whitespace-pre-wrap bg-background/40 p-2 rounded max-h-[200px] overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
};

// --- Components ---
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

// --- Custom Markdown Components ---
const MarkdownComponents = {
  // Style bold text (usually tokens or protocols)
  strong: ({ children }: any) => (
    <strong className="font-bold text-primary italic px-0.5">{children}</strong>
  ),
  // Style inline code (usually addresses or tx hashes)
  code: ({ children }: any) => (
    <code className="bg-secondary px-1.5 py-0.5 rounded font-mono text-xs text-foreground/90 border border-border/50">
      {children}
    </code>
  ),
  // Style lists (usually plans)
  ul: ({ children }: any) => (
    <div className="my-4 p-3 bg-secondary/10 border border-primary/20 rounded-lg relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-primary uppercase tracking-widest">
        <ListChecks className="w-3 h-3" />
        <span>Action Plan</span>
      </div>
      <ul className="space-y-1.5 relative z-10">{children}</ul>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <ListChecks className="w-16 h-12" />
      </div>
    </div>
  ),
  li: ({ children }: any) => (
    <li className="flex items-start gap-2 text-sm">
      <span className="text-primary mt-1.5 block h-1 w-1 rounded-full bg-primary shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  // Standard paragraph
  p: ({ children }: any) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
};

// --- Main Chat Page ---
// --- Main Chat Page ---
export default function ChatPage() {
  const { messages, status, sendMessage, addToolResult } = useChat();
  const [input, setInput] = useState('');
  const [confirmedTx, setConfirmedTx] = useState<Record<string, string>>({}); // Track confirmed transactions locally
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: input }]
    } as any);

    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  console.log("Messages:", messages);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <header className="flex items-center h-14 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Terminal className="w-5 h-5" />
          <span>Lucci SDK</span>
          <span className="text-xs font-mono font-normal text-muted-foreground px-2 py-0.5 rounded bg-secondary ml-2">
            v0.1.0-alpha
          </span>
        </div>
      </header>

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
                  if (!part.text) return null;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm shadow-sm max-w-[90%]",
                        m.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {part.text}
                      </ReactMarkdown>
                    </div>
                  );
                }

                // Handle standard ToolInvocation part OR flat tool part (legacy/custom)
                const isToolPart = part.type === 'tool-invocation' || part.toolCallId || part.type?.startsWith('tool-');

                if (isToolPart && part.type !== 'text') { // Ensure we don't catch text parts by accident
                  const toolInvocation = part.toolInvocation || part;
                  const toolName = toolInvocation.toolName || (part.type?.startsWith('tool-') ? part.type.replace('tool-', '') : 'unknown');

                  return (
                    <div key={toolInvocation.toolCallId || i} className="w-full max-w-[90%]">
                      <ToolCall
                        toolName={toolName}
                        args={toolInvocation.args || toolInvocation.input} // Handle 'input' alias seen in some logs
                        toolCallId={toolInvocation.toolCallId}
                        result={'result' in toolInvocation ? toolInvocation.result : ('output' in toolInvocation ? toolInvocation.output : undefined)} // Handle 'output' alias
                        onConfirm={(txHash) => {
                          setConfirmedTx(prev => ({ ...prev, [toolInvocation.toolCallId]: txHash }));
                          sendMessage({
                            role: 'user',
                            parts: [{ type: 'text', text: `Transaction Confirmed. Hash: ${txHash}` }]
                          } as any);
                        }}
                        onCancel={() => {
                          sendMessage({ role: 'user', parts: [{ type: 'text', text: 'Transaction Cancelled' }] } as any);
                        }}
                      />
                    </div>
                  );
                }

                return null;
              })
            ) : (
              // Fallback for non-multipart messages (legacy or intermediate states)
              m.content && (
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm shadow-sm max-w-[90%]",
                    m.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              )
            )}

            {/* Handle legacy toolInvocations array if tool-invocation parts aren't present */}
            {!m.parts && m.toolInvocations?.map((toolInvocation: any) => (
              <div key={toolInvocation.toolCallId} className="w-full max-w-[90%]">
                <ToolCall
                  toolName={toolInvocation.toolName}
                  args={toolInvocation.args}
                  toolCallId={toolInvocation.toolCallId}
                  result={'result' in toolInvocation ? toolInvocation.result : undefined}
                />
              </div>
            ))}

          </div>
        ))}

        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse max-w-3xl mx-auto w-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Lucci is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

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
