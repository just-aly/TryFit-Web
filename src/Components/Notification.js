import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // custom userId like "U0056"

  useEffect(() => {
    // 🔍 Get the currently logged-in user's custom userId
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const usersRef = collection(db, "users");
          const userQuery = query(usersRef, where("email", "==", user.email));
          const userSnap = await getDocs(userQuery);

          if (!userSnap.empty) {
            const userData = userSnap.docs[0].data();
            setUserId(userData.userId); // set custom userId (e.g. "U0056")
          } else {
            console.warn("⚠️ No user found in 'users' collection for this account.");
          }
        } catch (error) {
          console.error("🔥 Error fetching userId:", error);
        }
      } else {
        setUserId(null);
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🧩 Fetch notifications from Firestore after getting userId
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const notifRef = collection(db, "notifications");
        const q = query(notifRef, where("userId", "==", userId), orderBy("timestamp", "desc"));
        const notifSnap = await getDocs(q);

        const notifData = notifSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setNotifications(notifData);

        // ✅ Mark all notifications as read
        notifSnap.docs.forEach(async (docSnap) => {
          const notifDocRef = doc(db, "notifications", docSnap.id);
          if (!docSnap.data().read) { // only update if not already read
            await updateDoc(notifDocRef, { read: true });
          }
        });

      } catch (error) {
        console.error("🔥 Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

   const handleClearAll = async () => {
    if (!userId) return;
    const confirmClear = window.confirm("Are you sure you want to delete all notifications?");
    if (!confirmClear) return;

    try {
      const notifRef = collection(db, "notifications");
      const q = query(notifRef, where("userId", "==", userId));
      const notifSnap = await getDocs(q);

      // Delete each notification
      const deletePromises = notifSnap.docs.map((docSnap) => {
        const notifDocRef = doc(db, "notifications", docSnap.id);
        return notifDocRef.delete ? notifDocRef.delete() : updateDoc(notifDocRef, { deleted: true });
      });

      await Promise.all(deletePromises);
      setNotifications([]); // Update state immediately
    } catch (error) {
      console.error("🔥 Error clearing notifications:", error);
    }
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "200px" }}>Loading notifications...</p>;

  return (
    <div className="notif-page">
      {/* ===== Header Section ===== */}
      <div className="notif-header">
        <div className="notif-header-inner">
          <div className="notif-title-row" style={{ justifyContent: "space-between", width: "100%" }}>
            <h1>Notifications</h1>
            
          </div>
          <div className="header-line"></div>
        </div>
      </div>
  
      <div className="notif-box">
         <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <button
            onClick={handleClearAll}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#6c56ef",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Clear All
          </button>
        </div>
        {notifications.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>No notifications yet.</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="notif-item">
              <h3 className="notif-header-text">{notif.title}</h3>
              <p className="notif-text">
                {notif.message}
                <br />
                <small style={{ color: "#777" }}>
                  🧾 Order ID: {notif.orderId}
                  <br />
                  🕒{" "}
                  {notif.timestamp
                    ? notif.timestamp.toDate().toLocaleString()
                    : "Unknown time"}
                </small>
              </p>
            </div>
          ))
        )}  
      </div>

      <style>{`
        .notif-page {
          background: linear-gradient(to bottom, #f8f2ffff, #e7d6fcff);
          min-height: 100vh;
          padding: 150px 0 80px;
          font-family: 'Poppins', sans-serif;
          color: #333;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .notif-header {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .notif-header-inner {
          width: 100%;
          max-width: 1000px;
          padding: 0 40px;
          margin-bottom: 30px;
        }

        .notif-title-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .notif-title-row h1 {
          font-size: 2.5rem;
          color: #1c143a;
          font-weight: 700;
          margin: 0;
          white-space: nowrap;
        }

        .header-line {
          flex: none;
          height: 20px;
          width: 65%;
          background: #6c56ef;
          box-shadow: 0 2px 6px rgba(108, 86, 239, 0.3);
        }

        .notif-box {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 1000px;
          padding: 40px;
          border: 1px solid #e4e2ffff;
        }

        .notif-item {
          background: #f6f4fb;
          border-radius: 8px;
          padding: 12px 18px;
          margin-bottom: 15px;
          transition: background 0.2s ease-in-out;
        }

        .notif-item:hover {
          background: #ebe4f9;
        }

        .notif-header-text {
          color: #5a3dbd;
          font-weight: bold;
          font-size: 0.95rem;
          margin-bottom: 5px;
        }

        .notif-text {
          font-size: 0.9rem;
          color: #333;
          line-height: 1.4;
        }

        
        /* ---------- Mobile View ---------- */
        @media (max-width: 480px) {
          .notif-page {
            padding: 120px 0 60px;
          }

          .notif-header-inner {
            padding: 0 15px;
            margin-bottom: 20px;
          }

          .notif-title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .notif-title-row h1 {
            font-size: 1.2rem;
            padding: 10px 2px;
          }

          .header-line {
            width: 100%;
            height: 10px;
          }

          .notif-box {
            width: 90%;
            padding: 20px 15px;
          }

          .notif-item {
            padding: 10px 12px;
          }

          .notif-header-text {
            font-size: 0.9rem;
          }

          .notif-text {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
