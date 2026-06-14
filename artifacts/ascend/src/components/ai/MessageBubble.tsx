import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/stores/ai.store';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('• ') || line.startsWith('- ')) {
        const items: string[] = [];
        while (i < lines.length && (lines[i].startsWith('• ') || lines[i].startsWith('- '))) {
          items.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={i} className="list-none space-y-1 my-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        elements.push(
          <p key={i} className="font-semibold text-foreground mt-3 mb-1">
            {line.slice(2, -2)}
          </p>
        );
        i++;
        continue;
      }

      if (line.trim() === '') {
        if (elements.length > 0) {
          elements.push(<div key={i} className="h-1" />);
        }
        i++;
        continue;
      }

      elements.push(
        <p key={i} className="leading-relaxed">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 border border-primary/20 text-primary'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={cn('max-w-[78%] space-y-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted/60 border border-border/40 rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p className="leading-relaxed">{message.content}</p>
          ) : (
            <div className="text-foreground space-y-0.5">
              {renderContent(message.content)}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>

        {!isUser && !isStreaming && message.content && (
          <button
            onClick={copyToClipboard}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-1"
          >
            {copied ? (
              <><Check className="w-3 h-3" /> Copied</>
            ) : (
              <><Copy className="w-3 h-3" /> Copy</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
