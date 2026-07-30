'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Users, MessageCircle, Search, ArrowLeft } from 'lucide-react';

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

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

  const initials = (name: string) => name.trim()[0]?.toUpperCase() ?? '?';

  return (
    // -m-4/-m-6 cancels the parent shell's page padding so the chat fills the
    // full content area edge-to-edge; height is the viewport minus the 3.5rem
    // sticky top bar (using dvh so mobile browser chrome doesn't clip it).
    <div className="-m-4 sm:-m-6 h-[calc(100dvh-3.5rem)] flex bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">

      {/* ── Sidebar (room list) ── */}
      <div
        className={`w-full sm:w-80 sm:flex-shrink-0 flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 ${
          activeRoom ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base">Member Chats</h2>
            <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              {rooms.length}
            </span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 sm:py-2 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-shadow">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="flex-1 text-sm sm:text-xs bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredRooms.length === 0 && newMemberResults.length === 0 && !searchingMembers && (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-400 mt-12 px-6 text-center">
              <MessageCircle className="w-8 h-8 opacity-30" />
              <p className="text-xs">
                {search.trim() ? 'No members match that search' : 'No conversations yet'}
              </p>
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
                className={`w-full text-left px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 active:bg-white dark:active:bg-gray-800 transition-colors flex items-center gap-3 ${
                  isActive ? 'bg-white dark:bg-gray-800 sm:border-l-2 sm:border-l-emerald-500' : ''
                }`}
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {initials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold truncate">{name}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                          {unread}
                        </span>
                      )}
                      {lastMsg && (
                        <span className="text-[10px] text-gray-400">{formatDate(lastMsg.createdAt)}</span>
                      )}
                    </div>
                  </div>
                  {lastMsg && (
                    <p className="text-xs text-gray-400 truncate">
                      {lastMsg.senderId === currentUserId ? 'You: ' : ''}
                      {lastMsg.content}
                    </p>
                  )}
                  {!lastMsg && (
                    <p className="text-xs text-gray-300 italic">No messages yet</p>
                  )}
                </div>
              </button>
            );
          })}

          {/* Members found via search who don't have a conversation yet */}
          {search.trim() && (searchingMembers || newMemberResults.length > 0) && (
            <div className="border-t border-gray-200 dark:border-gray-800">
              <p className="px-4 sm:px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {searchingMembers ? 'Searching members…' : 'Start new chat'}
              </p>
              {newMemberResults.map((member) => {
                const name = member.fullName || member.email;
                return (
                  <button
                    key={member.id}
                    onClick={() => startChatWithMember(member)}
                    disabled={startingRoomFor === member.id}
                    className="w-full text-left px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {startingRoomFor === member.id ? 'Starting chat…' : member.email}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Panel ── */}
      <div className={`flex-1 min-w-0 flex-col ${activeRoom ? 'flex' : 'hidden sm:flex'}`}>
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex-shrink-0">
              <button
                onClick={() => setActiveRoomId(null)}
                className="sm:hidden -ml-1 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                {initials(activeRoom.member.fullName || activeRoom.member.email)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {activeRoom.member.fullName || activeRoom.member.email}
                </p>
                <p className="text-xs text-gray-400 truncate">{activeRoom.member.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-5 space-y-3 bg-gray-50 dark:bg-gray-950 min-h-0">
              {loadingRoom && (
                <div className="text-center text-xs text-gray-400 py-4">Loading messages...</div>
              )}
              {!loadingRoom && activeRoom.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No messages yet. Start the conversation.</p>
                </div>
              )}
              {!loadingRoom && activeRoom.messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
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
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 pb-[max(env(safe-area-inset-bottom),0.625rem)] sm:pb-3">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${activeRoom.member.fullName || activeRoom.member.email}...`}
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-8 h-8 flex-shrink-0 rounded-full bg-emerald-600 flex items-center justify-center text-white disabled:opacity-40 transition-opacity hover:bg-emerald-700"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="hidden sm:block text-[10px] text-center text-gray-400 mt-1.5">Press Enter to send</p>
            </div>
          </>
        ) : (
          <div className="hidden sm:flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <MessageCircle className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">Select a chat to get started</p>
            <p className="text-xs">All member conversations appear on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}
