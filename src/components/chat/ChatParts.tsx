'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ReactNode, RefObject, KeyboardEvent } from 'react';
import { Check, CheckCheck, MessageCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shared building blocks for the admin and member messaging screens so both
// panels look and behave identically.

export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  read: boolean;
  createdAt: string;
};

export function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}

/** Navy gradient avatar with gold initials (or a custom icon). */
export function ChatAvatar({
  name,
  icon,
  size = 'md',
  className,
}: {
  name: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dims = size === 'sm' ? 'h-9 w-9 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-11 w-11 text-sm';
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl bg-brand-gradient font-headline font-bold text-gold shadow-soft',
        dims,
        className
      )}
    >
      {icon ?? initialsOf(name)}
    </span>
  );
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Today';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Yesterday';
  return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

/** Scrollable message list with day separators and branded bubbles. */
export function MessageThread({
  messages,
  currentUserId,
  loading,
  empty,
  bottomRef,
}: {
  messages: ChatMessage[];
  currentUserId: string;
  loading?: boolean;
  empty?: ReactNode;
  bottomRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="page-canvas min-h-0 flex-1 space-y-1.5 overflow-y-auto bg-muted/30 px-4 py-5 sm:px-8">
      {loading && <div className="py-4 text-center text-xs text-muted-foreground">Loading messages…</div>}

      {!loading && messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-gold">
            <MessageCircle className="h-6 w-6" />
          </span>
          {empty}
        </div>
      )}

      {!loading &&
        messages.map((msg, i) => {
          const isMine = msg.senderId === currentUserId;
          const pending = msg.id.startsWith('temp-');
          const prev = messages[i - 1];
          const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
          const sameSenderAsPrev = prev && prev.senderId === msg.senderId && !newDay;

          return (
            <div key={msg.id}>
              {newDay && (
                <div className="flex justify-center py-3">
                  <span className="rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
                    {dayLabel(msg.createdAt)}
                  </span>
                </div>
              )}
              <div className={cn('flex', isMine ? 'justify-end' : 'justify-start', sameSenderAsPrev ? 'mt-0.5' : 'mt-2')}>
                <div
                  className={cn(
                    'max-w-[85%] break-words px-4 py-2.5 text-[14px] leading-relaxed sm:max-w-[68%]',
                    isMine
                      ? 'rounded-2xl rounded-br-md bg-brand-gradient text-white shadow-soft'
                      : 'rounded-2xl rounded-bl-md border border-border/60 bg-card text-card-foreground shadow-sm',
                    pending && 'opacity-60'
                  )}
                >
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                  <span
                    className={cn(
                      'mt-1 flex items-center gap-1 text-[10.5px] font-medium',
                      isMine ? 'justify-end text-white/60' : 'text-muted-foreground'
                    )}
                  >
                    {formatTime(msg.createdAt)}
                    {isMine && !pending &&
                      (msg.read ? <CheckCheck className="h-3.5 w-3.5 text-gold" /> : <Check className="h-3.5 w-3.5" />)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      <div ref={bottomRef} />
    </div>
  );
}

/** Auto-growing message box + gold send button. */
export function Composer({
  value,
  onChange,
  onSend,
  sending,
  placeholder,
  inputRef,
  disabledReason,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder?: string;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  /** When set the box is locked and this text is shown instead (e.g. view-only admins). */
  disabledReason?: string;
}) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? localRef;
  const locked = Boolean(disabledReason);

  // grow with content, up to ~6 lines
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [value, ref]);

  useEffect(() => {
    if (!sending) ref.current?.focus();
  }, [sending, ref]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-card px-3 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:px-5">
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border border-input bg-background px-3 py-2 shadow-sm transition-shadow focus-within:border-gold/60 focus-within:ring-2 focus-within:ring-gold/25',
          locked && 'opacity-70'
        )}
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={disabledReason ?? placeholder ?? 'Type a message…'}
          disabled={sending || locked}
          className="max-h-36 min-h-[2.25rem] flex-1 resize-none bg-transparent py-1.5 text-[14px] leading-snug text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim() || sending || locked}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient shadow-glow transition-all hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {!locked && (
        <p className="mt-1.5 hidden text-center text-[11px] text-muted-foreground sm:block">
          Press <kbd className="rounded bg-muted px-1 font-sans">Enter</kbd> to send · <kbd className="rounded bg-muted px-1 font-sans">Shift</kbd>+<kbd className="rounded bg-muted px-1 font-sans">Enter</kbd> for a new line
        </p>
      )}
    </div>
  );
}
