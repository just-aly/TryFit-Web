import React from "react";
import { IoMdChatboxes } from "react-icons/io";

export default function ChatSupport({ showChat, setShowChat }) {
  const toggleChat = () => setShowChat(!showChat);

  return (
    <div className="chat-support" onClick={toggleChat}>
      <IoMdChatboxes className="icon" />
      <span className="label">Chat</span>

      <style>{`
        .chat-support {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #6a5acd, #7b68ee);
          color: white;
          font-family: Arial, sans-serif;
          font-size: 18px;
          padding: 0 20px;
          height: 60px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 6px 12px rgba(0,0,0,0.25);
          z-index: 1000;
          gap: 5px;
          transition: background 0.3s ease;
        }
        .chat-support:hover {
          background: linear-gradient(135deg, #5746c6, #6a5acd);
          animation: bounce 0.6s ease-in-out;
        }
        @keyframes bounce {
          0%   { transform: translateY(0); }
          30%  { transform: translateY(-6px); }
          50%  { transform: translateY(0); }
          70%  { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }
        .chat-support .icon {
          font-size: 26px;
          color: white;
        }
        .chat-support .label {
          font-weight: 600;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
}
