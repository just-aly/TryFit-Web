import React from "react";
import { IoMdChatboxes } from "react-icons/io";

export default function ChatSupport({ showChat, setShowChat }) {
  const toggleChat = () => setShowChat(!showChat);

  return (
    <>
      {/* Chat Button */}
      <div
        className={`chat-support ${showChat ? "active" : ""}`}
        onClick={toggleChat}
      >
        <IoMdChatboxes className="icon" />
        <span className="label">Chat</span>
      </div>


      <style>{`
        /* --- CHAT BUTTON --- */
        .chat-support {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #6a5acd, #7b68ee);
          color: white;
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          padding: 0 20px;
          height: 60px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 6px 12px rgba(0,0,0,0.25);
          z-index: 1000;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .chat-support:hover {
          background: linear-gradient(135deg, #5746c6, #6a5acd);
          animation: bounce 0.6s ease-in-out;
        }

        .chat-support.active {
          transform: scale(0.95);
          opacity: 0.9;
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
          transition: transform 0.3s ease;
        }

        .chat-support:hover .icon {
          transform: rotate(10deg);
        }

        .chat-support .label {
          font-weight: 600;
          letter-spacing: 1px;
        }
          
        /* --- MOBILE VIEW: circular icon-only button --- */
        @media (max-width: 768px) {
          .chat-support {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            justify-content: center;
            padding: 0;
          }

          .chat-support .label {
            display: none;
          }

          .chat-support .icon {
            font-size: 28px;
          }

          .chat-window {
            right: 10px;
            width: calc(100% - 20px);
            height: 70%;
          }
        }
      `}</style>
    </>
  );
}
