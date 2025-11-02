import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, deleteDoc,  getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export default function ShoppingCart() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [products, setProducts] = useState([]);
  const [hideCheckout, setHideCheckout] = useState(false);

  useEffect(() => {
  if (!user) return;

  // Fetch your Firestore user profile to get the custom userId (like U0055)
  const fetchCart = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.warn("User data not found in Firestore.");
        return;
      }

      const userData = userDocSnap.data();
      const customUserId = userData.userId; // <-- This is your “U0055”

      if (!customUserId) {
        console.warn("Custom userId missing in user data.");
        return;
      }

      // Now query cartItems using custom userId
      const q = query(collection(db, "cartItems"), where("userId", "==", customUserId));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            selected: doc.data().selected || false,
            quantity: doc.data().quantity || 1,
          }));
          setProducts(items);
        },
        (error) => console.error("Error fetching cart items:", error)
      );

      return unsubscribe;
    } catch (err) {
      console.error("Error fetching custom userId:", err);
    }
  };

  const unsubscribePromise = fetchCart();

  return () => {
    unsubscribePromise && unsubscribePromise instanceof Function && unsubscribePromise();
  };
}, [user]);


  const toggleSelect = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const docRef = doc(db, "cartItems", id);
    await updateDoc(docRef, { selected: !product.selected });
  };

  const changeQuantity = async (id, delta) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newQty = Math.max(1, product.quantity + delta);
    const docRef = doc(db, "cartItems", id);
    await updateDoc(docRef, { quantity: newQty });
  };

  const deleteProduct = async (id) => {
    const docRef = doc(db, "cartItems", id);
    await deleteDoc(docRef);
  };

  const selectedItems = products.filter((p) => p.selected);
  const total = selectedItems.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // Hide checkout when footer is visible
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setHideCheckout(entry.isIntersecting));
      },
      { threshold: 0.2 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cart-container">
      <div className="cart-items">
        {products.map((product) => (
          <div key={product.id} className="cart-card">
            <input
              type="checkbox"
              checked={product.selected}
              onChange={() => toggleSelect(product.id)}
            />
            <img src={product.productImage || "https://via.placeholder.com/80"} alt={product.productName} className="cart-img" />
            <div className="cart-details">
              <h3>{product.productName}</h3>
              <p className="price">₱{Number(product.price).toLocaleString()}</p>
              <p>Size: {product.size}</p>
            </div>
            <div className="quantity-actions">
              <div className="quantity">
                <button onClick={() => changeQuantity(product.id, -1)}>-</button>
                <span>{product.quantity}</span>
                <button onClick={() => changeQuantity(product.id, 1)}>+</button>
              </div>
              <span className="delete-btn" onClick={() => deleteProduct(product.id)}>Delete</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`checkout ${hideCheckout ? "hidden" : ""}`}>
        <div className="checkout-content">
          <div className="checkout-info">
            <p>Selected Item: {selectedItems.length}</p>
            <p>Total: ₱{total.toLocaleString()}</p>
          </div>
          <button
            className="checkout-btn"
            onClick={() => {
              if (selectedItems.length === 0) {
                alert("Please select at least one item to checkout.");
                return;
              }
              navigate("/checkout", { state: { cartItems: selectedItems } });
            }} >
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
          flex-direction: column;
          align-items: center;
          font-family: Arial, sans-serif;
        }

        .cart-items {
          margin: 20px 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 92%;
          max-width: 880px;
        }

        .cart-card {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #fff;
          border-radius: 8px;
          padding: 12px;
          border-top: 6px solid #6a5acd;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .cart-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
        }

        .cart-details {
          flex: 1;
        }

        .cart-details h3 {
          font-size: 1rem;
          font-weight: 600;
        }

        .color-dropdown {
          margin: 5px 0;
          padding: 4px 6px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 0.9rem;
        }

        .price {
          font-size: 1rem;
          font-weight: bold;
          color: #6a5acd;
        }

        .quantity-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
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
          font-size: 0.9rem;
          color: #6a5acd;
          cursor: pointer;
          transition: color 0.2s ease-in-out;
          margin-top: 10px;
        }

        .delete-btn:hover {
          color: red;
        }

        /* Checkout bar */
        .checkout {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          background: transparent;
          z-index: 999;
          transition: transform 0.3s ease-in-out;
        }

        .checkout.hidden {
          transform: translateY(120%);
        }

        .checkout-content {
          background: #fff;
          border-top: 4px solid #6a5acd;
          box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
          width: 92%;
          max-width: 880px;
          padding: 20px;
          border-radius: 0;
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
          font-size: 1rem;
          font-weight: 600;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }

        .checkout-btn:hover {
          background: #5b4bcc;
        }
      `}</style>
    </div>
  );
}
