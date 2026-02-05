"use client";

import { type FC, useRef, useEffect, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ChatMessage, { type Message } from "./chat-message";

export interface User {
  name: string;
  avatar: string;
}

interface ChatProps {
  messages: Message[];
  currentUser: string;
  users: User[];
}

const Chat: FC<ChatProps> = ({ messages, currentUser, users }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messages.length === 0) return;

    setVisibleMessages([]);
    let cancelled = false;

    (async () => {
      for (const msg of messages) {
        if (cancelled) return; // guard before delay
        await new Promise((r) => setTimeout(r, 700));
        if (cancelled) return; // guard after delay
        setVisibleMessages((prev) => [...prev, msg]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleMessages]);

  const getUserAvatar = (name: string) =>
    users.find((u) => u.name === name)?.avatar ??
    "/placeholder.svg?height=40&width=40";

  return (
    <div className="w-full h-full flex flex-col">
      {/* WhatsApp Header */}
      <div className="bg-[#202C33] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
          <img
            src="https://api.dicebear.com/7.x/avataaars/png?seed=Bot"
            alt="Bot"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Zaptify Bot</div>
          <div className="text-xs text-gray-200">online</div>
        </div>
        <div className="flex gap-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
          </svg>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 bg-[#0B141A] relative"
        style={{
          backgroundImage: `url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")`,
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visibleMessages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className={`flex mb-4 ${
                message.name === currentUser ? "justify-end" : "justify-start"
              } items-end`}
            >
              <ChatMessage
                message={message}
                isCurrentUser={message.name === currentUser}
                avatar={getUserAvatar(message.name)}
              />
            </motion.div>
          ))}
          {visibleMessages.length > 0 &&
            visibleMessages[visibleMessages.length - 1].name ===
              currentUser && (
              <div className="text-xs text-right mt-1 mr-2 text-gray-400">
                ✓✓
              </div>
            )}
        </AnimatePresence>
      </div>

      {/* WhatsApp Input Area */}
      <div className="bg-[#202C33] px-2 py-2 flex items-center gap-2">
        <button className="text-gray-400 p-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </button>
        <div className="flex-1 bg-[#2A3942] rounded-lg px-4 py-2 text-sm text-gray-400">
          Type a message
        </div>
        <button className="text-gray-400 p-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chat;
