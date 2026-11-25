'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ChatAvatar, Composer, MessageThread } from '@/components/chat/ChatParts';

const POLL_INTERVAL_MS = 3000;

type Message = {
  id: string;
  content: string;
  senderId: string;
  read: boolean;
  createdAt: string;
};

type ChatRoom = {
  id: string;
  admin: { id: string; fullName: string | null; email: string };
  messages: Message[];
};

type Props = {
  initialRoom: ChatRoom;
  currentUserId: string;
};

export default function MemberChatClient({ initialRoom, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialRoom.messages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages instead of subscribing to a realtime channel.
  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${initialRoom.id}`);
        if (!res.ok || cancelled) return;
        const fresh: Message[] = await res.json();
        setMessages((prev) => {
          // Keep any still-pending optimistic (temp-) messages, replace the rest.
          const pending = prev.filter((m) => m.id.startsWith('temp-'));
          const freshIds = new Set(fresh.map((m) => m.id));
          return [...fresh, ...pending.filter((m) => !freshIds.has(m.id))];
        });
      } catch {
        // Silently ignore — will retry on next interval.
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [initialRoom.id]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput('');

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      content,
      senderId: currentUserId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: initialRoom.id, content }),
      });

      if (res.ok) {
        const saved: Message = await res.json();
        // Replace optimistic with real message
        setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
      } else {
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setInput(content);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, currentUserId, initialRoom.id]);

  const adminName = initialRoom.admin.fullName || initialRoom.admin.email;

  return (
    // Self-contained card sized to the viewport (the page shell supplies padding).
    <div className="fade-up mx-auto flex h-[calc(100dvh-8rem)] min-h-[480px] max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lift md:h-[calc(100dvh-10.5rem)]">
      {/* Header */}
      <header className="relative flex shrink-0 items-center gap-3 overflow-hidden bg-brand-gradient px-4 py-4 sm:px-6">
        <span className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gold/20 blur-2xl" />
        <ChatAvatar
          name={adminName}
          size="lg"
          icon={<ShieldCheck className="h-5 w-5" />}
          className="bg-white/10 text-gold shadow-none ring-1 ring-white/20"
        />
        <div className="relative min-w-0">
          <p className="truncate font-headline text-[16px] font-bold leading-tight text-white">{adminName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            Ludeva Support Team
          </p>
        </div>
      </header>

      <MessageThread
        messages={messages}
        currentUserId={currentUserId}
        bottomRef={bottomRef}
        empty={
          <>
            <p className="font-headline text-lg font-bold">Start the conversation</p>
            <p className="max-w-xs text-sm text-muted-foreground">We&apos;re here to help with your account, deposits and reports.</p>
          </>
        }
      />

      <Composer
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        sending={sending}
        inputRef={inputRef}
        placeholder="Type a message…"
      />
    </div>
  );
}
