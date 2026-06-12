import { Send, StopCircle, Bot, Settings2, WifiOff } from 'lucide-react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { MessageBubble } from './MessageBubble';
import { CoachSelector } from './CoachSelector';
import { useAIStore, type CoachRole, type UserContext } from '@/stores/ai.store';
import { sendChatMessageStream, checkProviderStatus } from '@/lib/ai-api';
import type { AIMessage } from '@/lib/ai-api';

const ROLE_STARTERS: Record<CoachRole, string[]> = {
  achievement: [
    'What should I focus on this week?',
    'How is my overall progress?',
    'Which domain needs most attention?',
    "Give me a motivational push",
  ],
  academic: [
    'How can I improve my board exam prep?',
    'Create a study schedule for this week',
    'Which subjects need more attention?',
    'How should I approach spaced repetition?',
  ],
  startup: [
    "What's the most important thing to build next?",
    'How do I balance studies and building?',
    'Review my current startup metrics',
    'How do I get my first 100 users?',
  ],
  chess: [
    'How do I break past my current rating?',
    'What should my training focus be?',
    'Explain a training plan for this week',
    "Why am I losing games I should win?",
  ],
  guitar: [
    'What should I practice today?',
    'How do I get past the F chord barrier?',
    'Design a 30-minute practice session',
    'How do I build speed without losing accuracy?',
  ],
};

const ROLE_LABELS: Record<CoachRole, string> = {
  achievement: 'Achievement Coach',
  academic: 'Academic Coach',
  startup: 'Startup Coach',
  chess: 'Chess Coach',
  guitar: 'Guitar Coach',
};

interface ProviderStatus {
  provider: string;
  configured: boolean;
  envVar: string;
}

interface ChatInterfaceProps {
  context: UserContext;
}

export function ChatInterface({ context }: ChatInterfaceProps) {
  const {
    conversations,
    activeConversationId,
    activeRole,
    isStreaming,
    setActiveRole,
    newConversation,
    addMessage,
    appendStreamChunk,
    finalizeStream,
    setIsStreaming,
    setStreamingContent,
    setActiveConversation,
  } = useAIStore();

  const [input, setInput] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  useEffect(() => {
    checkProviderStatus()
      .then(setProviderStatus)
      .catch(() => setProviderStatus(null));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const ensureConversation = useCallback(() => {
    if (activeConversationId) return activeConversationId;
    return newConversation(activeRole);
  }, [activeConversationId, activeRole, newConversation]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    const convId = ensureConversation();
    addMessage(convId, { role: 'user', content: text });

    const conv = useAIStore.getState().conversations.find((c) => c.id === convId);
    const history: AIMessage[] = (conv?.messages ?? [])
      .filter((m) => m.id !== 'streaming')
      .map((m) => ({ role: m.role, content: m.content }));

    const ac = new AbortController();
    setAbortController(ac);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      await sendChatMessageStream(history, activeRole, context, (chunk) => {
        if (!ac.signal.aborted) {
          appendStreamChunk(convId, chunk);
        }
      });
    } catch (err) {
      if (!ac.signal.aborted) {
        addMessage(convId, {
          role: 'assistant',
          content: `⚠️ ${err instanceof Error ? err.message : 'Request failed. Check your AI provider configuration.'}`,
        });
        setIsStreaming(false);
        setStreamingContent('');
        return;
      }
    }

    finalizeStream(convId);
    setAbortController(null);
  }, [
    input,
    isStreaming,
    activeRole,
    context,
    ensureConversation,
    addMessage,
    appendStreamChunk,
    finalizeStream,
    setIsStreaming,
    setStreamingContent,
  ]);

  const handleStop = () => {
    abortController?.abort();
    if (activeConversationId) finalizeStream(activeConversationId);
    setAbortController(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRoleChange = (role: CoachRole) => {
    setActiveRole(role);
    setShowRoleSelector(false);
    setActiveConversation(null);
  };

  const handleStarterClick = (starter: string) => {
    setInput(starter);
    textareaRef.current?.focus();
  };

  const messages = activeConversation?.messages ?? [];
  const starters = ROLE_STARTERS[activeRole];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{ROLE_LABELS[activeRole]}</p>
            {providerStatus && (
              <p className="text-xs text-muted-foreground">
                {providerStatus.configured ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {providerStatus.provider}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <WifiOff className="w-3 h-3" />
                    No API key
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowRoleSelector(!showRoleSelector)}
          className="h-8 px-2"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {showRoleSelector && (
        <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2.5 font-medium">Switch coach mode</p>
          <CoachSelector value={activeRole} onChange={handleRoleChange} compact />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{ROLE_LABELS[activeRole]}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Ask me anything about your{' '}
                {activeRole === 'achievement' ? 'overall performance' : activeRole} progress,
                strategy, or what to focus on next.
              </p>
            </div>

            {!providerStatus?.configured && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-600 dark:text-yellow-400 max-w-sm">
                <WifiOff className="w-4 h-4 inline mr-1.5" />
                Set <code className="font-mono text-xs bg-yellow-500/20 px-1 rounded">{providerStatus?.envVar ?? 'OPENAI_API_KEY'}</code> to enable AI responses.
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStarterClick(s)}
                  className="text-left px-3.5 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && msg.id === 'streaming'}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 border-t border-border p-3">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask your ${ROLE_LABELS[activeRole]}...`}
            className="resize-none min-h-[44px] max-h-[120px] text-sm"
            rows={1}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button size="sm" variant="destructive" onClick={handleStop} className="h-11 px-3">
              <StopCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-11 px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 px-0.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
