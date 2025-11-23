import { getAuth } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const db = getFirestore();
const auth = getAuth();

export default function Cart() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [products, setProducts] = useState([]);
  const [hideCheckout, setHideCheckout] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const { userId } = userSnap.data();
      if (!userId) return;

      const q = query(
        collection(db, "cartItems"),
        where("userId", "==", userId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          selected: doc.data().selected || false,
          quantity: doc.data().quantity || 1,
        }));
        setProducts(items);
      });

      return unsubscribe;
    };

    const unsub = fetchCart();
    return () => unsub && unsub instanceof Function && unsub();
  }, [user]);

  const toggleSelect = async (id) => {
    const docRef = doc(db, "cartItems", id);
    const current = products.find((p) => p.id === id);
    await updateDoc(docRef, { selected: !current.selected });
  };

  const changeQuantity = async (id, delta) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    const newQty = Math.max(1, current.quantity + delta);
    await updateDoc(doc(db, "cartItems", id), { quantity: newQty });
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "cartItems", id));
  };

  const selectedItems = products.filter((p) => p.selected);
  const total = selectedItems.reduce((sum, p) => sum + p.price * p.quantity, 0);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => setHideCheckout(e.isIntersecting)),
      { threshold: 0.2 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cart-container">
      <div className="cart-items">
        {products.map((p) => (
          <div key={p.id} className="cart-card">
            <div className="cart-left">
              <input
                type="checkbox"
                checked={p.selected}
                onChange={() => toggleSelect(p.id)}
              />

              <img
                src={p.imageUrl || "https://via.placeholder.com/80"}
                alt={p.productName}
                className="cart-img"
              />

              <div className="cart-details">
                <h3>{p.productName}</h3>
                <p className="price">₱{Number(p.price).toLocaleString()}</p>
                <p>Size: {p.size}</p>
              </div>
            </div>

            <div className="quantity-actions">
              <div className="quantity">
                <button onClick={() => changeQuantity(p.id, -1)}>-</button>
                <span>{p.quantity}</span>
                <button onClick={() => changeQuantity(p.id, 1)}>+</button>
              </div>

              <span className="delete-btn" onClick={() => deleteProduct(p.id)}>
                Delete
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={`checkout ${hideCheckout ? "hidden" : ""}`}>
        <div className="checkout-content">
          <div className="checkout-info">
            <p>Selected: {selectedItems.length}</p>
            <p>Total: ₱{total.toLocaleString()}</p>
          </div>

          <button
            className="checkout-btn"
            onClick={() => {
              if (!selectedItems.length) {
                alert("Please select at least one item.");
                return;
              }
              navigate("/checkout", { state: { cartItems: selectedItems } });
            }}
          >
            CHECK OUT
          </button>
        </div>
      </div>

      <style>{`
        .cart-container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #e9d5ff, #ddd6fe);
          padding: 100px 20px 20px;
          display: flex;
          align-items: center;
          flex-direction: column;
        }

        .cart-items {
          width: 92%;
          max-width: 880px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 20px;
        }

        .cart-card {
          background: white;
          border-radius: 8px;
          border-top: 6px solid #6a5acd;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .cart-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .cart-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
        }

        .cart-details h3 {
          font-size: 1rem;
          font-weight: 600;
        }

        .price { 
          font-size: 1rem; 
          color: #6a5acd; 
          font-weight: bold;
        }
 
        .quantity-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-width: 70px;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quantity button {
          background: #ddd6fe;
          border: none;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
        }

        .delete-btn {
          margin-top: 4px;
          color: #6a5acd;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .delete-btn:hover { color: red; }
 
        .checkout {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          display: flex;
          justify-content: center;
          z-index: 999;
          transition: transform 0.3s ease-in-out;
        }

        .checkout.hidden {
          transform: translateY(120%);
        }

        .checkout-content {
          background: white;
          border-top: 4px solid #6a5acd;
          width: 92%;
          max-width: 880px;
          padding: 20px;
          box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
        }

        .checkout-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .checkout-btn {
          width: 100%;
          background: #6a5acd;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
        }

        .checkout-btn:hover {
          background: #5b4bcc;
        }

        @media (min-width: 769px) {
          .cart-img {
            width: 50px;
            height: 50px;
          }

          .quantity-actions {
            align-items: flex-end;
            min-width: 60px;
          }

          .delete-btn {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
