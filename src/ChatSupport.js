import React, { useEffect, useState } from "react";
import { IoMdChatboxes } from "react-icons/io";

export default function ChatSupport({ showChat, setShowChat }) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleChat = () => setShowChat(!showChat);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    let footerObserver = null;

    if (isMobile) {
      //  MOBILE — hide on scroll
      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setVisible(false); // scrolling down → hide
        } else {
          setVisible(true); // scrolling up → show
        }

        setLastScrollY(currentScrollY);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);

    } else {
      const footer = document.querySelector("footer");
      if (!footer) return;

      footerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setVisible(!entry.isIntersecting); 
          });
        },
        { threshold: 0.2 }
      );

      footerObserver.observe(footer);

      return () => footerObserver.disconnect();
    }
  }, [lastScrollY]);

  return (
    <>
      <div
        className={`chat-support ${showChat ? "active" : ""} ${visible ? "show" : "hide"}`}
        onClick={toggleChat}
      >
        <IoMdChatboxes className="icon" />
        <span className="label">Chat</span>
      </div>

      <style>{`
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
          transition: all 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
        }

        .chat-support.show {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .chat-support.hide {
          opacity: 0;
          transform: translateY(100px);
          pointer-events: none;
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
        }
      `}</style>
    </>
  );
}
