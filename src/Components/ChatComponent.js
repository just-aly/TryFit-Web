import React, { useEffect, useState, useRef } from "react";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy,  doc, getDoc,  serverTimestamp  } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth(); // <-- define auth

export default function ChatComponent({ onClose, userId, username }) {
  const [message, setMessage] = useState(""); // <-- renamed from input
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
  const fetchMessages = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    // Fetch custom userId from users collection
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error("No user found in users collection!");
      return;
    }

    const customUserId = userDocSnap.data().userId; // your unique userId

    // Query chatMessages using the custom userId
    const q = query(
      collection(db, "chatMessages"),
      where("userId", "==", customUserId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          sender: data.sender,
          userId: data.userId,
          username: data.username,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        };
      });
      setMessages(msgs);
    });

    return unsubscribe;
  };

  fetchMessages();
}, []); // empty dependency array so it runs once when component mounts



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    const sendMessage = async () => {
    if (message.trim() === "") return;

    // Assume the Firebase Auth user is logged in
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        console.error("User not logged in");
        return;
    }

    try {
        // Fetch your custom userId from the 'users' collection
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
        console.error("No user found in users collection!");
        return;
        }

        const customUserId = userDocSnap.data().userId; // <-- your unique userId
        const username = userDocSnap.data().username || "Anonymous"; // or email, whatever you store
        const timestamp = Date.now();

        // Save message with your custom userId
        const chatCollection = collection(db, "chatMessages");
        const docRef = await addDoc(chatCollection, {
        text: message,
        sender: "user",
        userId: customUserId,
        username,
        timestamp: serverTimestamp(),
        });

        // Update local state immediately
        setMessages((prev) => [
        ...prev,
        { id: docRef.id, text: message, sender: "user", userId: customUserId, username, timestamp },
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

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "33%",
      maxWidth: "400px",
      height: "85%",
      background: "white",
      border: "1px solid #ccc",
      borderRadius: "10px",
      boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        borderBottom: "1px solid #eee",
      }}>
        <h4 style={{ margin: 0 }}>Chat Support</h4>
        <button onClick={onClose} style={{ cursor: "pointer" }}>X</button>
      </div>

      <div style={{
        padding: "10px",
        overflowY: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            marginBottom: "8px",
            padding: "8px 12px",
            background: msg.sender === "user" ? "#DCF8C6" : "#F1F0F0",
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            borderRadius: "10px",
            maxWidth: "80%",
            wordBreak: "break-word",
          }}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #eee" }}>
        <input
          type="text"
          value={message} // <-- use message state
          onChange={(e) => setMessage(e.target.value)} // <-- use setMessage
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginRight: "5px",
          }}
        />
        <button onClick={sendMessage} style={{
          padding: "8px 12px",
          borderRadius: "5px",
          border: "none",
          background: "#007bff",
          color: "white",
          cursor: "pointer",
        }}>
          Send
        </button>
      </div>
    </div>
  );
}
