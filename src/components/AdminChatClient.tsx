'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageCircle, Search, ArrowLeft, Eye } from 'lucide-react';
import { ChatAvatar, Composer, MessageThread } from '@/components/chat/ChatParts';
import { useAdminAccess } from '@/components/admin/AdminAccessProvider';

const MESSAGE_POLL_INTERVAL_MS = 3000;
const ROOM_LIST_POLL_INTERVAL_MS = 6000;

type Message = {
  id: string;
  content: string;
  senderId: string;
  read: boolean;
  createdAt: string;
};

type Member = {
  id: string;
  fullName: string | null;
  email: string;
};

type Room = {
  id: string;
  member: Member;
  messages: Message[];
};

type Props = {
  initialRooms: Room[];
  currentUserId: string;
};

export default function AdminChatClient({ initialRooms, currentUserId }: Props) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    initialRooms[0]?.id ?? null
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [startingRoomFor, setStartingRoomFor] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { canEdit } = useAdminAccess();
  const canSend = canEdit('chat');

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages]);

  // Poll the active room's full message history instead of subscribing to a
  // realtime channel.
  useEffect(() => {
    if (!activeRoomId) return;
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/admin/messages?roomId=${activeRoomId}`);
        if (!res.ok || cancelled) return;
        const fresh: Message[] = await res.json();
        setRooms((prev) =>
          prev.map((room) => {
            if (room.id !== activeRoomId) return room;
            // Keep any still-pending optimistic (temp-) messages.
            const pending = room.messages.filter((m) => m.id.startsWith('temp-'));
            const freshIds = new Set(fresh.map((m) => m.id));
            return { ...room, messages: [...fresh, ...pending.filter((m) => !freshIds.has(m.id))] };
          })
        );
      } catch {
        // Silently ignore — will retry on next interval.
      }
    };

    const interval = setInterval(fetchMessages, MESSAGE_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeRoomId]);

  // Poll the room list on a slower interval to pick up new conversations and
  // updated unread counts / last-message previews for inactive rooms.
  useEffect(() => {
    let cancelled = false;

    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/admin/chats');
        if (!res.ok || cancelled) return;
        const fresh: Room[] = await res.json();
        setRooms((prev) =>
          fresh.map((freshRoom) => {
            // Preserve the actively-open room's full message history — the
            // list endpoint only returns a 1-message preview per room.
            if (freshRoom.id === activeRoomId) {
              const existing = prev.find((r) => r.id === freshRoom.id);
              return existing ? { ...freshRoom, messages: existing.messages } : freshRoom;
            }
            return freshRoom;
          })
        );
      } catch {
        // Silently ignore — will retry on next interval.
      }
    };

    const interval = setInterval(fetchRooms, ROOM_LIST_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeRoomId]);

  // Debounced search across ALL members (not just ones with an existing
  // room) so admins can find and start a conversation with anyone.
  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setMemberResults([]);
      return;
    }

    setSearchingMembers(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/members-search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const members: Member[] = await res.json();
          setMemberResults(members);
        }
      } catch {
        // Ignore — user can retry by continuing to type.
      } finally {
        setSearchingMembers(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // Starts (or opens, if one already exists) a chat room with a member found
  // via search who doesn't yet appear in the room list.
  const startChatWithMember = useCallback(async (member: Member) => {
    setStartingRoomFor(member.id);
    try {
      const res = await fetch('/api/admin/chats/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      if (!res.ok) return;

      const room: Room = await res.json();
      setRooms((prev) => (prev.some((r) => r.id === room.id) ? prev : [room, ...prev]));
      setActiveRoomId(room.id);
      setSearch('');
      setMemberResults([]);
    } finally {
      setStartingRoomFor(null);
    }
  }, []);

  // When switching rooms, fetch full message history
  const openRoom = useCallback(async (roomId: string) => {
    if (roomId === activeRoomId) return;
    setActiveRoomId(roomId);
    setLoadingRoom(true);

    try {
      const res = await fetch(`/api/admin/messages?roomId=${roomId}`);
      if (res.ok) {
        const messages: Message[] = await res.json();
        setRooms((prev) =>
          prev.map((room) => (room.id === roomId ? { ...room, messages } : room))
        );
      }
    } finally {
      setLoadingRoom(false);
    }
  }, [activeRoomId]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || sending || !activeRoomId) return;

    setSending(true);
    setInput('');

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      content,
      senderId: currentUserId,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoomId
          ? { ...room, messages: [...room.messages, optimistic] }
          : room
      )
    );

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: activeRoomId, content }),
      });

      if (res.ok) {
        const saved: Message = await res.json();
        setRooms((prev) =>
          prev.map((room) =>
            room.id === activeRoomId
              ? {
                  ...room,
                  messages: room.messages.map((m) =>
                    m.id === tempId ? saved : m
                  ),
                }
              : room
          )
        );
      } else {
        // Rollback on error
        setRooms((prev) =>
          prev.map((room) =>
            room.id === activeRoomId
              ? { ...room, messages: room.messages.filter((m) => m.id !== tempId) }
              : room
          )
        );
        setInput(content);
      }
    } catch {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === activeRoomId
            ? { ...room, messages: room.messages.filter((m) => m.id !== tempId) }
            : room
        )
      );
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, activeRoomId, currentUserId]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });

  const filteredRooms = rooms.filter((room) => {
    const name = (room.member.fullName || room.member.email).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  // Members found via search who don't already have a room in the list —
  // these render as "start a new chat" options.
  const newMemberResults = memberResults.filter(
    (m) => !rooms.some((r) => r.member.id === m.id)
  );

  const unreadCount = (room: Room) =>
    room.messages.filter((m) => !m.read && m.senderId !== currentUserId).length;

  return (
    // A self-contained card: the page shell already provides padding and the
    // top bar, so the chat just needs a fixed, viewport-relative height.
    <div className="fade-up flex h-[calc(100dvh-8rem)] min-h-[480px] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lift md:h-[calc(100dvh-10.5rem)]">

      {/* ── Conversations ── */}
      <aside
        className={`w-full shrink-0 flex-col border-r border-border/60 bg-card sm:w-[22rem] ${
          activeRoom ? 'hidden sm:flex' : 'flex'
        }`}
      >
        <div className="shrink-0 space-y-4 px-5 pb-3 pt-5">
          <div className="flex items-center gap-2">
            <div>
              <p className="eyebrow">Inbox</p>
              <h2 className="font-headline text-xl font-bold tracking-tight">Messages</h2>
            </div>
            <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {rooms.length}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 shadow-sm transition-shadow focus-within:border-gold/60 focus-within:ring-2 focus-within:ring-gold/25">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {filteredRooms.length === 0 && newMemberResults.length === 0 && !searchingMembers && (
            <div className="mt-12 flex flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 opacity-40" />
              <p className="text-sm">{search.trim() ? 'No members match that search' : 'No conversations yet'}</p>
            </div>
          )}

          {filteredRooms.map((room) => {
            const lastMsg = room.messages[room.messages.length - 1];
            const unread = unreadCount(room);
            const isActive = room.id === activeRoomId;
            const name = room.member.fullName || room.member.email;

            return (
              <button
                key={room.id}
                onClick={() => openRoom(room.id)}
                className={`relative mb-0.5 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                  isActive ? 'bg-accent' : 'hover:bg-accent/60'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gold" />}
                <ChatAvatar name={name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-[14px] ${unread > 0 ? 'font-bold' : 'font-semibold'}`}>{name}</p>
                    {lastMsg && (
                      <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                        {formatDate(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    {lastMsg ? (
                      <p className={`truncate text-[13px] ${unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {lastMsg.senderId === currentUserId ? 'You: ' : ''}
                        {lastMsg.content}
                      </p>
                    ) : (
                      <p className="text-[13px] italic text-muted-foreground/70">No messages yet</p>
                    )}
                    {unread > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-gold-foreground">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Members found via search who don't have a conversation yet */}
          {search.trim() && (searchingMembers || newMemberResults.length > 0) && (
            <div className="mt-2 border-t border-border/60 pt-1">
              <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {searchingMembers ? 'Searching members…' : 'Start new chat'}
              </p>
              {newMemberResults.map((member) => {
                const name = member.fullName || member.email;
                return (
                  <button
                    key={member.id}
                    onClick={() => startChatWithMember(member)}
                    disabled={startingRoomFor === member.id || !canSend}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-accent/60 disabled:opacity-50"
                  >
                    <ChatAvatar name={name} size="sm" className="bg-none bg-muted text-muted-foreground shadow-none" />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold">{name}</p>
                      <p className="truncate text-[13px] text-muted-foreground">
                        {startingRoomFor === member.id ? 'Starting chat…' : member.email}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ── Conversation ── */}
      <section className={`min-w-0 flex-1 flex-col ${activeRoom ? 'flex' : 'hidden sm:flex'}`}>
        {activeRoom ? (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-card px-4 py-3.5 sm:px-6">
              <button
                onClick={() => setActiveRoomId(null)}
                className="-ml-1 rounded-xl p-2 hover:bg-accent sm:hidden"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <ChatAvatar name={activeRoom.member.fullName || activeRoom.member.email} />
              <div className="min-w-0">
                <p className="truncate font-headline text-[15px] font-bold leading-tight">
                  {activeRoom.member.fullName || activeRoom.member.email}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">{activeRoom.member.email}</p>
              </div>
              {!canSend && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning-soft-foreground">
                  <Eye className="h-3.5 w-3.5" /> View only
                </span>
              )}
            </header>

            <MessageThread
              messages={activeRoom.messages}
              currentUserId={currentUserId}
              loading={loadingRoom}
              bottomRef={bottomRef}
              empty={<p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>}
            />

            <Composer
              value={input}
              onChange={setInput}
              onSend={sendMessage}
              sending={sending}
              inputRef={inputRef}
              placeholder={`Reply to ${activeRoom.member.fullName || activeRoom.member.email}…`}
              disabledReason={canSend ? undefined : 'You have view-only access to Messages'}
            />
          </>
        ) : (
          <div className="hidden h-full flex-col items-center justify-center gap-3 px-6 text-center sm:flex">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-gradient text-gold shadow-lift">
              <MessageCircle className="h-7 w-7" />
            </span>
            <p className="font-headline text-lg font-bold">Select a conversation</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Pick a member on the left, or search to start a new chat.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
