'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, MessageCircle, ShieldCheck } from 'lucide-react';

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const adminName = initialRoom.admin.fullName || initialRoom.admin.email;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{adminName}</p>
          <p className="text-xs text-emerald-500">Support Team</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <MessageCircle className="w-10 h-10 opacity-30" />
            <p className="text-sm">Start the conversation — we're here to help.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm shadow-sm'
                } ${msg.id.startsWith('temp-') ? 'opacity-60' : ''}`}
              >
                {msg.content}
                <p className={`text-[10px] mt-1 ${isMine ? 'text-emerald-200 text-right' : 'text-gray-400'}`}>
                  {formatTime(msg.createdAt)}
                  {isMine && !msg.id.startsWith('temp-') && (
                    <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white disabled:opacity-40 transition-opacity hover:bg-emerald-700"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-1.5">Press Enter to send</p>
      </div>
    </div>
  );
}
