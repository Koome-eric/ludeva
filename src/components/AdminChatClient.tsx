'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { Send, Users, MessageCircle, Search } from 'lucide-react';

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
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages]);

  // Subscribe to active room's Pusher channel
  useEffect(() => {
    if (!activeRoomId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`chat-${activeRoomId}`);

    channel.bind('new-message', (msg: Message) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== activeRoomId) return room;
          if (room.messages.some((m) => m.id === msg.id)) return room;
          return { ...room, messages: [...room.messages, msg] };
        })
      );
    });

    return () => {
      pusher.unsubscribe(`chat-${activeRoomId}`);
    };
  }, [activeRoomId]);

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

  const unreadCount = (room: Room) =>
    room.messages.filter((m) => !m.read && m.senderId !== currentUserId).length;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* ── Sidebar ── */}
      <div className="w-80 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">

        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base">Member Chats</h2>
            <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              {rooms.length}
            </span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="flex-1 text-xs bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-8">No chats found</p>
          )}
          {filteredRooms.map((room) => {
            const lastMsg = room.messages[room.messages.length - 1];
            const unread = unreadCount(room);
            const isActive = room.id === activeRoomId;

            return (
              <button
                key={room.id}
                onClick={() => openRoom(room.id)}
                className={`w-full text-left px-5 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-colors ${
                  isActive ? 'bg-white dark:bg-gray-800 border-l-2 border-l-emerald-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold truncate max-w-[150px]">
                    {room.member.fullName || room.member.email}
                  </p>
                  <div className="flex items-center gap-1.5">
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
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat Panel ── */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {(activeRoom.member.fullName || activeRoom.member.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {activeRoom.member.fullName || activeRoom.member.email}
                </p>
                <p className="text-xs text-gray-400">{activeRoom.member.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-gray-50 dark:bg-gray-950">
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
                      className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
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
                  placeholder={`Reply to ${activeRoom.member.fullName || activeRoom.member.email}...`}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <MessageCircle className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">Select a chat to get started</p>
            <p className="text-xs">All member conversations appear on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}
