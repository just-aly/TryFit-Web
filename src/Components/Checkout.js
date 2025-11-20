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

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notification, setNotification] = useState("");
  const [shippingLocation, setShippingLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const completedDocId = location.state?.completedDocId || null;
  const [cartItems, setCartItems] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null); 
  const [selectedItems, setSelectedItems] = useState([]);
  

  // UI states
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    });
  }, [controls]);

  useEffect(() => {
  if (location.state?.selectedCartItems) {
    setSelectedItems(location.state.selectedCartItems);
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

        const q = query(collection(db, "shippingLocations"), where("userId", "==", customUserId));
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

  useEffect(() => {
  if (location.state?.cartItems) {
    setCartItems(location.state.cartItems);
  }

  if (location.state?.selectedCartItems) {
    setSelectedItems(location.state.selectedCartItems);
  }
}, [location.state]);


  // Toast helper
  const showToast = (message, type = "info", ms = 2500) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "info" }), ms);
  };

  // When user clicks Place Order, show confirmation modal
  const handlePlaceOrderClick = () => {
    if (!auth.currentUser) {
      showToast("You must be logged in to place an order.", "error");
      return;
    }
    if (!shippingLocation) {
      showToast("Please add a shipping address before placing an order.", "warning");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      showToast("No items selected.", "warning");
      return;
    }
    setShowConfirm(true);
  };

  // Actual place order logic (called after confirm)
  const placeOrderConfirmed = async () => {
    setShowConfirm(false);
    setIsPlacingOrder(true);

    try {
      // get custom userId
      const user = auth.currentUser;
      if (!user) {
        showToast("Login required.", "error");
        setIsPlacingOrder(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        showToast("User not found in the database.", "error");
        setIsPlacingOrder(false);
        return;
      }
      const customUserId = userSnap.data().userId;

      const deliveryFee = 58;

      // group items by productId + size
      const groupedItemsMap = new Map();
      cartItems.forEach((item) => {
        const key = `${item.productId}_${item.size}`;
        if (groupedItemsMap.has(key)) {
          const existing = groupedItemsMap.get(key);
          existing.quantity += item.quantity;
        } else {
          groupedItemsMap.set(key, { ...item });
        }
      });

      for (const groupedItem of groupedItemsMap.values()) {
        const subtotal = groupedItem.price * groupedItem.quantity;
        const total = subtotal + deliveryFee;
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const orderData = {
          orderId,
          userId: customUserId,
          name: shippingLocation.name,
          address: `${shippingLocation.house}, ${shippingLocation.fullAddress}`,
          productID: groupedItem.productID || groupedItem.productId || null,
          deliveryFee,
          total,
          delivery: groupedItem.delivery,
          createdAt: serverTimestamp(),
          status: "Pending",
          items: [
            {
              imageUrl: groupedItem.imageUrl,
              productId: groupedItem.productId,
              productName: groupedItem.productName,
              quantity: groupedItem.quantity,
              price: groupedItem.price,
              size: groupedItem.size || "-",
            },
          ],
        };

        if (!orderData.productID) {
          console.warn("Skipping item with undefined productID:", groupedItem);
          continue;
        }

        await addDoc(collection(db, "orders"), orderData);

        await addDoc(collection(db, "notifications"), {
          notifID: `NCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: customUserId,
          title: "Order Placed",
          message: `Your order ${orderId} with total ₱${total.toLocaleString()} has been placed.`,
          orderId,
          timestamp: serverTimestamp(),
          read: false,
        });

        // update product stock
        const productRef = doc(db, "products", groupedItem.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentStock = productData.stock || {};
          const currentQty = currentStock[groupedItem.size] || 0;
          const newQty = Math.max(currentQty - groupedItem.quantity, 0);

          await setDoc(
            productRef,
            {
              stock: {
                ...currentStock,
                [groupedItem.size]: newQty,
              },
            },
            { merge: true }
          );
        }
      }

      // remove placed items from cart collection for that user
      const cartRef = collection(db, "cartItems");
      const q = query(cartRef, where("userId", "==", userSnap.data().userId));
      const cartSnap = await getDocs(q);

      const deletePromises = cartSnap.docs.map(async (docSnap) => {
        const cartData = docSnap.data();
        const isOrdered = cartItems.some(
          (item) => item.productId === cartData.productId && item.size === cartData.size
        );
        if (isOrdered) await deleteDoc(docSnap.ref);
      });

      await Promise.all(deletePromises);

      // show success animation then redirect
      setShowSuccessAnim(true);
      setTimeout(() => {
        setShowSuccessAnim(false);
        navigate("/myorders", { replace: true });
      }, 2200); // animation duration + buffer

    } catch (err) {
      console.error("Error placing order:", err);
      showToast("Failed to place order. Please try again.", "error");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Navigate to add/edit address
  const handleAddAddress = () => {
    navigate("/profile", {
      state: {
        openShippingLocations: true,
        fromCheckout: true,
        cartItems: cartItems,
        selectedCartItems: selectedItems
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

      {/* Confirm dialog */}
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

      {/* Success animation overlay (Option C: stroke-draw check) */}
      {showSuccessAnim && (
        <div className="success-overlay">
          <div className="success-card" role="status" aria-live="polite">
            <svg
              className="check-svg"
              viewBox="0 0 120 120"
              width="120"
              height="120"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                strokeWidth="4"
                opacity="0.12"
              />
              <path
                className="check-path"
                d="M34 62 L52 80 L86 40"
                fill="none"
                stroke="#6c56ef"
                strokeWidth="15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="success-text">Order successfully placed!</div>
          </div>
        </div>
      )}

      {/* Page content */}
      <motion.div
        className="checkout-header"
        initial={{ opacity: 0, y: -20 }}
        animate={controls}
      >
        <div className="checkout-header-inner">
          <div className="checkout-title-row">
            <h1>Checkout</h1>
            <div className="header-line"></div>
          </div>
        </div>
      </motion.div>

      <motion.section
        className="checkout-content"
        initial={{ opacity: 0, y: 30 }}
        animate={controls}
      >
        <div className="checkout-left">
          <h1>Checkout</h1>

          {/* Shipping */}
          {loading ? (
            <p>Loading shipping info...</p>
          ) : shippingLocation ? (
            <div className="address-box">
              <div>
                <p>
                  <strong>Name: {shippingLocation.name}</strong>
                </p>
                <p>
                  <strong>House No:</strong> {shippingLocation.house}
                </p>
                <p>
                  <strong>Full Address:</strong> {shippingLocation.fullAddress}
                </p>
                <p>
                  <strong>Phone number:</strong> {shippingLocation.phone}
                </p>
                <p>
                  <strong>Postal:</strong> {shippingLocation.postalCode}
                </p>
              </div>
              <button onClick={handleAddAddress} className="edit-btn">
                Edit
              </button>
            </div>
          ) : (
            <p
              style={{
                color: "red",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={handleAddAddress}
            >
              No shipping address. Click here to add one.
            </p>
          )}

          <p>Total items: {cartItems.length}</p>

          {/* Product list */}
          {cartItems.length === 0 ? (
            <p>No items selected.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartItemCode} className="product-card">
                <img
                  src={item.productImage || item.imageUrl || "https://via.placeholder.com/80"}
                  alt={item.productName}
                  className="product-image"
                />
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
                  {cartItems.map((item) => (
                    <p key={item.cartItemCode} style={{ margin: "4px 0" }}>
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
              <p>
                Total: <span>₱{(totalPrice + 58).toLocaleString()}</span>
              </p>
              <button
                onClick={handlePlaceOrderClick}
                disabled={!shippingLocation || isPlacingOrder}
                style={{
                  backgroundColor: !shippingLocation ? "#ccc" : "#6c56ef",
                  cursor: !shippingLocation ? "not-allowed" : "pointer",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  fontSize: "16px",
                }}
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </motion.section>

<style>{`
/* ------------------------------
   GENERAL PAGE
------------------------------ */
.checkout-page {
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(to bottom, #ece5ff, #f7f3ff);
  min-height: 100vh;
  padding: 150px 0 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
   TOAST NOTIFICATION
------------------------------ */
.toast {
  position: fixed;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}

.toast.info {
  background: #fff8e6;
  color: #6b4b00;
  border-left: 6px solid #f5b800;
}

.toast.success {
  background: #e9f8ec;
  color: #1b6a32;
  border-left: 6px solid #4CAF50;
}

.toast.error {
  background: #fdecea;
  color: #8a1300;
  border-left: 6px solid #f44336;
}

.toast.warning {
  background: #fff8e6;
  color: #7a5600;
  border-left: 6px solid #f5b800;
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

/* ------------------------------
   SUCCESS OVERLAY
------------------------------ */
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
  background: rgba(0, 0, 0, 0.25); /* slight dark tint */
  backdrop-filter: blur(6px);      /
}

.success-card {
  background: transparent;
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.check-svg {
  display: block;
}

/* SVG Line Animation */
.check-path {
  stroke: #6c56ef;
  stroke-dasharray: 120;
  stroke-dashoffset: 120;
  animation: draw 0.9s ease forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

.success-text {
  font-weight: 700;
  color: #222;
  font-size: 1.5rem;
  text-align: center;
}

/* ------------------------------
   CHECKOUT HEADER
------------------------------ */
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
  margin: 0;
}

.header-line {
  flex: none;
  height: 20px;
  width: 75%;
  background: #6c56ef;
  box-shadow: 0 2px 6px rgba(108,86,239,0.3);
}

/* ------------------------------
   CHECKOUT CONTENT
------------------------------ */
.checkout-content {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1000px;
  background: white;
  padding: 40px;
  border-radius: 10px;
  border: 1px solid #bdb8f2;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.checkout-left {
  flex: 1;
  min-width: 350px;
}

/* ADDRESS BOX */
.address-box {
  background: #f5f3fe;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

/* PRODUCT CARD */
.product-card {
  background: white;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.product-details h4 {
  margin: 0;
  font-size: 1rem;
  color: #222;
}

.product-details p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #555;
}

.price {
  font-weight: 600;
  color: #8f7aec;
}

.qty {
  font-size: 0.9rem;
  color: #777;
}

/* SHIPPING BOX */
.shipping-box {
  background: white;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 15px;
}

.shipping-option {
  background: #efe9ff;
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* TOTAL */
.total-items {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.total-items .total {
  font-weight: 600;
  color: #8f7aec;
}

/* PAYMENT + ORDER SUMMARY */
.payment-card,
.order-card {
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 20px;
  margin-top: 18px;
  border-radius: 10px;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
