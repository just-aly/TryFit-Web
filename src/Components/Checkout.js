import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, addDoc, getDoc, doc, getDocs, query, where, setDoc, serverTimestamp, deleteDoc  } from "firebase/firestore";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || null; 
  const userId = user?.userId || null; // ✅ your custom userId (e.g., "U0056")

  const [notification, setNotification] = useState("");
  const [shippingLocation, setShippingLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); 
  const completedDocId = location.state?.completedDocId || null;
  const [cartItems, setCartItems] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const controls = useAnimation();

  // ✅ Animation on mount
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    });
  }, [controls]);

  // ✅ Fetch shipping location from Firestore
   useEffect(() => {
    const fetchShippingLocation = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.warn("User not logged in");
          setLoading(false);
          return;
        }

        // 🔹 Get the custom userId from users collection
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          console.warn("No user document found for UID:", currentUser.uid);
          setLoading(false);
          return;
        }

        const customUserId = userSnap.data().userId;

        // 🔹 Now query shippingLocations using the custom userId
        const q = query(
          collection(db, "shippingLocations"),
          where("userId", "==", customUserId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // ✅ Get the most recent shipping address (if you have multiple)
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
      } finally {
        setLoading(false);
      }
    };

    fetchShippingLocation();
  }, []);

  useEffect(() => {
    const fetchCompletedOrder = async () => {
      if (!completedDocId) return;

      try {
        const orderRef = doc(db, "completed", completedDocId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const data = orderSnap.data();
          console.log("✅ Completed order data:", data);

          // 🔹 Fetch imageUrl for each item from 'products' collection
          const itemsWithImages = await Promise.all(
            (data.items || []).map(async (item) => {
              if (!item.imageUrl && item.productId) {
                try {
                  const productRef = doc(db, "products", item.productId);
                  const productSnap = await getDoc(productRef);

                  if (productSnap.exists()) {
                    const productData = productSnap.data();
                    return { ...item, imageUrl: productData.imageUrl || "" };
                  }
                } catch (err) {
                  console.error(`⚠️ Error fetching product ${item.productId}:`, err);
                }
              }
              return item;
            })
          );

          // 🔹 Update state with the fetched data
          setOrderInfo(data);
          setCartItems(itemsWithImages);
        } else {
          console.error("❌ Completed order not found in Firestore.");
        }
      } catch (err) {
        console.error("🔥 Error fetching completed order:", err);
      }
    };

    fetchCompletedOrder();
  }, [completedDocId]);


  useEffect(() => {
    if (!completedDocId && location.state?.cartItems) {
      setCartItems(location.state.cartItems);
    }
  }, [completedDocId, location.state]);


  const handlePlaceOrder = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to place an order.");
      return;
    }

    setIsPlacingOrder(true);

    // 🔹 Get custom userId
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      alert("User not found in the database.");
      setIsPlacingOrder(false);
      return;
    }
    const customUserId = userSnap.data().userId;

    if (!shippingLocation) {
      alert("Please add a shipping address before placing an order.");
      setIsPlacingOrder(false);
      return;
    }

    const deliveryFee = 58;

    // 🔹 Group cart items by productId + size
    const groupedItemsMap = new Map();
    cartItems.forEach((item) => {
      const key = `${item.productId}_${item.size}`;
      if (groupedItemsMap.has(key)) {
        const existing = groupedItemsMap.get(key);
        existing.quantity += item.quantity;
      } else {
        groupedItemsMap.set(key, { ...item }); // clone
      }
    });

    // 🔹 Create separate orders for each group
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
        createdAt: serverTimestamp(),
        status: "Pending",
        items: [
          {
            productId: groupedItem.productId,
            productName: groupedItem.productName,
            quantity: groupedItem.quantity,
            price: groupedItem.price,
            size: groupedItem.size || "-",
          },
        ],
      };

      if (!orderData.productID) {
        console.warn("⚠️ Skipping item with undefined productID:", groupedItem);
        continue; // skip this loop iteration
      }

      // 🔹 Save order to Firestore
      await addDoc(collection(db, "orders"), orderData);

      // 🔹 Send notification
      await addDoc(collection(db, "notifications"), {
        notifID: `NCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: customUserId,
        title: "Order Placed",
        message: `Your order ${orderId} with total ₱${total.toLocaleString()} has been placed.`,
        orderId,
        timestamp: serverTimestamp(),
        read: false,
      });

      // 🔹 Update product stock
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

    // 🔹 Remove placed items from cart
    const cartRef = collection(db, "cartItems");
    const q = query(cartRef, where("userId", "==", customUserId));
    const cartSnap = await getDocs(q);

    const deletePromises = cartSnap.docs.map(async (docSnap) => {
      const cartData = docSnap.data();
      const isOrdered = cartItems.some(
        (item) => item.productId === cartData.productId && item.size === cartData.size
      );
      if (isOrdered) await deleteDoc(docSnap.ref);
    });

    await Promise.all(deletePromises);

    alert("✅ Order placed successfully!");
    navigate("/myorders", { state: { fromCheckout: true }, replace: true });

  } catch (err) {
    console.error("Error placing order:", err);
    alert("❌ Failed to place order. Please try again.");
  } finally {
    setIsPlacingOrder(false);
  }
};




    // ✅ Navigate to add/edit address
    const handleAddAddress = () => {
      navigate("/profile", {
        state: {
          openShippingLocations: true,
          fromCheckout: true,
        },
      });
    };

  return (
    <div className="checkout-page">
      {notification && <div className="notification">{notification}</div>}

      {/* ===== Header Section ===== */}
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

      {/* ===== Main Section ===== */}
      <motion.section
        className="checkout-content"
        initial={{ opacity: 0, y: 30 }}
        animate={controls}
      >
        <div className="checkout-left">
          <h1>Checkout</h1>

          {/* ✅ Shipping Address Section */}
          {loading ? (
            <p>Loading shipping info...</p>
          ) : shippingLocation ? (
            <div className="address-box">
              <div>
                <p><strong>Name: {shippingLocation.name}</strong></p>
                <p><strong>House No:</strong> {shippingLocation.house}</p>
                <p><strong>Full Address:</strong> {shippingLocation.fullAddress}</p>
                <p><strong>Phone number:</strong> {shippingLocation.phone}</p>
                <p><strong>Postal:</strong> {shippingLocation.postal}</p>
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


          {/* Product List */}
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

          {/* Shipping Option */}
          <div className="shipping-box">
            <h4>Shipping Option</h4>
            <div className="shipping-option">
              <div>
                <p className="method">Standard Local</p>
                <p className="guarantee">🚚 Guaranteed to get by 11 - 14 Apr</p>
              </div>
              <p className="ship-price">₱58</p>
            </div>
          </div>

          {/* Totals */}
          <div className="total-items">
            <p>Total {totalItems} item(s)</p>
            <p className="total">₱{totalPrice.toLocaleString()}</p>
          </div>

          {/* Payment Card */}
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

          {/* Place Order Button */}
          <div className="order-card">
            <div className="order-total">
              <p>
                Total: <span>₱{(totalPrice + 58).toLocaleString()}</span>
              </p>
              <button
                onClick={handlePlaceOrder}
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
          width: 83%;
          background: #6c56ef;
          box-shadow: 0 2px 6px rgba(108, 86, 239, 0.3);
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
        align-items: center; /* <-- aligns ₱547 perfectly with label */
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

        @media (max-width: 850px) {
          .checkout-content {
            flex-direction: column;
            padding: 25px;
          }

          .checkout-header-inner {
            padding: 0 25px;
          }

          .checkout-right {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
