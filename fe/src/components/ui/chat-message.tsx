"use client";

import { motion } from "motion/react";
import type { FC } from "react";
import Image from "next/image";

export interface Message {
  id: string;
  name: string;
  message: string;
  timestamp?: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  avatar: string;
}

const ChatMessage: FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  avatar,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className={`flex mb-4 ${
        isCurrentUser ? "justify-end" : "justify-start"
      } items-end`}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={avatar || "/placeholder.svg"}
              alt={`${message.name}'s avatar`}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
          isCurrentUser
            ? "bg-[#005C4B] text-white rounded-br-none"
            : "bg-[#202C33] text-white rounded-bl-none"
        }`}
      >
        <p className="text-sm leading-5">{message.message}</p>
        {message.timestamp && (
          <p className="text-[10px] mt-1 text-gray-400 text-right flex items-center justify-end gap-1">
            {message.timestamp}
            {isCurrentUser && <span className="text-blue-400">✓✓</span>}
          </p>
        )}
      </div>

      {isCurrentUser && <div className="w-8 "></div>}
    </motion.div>
  );
};

export default ChatMessage;
