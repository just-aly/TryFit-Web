import React, { useEffect, useState, useRef } from "react";
import { IoMdChatboxes } from "react-icons/io";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getApp } from "firebase/app";

export default function ChatSupport({ showChat, setShowChat }) {
  const [visible, setVisible] = useState(true);
  const [hasUnreadAdmin, setHasUnreadAdmin] = useState(false); // red dot state
  const lastScrollY = useRef(0);
  const scrollThreshold = 30; // minimum scroll to trigger hide/show

  const toggleChat = () => setShowChat(!showChat);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
      setVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;

      if (scrollDiff > scrollThreshold && currentScrollY > 100) {
        setVisible(false);
      } else if (scrollDiff < -scrollThreshold) {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Firebase logic for unread admin messages ---
  useEffect(() => {
    const auth = getAuth(getApp());
    const db = getFirestore(getApp());

    const fetchUnreadAdminMessages = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // fetch userId from users collection
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) return;

        const customUserId = userDoc.data().userId; // <-- use this field

        const chatCollection = collection(db, "chatMessages");

        const q = query(
          chatCollection,
          where("userId", "==", customUserId),
          where("sender", "==", "admin"),
          where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          setHasUnreadAdmin(!snapshot.empty);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching unread admin messages:", error);
      }
    };

    fetchUnreadAdminMessages();
  }, []);

  return (
    <>
      <div
        className={`chat-support ${showChat ? "active" : ""} ${
          visible ? "show" : "hide"
        }`}
        onClick={toggleChat}
      >
        <IoMdChatboxes className="icon" />
        {hasUnreadAdmin && <span className="red-dot" />}
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

        .red-dot {
          position: absolute;
          top: 10px;
          left: 15px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: red;
          z-index: 1001;
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
