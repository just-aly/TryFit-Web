import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

export default function Recheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const controls = useAnimation();

  const [shippingLocation, setShippingLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [reorderItems, setReorderItems] = useState([]);
  const { completedID, cancelledID } = location.state || {};
  const [order, setOrder] = useState(null);

  // UI states
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const totalItems = reorderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = reorderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    });
  }, [controls]);

  // Toast helper
  const showToast = (message, type = "info", ms = 2500) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "info" }), ms);
  };

  useEffect(() => {
    if (location.state?.cartItems) {
      setReorderItems(location.state.cartItems);
    }
  }, [location.state]);

  // Fetch shipping location
  useEffect(() => {
    const fetchShippingLocation = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }

        const customUserId = userSnap.data().userId;

        const q = query(
          collection(db, "shippingLocations"),
          where("userId", "==", customUserId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const shippingData = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort(
              (a, b) =>
                (b.createdAt?.toDate?.().getTime?.() || 0) -
                (a.createdAt?.toDate?.().getTime?.() || 0)
            )[0];

          setShippingLocation(shippingData);
        } else {
          setShippingLocation(null);
        }
      } catch (err) {
        console.error("Error fetching shipping location:", err);
        showToast("Failed to load shipping info.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShippingLocation();
  }, []);

  // Fetch previous order items
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        let orderData = null;

        if (completedID) {
          const q = query(
            collection(db, "completed"),
            where("completedID", "==", completedID)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) orderData = querySnap.docs[0].data();
        } else if (cancelledID) {
          const q = query(
            collection(db, "cancelled"),
            where("cancelledID", "==", cancelledID)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) orderData = querySnap.docs[0].data();
        }

        if (orderData) {
          setReorderItems(orderData.items || []);
          setOrder(orderData);
        } else {
          console.warn("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      }
    };

    fetchOrder();
  }, [completedID, cancelledID]);
  

  // Confirmation modal before placing order
  const handlePlaceOrderClick = () => {
    if (!auth.currentUser) {
      showToast("You must be logged in to place an order.", "error");
      return;
    }
    if (!shippingLocation) {
      showToast("Please add a shipping address before placing an order.", "warning");
      return;
    }
    if (!reorderItems || reorderItems.length === 0) {
      showToast("No items selected.", "warning");
      return;
    }
    setShowConfirm(true);
  };

  const placeOrderConfirmed = async () => {
    setShowConfirm(false);
    setIsPlacingOrder(true);

    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (!userDoc.exists()) throw new Error("User not found");
      const customUserId = userDoc.data().userId;

      const subtotal = reorderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total = subtotal + 58;

      const newOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const orderData = {
        orderId: newOrderId,
        userId: customUserId,
        name: shippingLocation.name,
        address: `${shippingLocation.house}, ${shippingLocation.fullAddress}`,
        deliveryFee: 58,
        total,
        productID: order?.productID || null,
        delivery: order?.delivery || "Standard Shipping",
        status: "Pending",
        createdAt: serverTimestamp(),
        items: reorderItems.map((item) => ({
          imageUrl: item.imageUrl || "",
          productId: item.productId || "",
          productName: item.productName || "",
          quantity: item.quantity || 1,
          price: item.price || 0,
          size: item.size || "-",
        })),
      };

      await addDoc(collection(db, "orders"), orderData);

      await addDoc(collection(db, "notifications"), {
        notifID: `NCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: customUserId,
        title: "Re-Order Placed",
        message: `Your re-order ${newOrderId} totaling ₱${total.toLocaleString()} has been placed.`,
        orderId: newOrderId,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Show success animation
      setShowSuccessAnim(true);
      setTimeout(() => {
        setShowSuccessAnim(false);
        navigate("/myorders", { state: { fromCheckout: true } });
      }, 2200);
    } catch (err) {
      console.error(err);
      showToast("Failed to place reorder. Try again.", "error");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleAddAddress = () => {
    navigate("/profile", {
      state: {
        openShippingLocations: true,
        fromCheckout: true,
         cartItems: reorderItems,  
        selectedCartItems: reorderItems, 
      },
    });
  };

  return (
    <div className="checkout-page">
      {/* Top toast */}
      {toast.visible && (
        <div className={`toast ${toast.type}`}>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to proceed?</h3>
            <p>This will place the order and charge you accordingly.</p>
            <div className="confirm-actions">
              <button className="btn cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn confirm"
                onClick={() => placeOrderConfirmed()}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Placing..." : "Yes, proceed"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Success animation overlay */}
      {showSuccessAnim && (
        <div className="success-overlay">
          <div className="success-card" role="status" aria-live="polite">
            <svg className="check-svg" viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="54" fill="none" strokeWidth="4" opacity="0.12" />
              <path className="check-path" d="M34 62 L52 80 L86 40" fill="none" stroke="#6c56ef" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="success-text">Order successfully placed!</div>
          </div>
        </div>
      )}

      {/* Page content */}
      <motion.div className="checkout-header" initial={{ opacity: 0, y: -20 }} animate={controls}>
        <div className="checkout-header-inner">
          <div className="checkout-title-row">
            <h1>Re-Checkout</h1>
            <div className="header-line"></div>
          </div>
        </div>
      </motion.div>

      <motion.section className="checkout-content" initial={{ opacity: 0, y: 30 }} animate={controls}>
        <div className="checkout-left">
          <h1>Re-Checkout</h1>

          {loading ? (
            <p>Loading shipping info...</p>
          ) : shippingLocation ? (
            <div className="address-box">
              <div>
                <p><strong>Name: {shippingLocation.name}</strong></p>
                <p><strong>House No:</strong> {shippingLocation.house}</p>
                <p><strong>Full Address:</strong> {shippingLocation.fullAddress}</p>
                <p><strong>Phone number:</strong> {shippingLocation.phone}</p>
                <p><strong>Postal:</strong> {shippingLocation.postalCode}</p>
              </div>
              <button onClick={handleAddAddress} className="edit-btn">Edit</button>
            </div>
          ) : (
            <p style={{ color: "red", cursor: "pointer", textDecoration: "underline" }} onClick={handleAddAddress}>
              No shipping address. Click here to add one.
            </p>
          )}

          <p>Total items: {reorderItems.length}</p>

          {reorderItems.length === 0 ? (
            <p>No cancelled or completed items to reorder.</p>
          ) : (
            reorderItems.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="product-card">
                <img src={item.imageUrl || "https://via.placeholder.com/80"} alt={item.productName} className="product-image" />
                <div className="product-details">
                  <h4>{item.productName}</h4>
                  <p>Size: {item.size}</p>
                  <p className="price">₱{item.price.toLocaleString()}</p>
                </div>
                <span className="qty">x{item.quantity}</span>
              </div>
            ))
          )}

          <div className="shipping-box">
            <h4>Shipping Option</h4>
            <div className="shipping-option">
              <div>
                <p className="method">Standard Local</p>
                <div className="delivery-info" style={{ marginTop: "10px" }}>
                  {reorderItems.map((item) => (
                    <p key={item.productId} style={{ margin: "4px 0" }}>
                      <strong>{item.productName}:</strong> Expected delivery {item.delivery || "3-5 Days"}🚚
                    </p>
                  ))}
                </div>
              </div>
              <p className="ship-price">₱58</p>
            </div>
          </div>

          <div className="total-items">
            <p>Total {totalItems} item(s)</p>
            <p className="total">₱{totalPrice.toLocaleString()}</p>
          </div>

          <div className="payment-card">
            <h3>Payment Details</h3>
            <div className="payment-row">
              <p>Merchandise Subtotal</p>
              <span>₱{totalPrice.toLocaleString()}</span>
            </div>
            <div className="payment-row">
              <p>Shipping Subtotal</p>
              <span>₱58</span>
            </div>
            <div className="payment-row">
              <p>Shipping Discount Subtotal</p>
              <span>₱0</span>
            </div>

            <hr />

            <div className="payment-row total-row">
              <p>Total Payment</p>
              <span>₱{(totalPrice + 58).toLocaleString()}</span>
            </div>
          </div>

          <div className="order-card">
            <div className="order-total">
              <p>Total: <span>₱{(totalPrice + 58).toLocaleString()}</span></p>
              <button
                onClick={handlePlaceOrderClick}
                disabled={!shippingLocation || isPlacingOrder || reorderItems.length === 0}
                style={{
                  backgroundColor: !shippingLocation || reorderItems.length === 0 ? "#ccc" : "#6c56ef",
                  cursor: !shippingLocation || reorderItems.length === 0 ? "not-allowed" : "pointer",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  fontSize: "16px",
                }}
              >
                {isPlacingOrder ? "Placing Order..." : "Re-Place Order"}
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Styles */}
      <style>{`
           .checkout-page {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(to bottom, #ece5ff, #f7f3ff);
          min-height: 100vh;
          padding: 150px 0 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ===== Header ===== */
        .checkout-header {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .checkout-header-inner {
          width: 100%;
          max-width: 1000px;
          padding: 0 40px;
          margin-bottom: 20px;
        }

        .checkout-title-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .checkout-title-row h1 {
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
        
        .edit-btn {
          background: #6c56ef;
          border: none;
          color: white;
          padding: 10px 18px;
          font-weight: 600;
          border-radius: 8px;
        }

        /* ------------------------------
   CONFIRMATION MODAL
------------------------------ */
.modal-overlay {
  position: fixed;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: rgba(0,0,0,0.45);
  padding-bottom: 650px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
}

.confirm-modal {
  background: white;
  padding: 22px 24px;
  width: 92%;
  max-width: 420px;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

.confirm-modal h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.confirm-modal p {
  margin: 0 0 16px;
  color: #444;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn.cancel {
  background: #f1f1f1;
  color: #333;
  border: 1px solid #6c56ef;
}

.btn.confirm {
  background: #6c56ef;
  color: white;
}
	
  .success-overlay {
          position: fixed;
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9998;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(6px);
        }
        .success-card {
          background: transparent;
          padding: 28px 26px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .check-svg { display: block; }
        .check-path {
          stroke: #6c56ef;
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: draw 0.9s ease forwards;
        }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        .success-text {
          font-weight: 700;
          color: #222;
          font-size: 1.5rem;
          text-align: center;
        }

        /* ===== Main Content ===== */
        .checkout-content {
          display: flex;
          gap: 30px;
          width: 100%;
          max-width: 1000px;
          background: white;
          border: 1px solid #bdb8f2;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          flex-wrap: wrap;
        }

        /* ===== Left Column ===== */
        .checkout-left {
          flex: 1;
          min-width: 350px;
        }

        .address-box {
          background: #f5f3fe;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .address-box h3 {
          margin: 0;
          font-weight: 600;
          color: #222;
        }

        .address-box p {
          margin: 4px 0;
          font-size: 0.9rem;
          color: #555;
        }

        .arrow {
          font-size: 1.3rem;
          color: #8f7aec;
          font-weight: bold;
        }

        .product-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 10px;
          display: flex;
          align-items: center;
          padding: 15px;
          margin-bottom: 20px;
          gap: 15px;
        }

        .product-image {
          border-radius: 8px;
          width: 80px;
          height: 80px;
          object-fit: cover;
        }

        .product-details h4 {
          font-size: 1rem;
          color: #222;
          margin: 0;
        }

        .product-details p {
          font-size: 0.9rem;
          margin: 4px 0;
          color: #555;
        }

        .price {
          color: #8f7aec;
          font-weight: 600;
        }

        .qty {
          color: #777;
          font-size: 0.9rem;
        }

        .shipping-box {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 15px;
        }

        .shipping-box h4 {
          margin-bottom: 10px;
          font-weight: 600;
        }

        .shipping-option {
          background: #efe9ff;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
        }

        .method {
          font-weight: 500;
          margin-bottom: 3px;
        }

        .guarantee {
          font-size: 0.85rem;
          color: #34a853;
        }

        .ship-price {
          font-weight: 600;
          color: #333;
        }

        .total-items {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          font-size: 0.95rem;
        }

        .total-items .total {
          color: #8f7aec;
          font-weight: 600;
        }

        /* ===== Right Column ===== */
        .checkout-right {
          width: 270px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .payment-card {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 20px;
        }

        .checkout-right h3 {
          margin-bottom: 15px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.95rem;
          color: #333;
        }

       .total-row {
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center; 
        font-size: 1rem;
        margin-top: 10px;
        }

        hr {
          margin: 15px 0;
          border: none;
          border-top: 1px solid #ddd;
        }

        /* ===== New Order Card ===== */
        .order-card {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 20px;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .order-total p {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .order-total span {
          color: #8f7aec;
        }

        .order-total button {
          background: #6c56ef;
          border: none;
          color: white;
          padding: 10px 18px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }

        .order-total button:hover {
          background: #5a45d2;
        }

      @media (max-width: 600px) {
        .checkout-page {
          padding: 130px 10px 80px; 
        }

        .checkout-header-inner {
          padding: 0 12px;
        }

        .checkout-title-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          margin-top: 10px; 
        }

        .checkout-title-row h1 {
          font-size: 1.4rem; 
        }

        .header-line {
          width: 100%;
          height: 6px;
        }

        .checkout-content {
          flex-direction: column;
          padding: 15px;
          gap: 15px;
        }

        .checkout-left {
          width: 100%;
          min-width: auto;
        }

        .address-box {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
        }

        .product-card {
          flex-direction: row;
          align-items: flex-start;
          padding: 8px;
          gap: 8px;
        }

        .product-image {
          width: 55px;
          height: 55px;
        }

        .product-details h4 {
          font-size: 0.8rem; 
        }

        .product-details p {
          font-size: 0.7rem;
        }

        .price {
          font-size: 0.75rem;
        }

        .qty {
          font-size: 0.7rem;
        }

        .shipping-option {
        display: flex;
        flex-direction: row;               
        justify-content: space-between;
        align-items: center;
        background: #efe9ff;
        border-radius: 8px;
        padding: 8px 10px;               
        gap: 8px;
        font-size: 0.75rem;             
      }

      .shipping-option .method {
        font-weight: 500;
        font-size: 0.75rem;
        margin: 0;
        white-space: nowrap;            
      }

      .shipping-option .guarantee {
        font-size: 0.7rem;
        color: #34a853;
        margin: 0;
        white-space: nowrap;
      }

      .shipping-option .ship-price {
        font-weight: 600;
        font-size: 0.8rem;
        color: #333;
        white-space: nowrap;
      }


        .payment-card {
          padding: 12px;
          font-size: 0.8rem;
        }

        .order-card {
          padding: 12px;
          font-size: 0.8rem;
        }

        .order-total {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .order-total p {
          font-size: 0.75rem;
        }

        .order-total span {
          font-size: 0.85rem;
        }

        .order-total button {
          width: 100%;
          font-size: 0.85rem;
          padding: 10px;
          margin-top: 10px; 
        }

        
        .modal-overlay {
          position: fixed;
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0;
          background: rgba(0,0,0,0.45);
          padding-bottom: 550px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
        }

        .confirm-modal {
          background: white;
          padding: 22px 24px;
          width: 70%;
          max-width: 320px;
          text-align: center;
          border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        }

        .confirm-modal h3 {
          margin: 0 0 8px;
          font-size: 0.9rem;
        }
      }

      /* Tablets (slightly bigger screens) */
      @media (min-width: 601px) and (max-width: 850px) {
        .checkout-content {
          flex-direction: column;
          padding: 25px;
        }
      }
      `}</style>
    </div>
  );
}