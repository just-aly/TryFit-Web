import React, { useEffect, useState, useRef } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  serverTimestamp,
  deleteDoc,
  getDocs, 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FaPaperPlane, FaTrash } from "react-icons/fa"; 

const db = getFirestore();
const auth = getAuth();

export default function ChatComponent({ onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [customUserId, setCustomUserId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) return;

      const uid = userDocSnap.data().userId;
      setCustomUserId(uid);

      const q = query(
        collection(db, "chatMessages"),
        where("userId", "==", uid),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          messageId: doc.data().messageId || "N/A",
          text: doc.data().text,
          sender: doc.data().sender,
          userId: doc.data().userId,
          username: doc.data().username,
          timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        }));
        setMessages(msgs);
      });

      return unsubscribe;
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() === "" || !customUserId) return;
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) return;

      const username = userDocSnap.data().username || "Anonymous";
      const messageId = `MS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const chatCollection = collection(db, "chatMessages");
      const docRef = await addDoc(chatCollection, {
        messageId,
        text: message,
        sender: "user",
        userId: customUserId,
        username,
        timestamp: serverTimestamp(),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: docRef.id,
          messageId,
          text: message,
          sender: "user",
          userId: customUserId,
          username,
          timestamp: new Date(),
        },
      ]);

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let lastTimestamp = 0;

  // DELETE ALL MESSAGES FUNCTION
  const deleteAllMessages = async () => {
    if (!customUserId) return;
    try {
      const q = query(
        collection(db, "chatMessages"),
        where("userId", "==", customUserId)
      );
      const snapshot = await getDocs(q);
      const batchDeletes = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "chatMessages", docSnap.id))
      );
      await Promise.all(batchDeletes);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting messages:", err);
    }
  };

  return (
    <div style={styles.chatContainer} className="chatContainer">
      {/* Header */}
      <div style={styles.header}>
        <h4 style={{ margin: 0, color: "white" }}>Chat Support</h4>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={styles.deleteBtn}
            title="Delete all messages"
          >
            <FaTrash />
          </button>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer} className="messagesContainer">
        {messages.map((msg, index) => {
          const currentTimestamp = new Date(msg.timestamp).getTime();
          const showDate =
            index === 0 || currentTimestamp - lastTimestamp > 3600000;
          lastTimestamp = currentTimestamp;

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div style={styles.dateDivider}>{formatDate(msg.timestamp)}</div>
              )}

              <div
                className="messageWrapper"
                style={{
                  ...styles.messageWrapper,
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  className="messageBubble"
                  style={{
                    ...styles.messageBubble,
                    backgroundColor:
                      msg.sender === "user" ? "#a166ff" : "#ece4ff",
                    color: msg.sender === "user" ? "#fff" : "#2e2e3f",
                  }}
                >
                  {msg.text}
                </div>

                {/* Timestamp under the chat bubble */}
                <div
                  className="timestamp"
                  style={{
                    textAlign: msg.sender === "user" ? "right" : "left",
                  }}
                >
                  {formatDate(msg.timestamp)} • {formatTime(msg.timestamp)}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea} className="inputArea">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          style={styles.input}
          onFocus={(e) => (e.target.style.border = "2px solid #a166ff")}
          onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          className="input"
        />
        <button onClick={sendMessage} style={styles.sendBtn} className="sendBtn">
          <FaPaperPlane style={{ marginRight: "5px" }} /> Send
        </button>
      </div>

      <style>
        {`
          .messageWrapper {
            position: relative;
            transition: all 0.3s ease;
          }

          .timestamp {
            font-size: 0.75rem;
            color: #666;
            opacity: 0;
            margin-top: 4px;
            transition: all 0.3s ease;
            transform: translateY(-3px);
            width: 100%;
          }

          .messageWrapper:hover .timestamp {
            opacity: 1;
            transform: translateY(3px);
          }

          @media (max-width: 768px) {
            .chatContainer {
              width: 100% !important;
              height: 100% !important;
              right: 0 !important;
              bottom: 0 !important;
              border-radius: 0 !important;
            }

            .messagesContainer {
              padding: 10px !important;
            }

            .messageBubble {
              font-size: 0.9rem !important;
              max-width: 90% !important;
            }

            .inputArea {
              flex-direction: row !important;
              gap: 8px !important;
              padding: 10px !important;
              align-items: center !important;
            }

            .input {
              width: 80% !important;
              font-size: 0.9rem !important;
            }

            .sendBtn {
              width: 20% !important;
              font-size: 0.9rem !important;
              padding: 10px !important;
            }
          }
        `}
      </style>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>Are you sure you want to delete all messages?</h3>
            <div style={modalStyles.buttons}>
              <button style={modalStyles.yesBtn} onClick={deleteAllMessages}>
                Yes
              </button>
              <button
                style={modalStyles.noBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  chatContainer: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "33%",
    maxWidth: "600px",
    height: "70%",
    background: "white",
    borderRadius: "15px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Poppins', sans-serif",
    overflow: "hidden",
  },
  header: {
    background: "#a166ff",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    fontWeight: "600",
    fontSize: "1.1rem",
  },
  closeBtn: {
    background: "transparent",
    color: "white",
    fontSize: "1.3rem",
    border: "none",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "transparent",
    color: "white",
    fontSize: "1.2rem",
    border: "none",
    cursor: "pointer",
  },
  messagesContainer: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    background: "#f8f5ff",
    display: "flex",
    flexDirection: "column",
  },
  messageWrapper: {
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  messageBubble: {
    padding: "10px 16px",
    borderRadius: "12px",
    maxWidth: "80%",
    wordBreak: "break-word",
    fontSize: "0.95rem",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease-in-out",
  },
  dateDivider: {
    textAlign: "center",
    color: "#666",
    fontSize: "0.8rem",
    margin: "10px 0",
    position: "relative",
  },
  inputArea: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderTop: "1px solid #ddd",
    background: "#fff",
    gap: "8px",
  },
  input: {
    flex: "0.85",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "0.95rem",
    transition: "border 0.3s ease",
  },
  sendBtn: {
    flex: "0.15",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#a166ff",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "background 0.2s ease",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modal: {
    background: "white",
    padding: "30px 40px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    maxWidth: "90%",
    width: "400px",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
  },
  yesBtn: {
    padding: "10px 25px",
    background: "#a166ff",
    color: "white",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  noBtn: {
    padding: "10px 25px",
    background: "#f1f1f1",
    color: "#333",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};
