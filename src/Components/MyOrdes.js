import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const fetchProductDetails = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return productSnap.data();
    }
    return null;
  } catch (err) {
    console.error("Error fetching product:", err);
    return null;
  }
};

const db = getFirestore();
const auth = getAuth();

export default function MyOrders() {
  const [popup, setPopup] = useState({ visible: false, message: "", type: "" });

  const showPopup = (message, type = "info") => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ visible: false, message: "", type: "" }), 2500);
  };

  const closePopup = () => setPopup({ visible: false, message: "", type: "" });

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [customUserId, setCustomUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("Orders");
  const tabs = ["Orders", "ToShip", "ToReceive", "Completed", "Cancelled"];
  const location = useLocation();
  const navigate = useNavigate();
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingDetails, setShippingDetails] = useState(null);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [cancellationDetails, setCancellationDetails] = useState(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateOrderDetails, setRateOrderDetails] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [confirmCancelModalOpen, setConfirmCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const [ordersWithProducts, setOrdersWithProducts] = useState({
    Orders: [],
    ToShip: [],
    ToReceive: [],
    Completed: [],
    Cancelled: [],
  });

  useEffect(() => {
    if (location.state?.fromCheckout && location.state?.orderId) {
      showPopup(
        `Your order ${location.state?.orderId} has been placed successfully!`,
        "success"
      );

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user || null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchCustomUserId = async () => {
      if (!firebaseUser) return;

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.userId) setCustomUserId(data.userId);
        }
      } catch (err) {
        console.error("Error fetching custom userId:", err);
      }
    };
    fetchCustomUserId();
  }, [firebaseUser]);

  useEffect(() => {
    if (!customUserId) return;

    const collections = [
      { name: "orders", key: "Orders" },
      { name: "toShip", key: "ToShip" },
      { name: "toReceive", key: "ToReceive" },
      { name: "completed", key: "Completed" },
      { name: "cancelled", key: "Cancelled" },
    ];

    const unsubscribes = collections.map(({ name, key }) =>
      onSnapshot(collection(db, name), async (snapshot) => {
        const filteredOrders = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((order) => order.userId === customUserId);

        const enrichedOrders = await Promise.all(
          filteredOrders.map(async (order) => {
            const itemsWithDetails = await Promise.all(
              order.items.map(async (item) => {
                const productData = await fetchProductDetails(item.productId);
                return { ...item, ...productData };
              })
            );
            return { ...order, items: itemsWithDetails };
          })
        );

        setOrdersWithProducts((prev) => ({
          ...prev,
          [key]: enrichedOrders,
        }));
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [customUserId]);

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setConfirmCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      const order = orderToCancel;

      const cancelledOrder = {
        cancelledID: `CN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        address: order.address,
        createdAt: order.createdAt,
        productID: order.productID,
        deliveryFee: order.deliveryFee,
        delivery: order.delivery,
        items: order.items.map((item) => ({
          imageUrl: item.imageUrl,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
        })),
        name: order.name,
        orderId: order.orderId,
        status: "Cancelled",
        total: order.total,
        userId: order.userId,
        cancelledAt: new Date(),
      };

      const cancelledRef = doc(collection(db, "cancelled"));
      await setDoc(cancelledRef, cancelledOrder);

      for (const item of order.items) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) continue;

        const productData = productSnap.data();
        const updatedStock = {
          ...productData.stock,
          [item.size]: (productData.stock?.[item.size] || 0) + item.quantity,
        };
        const totalStock = Object.values(updatedStock).reduce(
          (sum, val) => sum + val,
          0
        );

        await setDoc(
          productRef,
          { ...productData, stock: updatedStock, totalStock },
          { merge: true }
        );
      }

      const orderRef = doc(db, "orders", order.id);
      await deleteDoc(orderRef);

      const notificationsRef = collection(db, "notifications");
      await addDoc(notificationsRef, {
        notifID: `NTC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: order.userId,
        title: "Order Cancelled",
        message: `Orders is cancelled`,
        orderId: order.orderId,
        timestamp: new Date(),
        read: false,
      });

      setActiveTab("Cancelled");
      setConfirmCancelModalOpen(false);
      showPopup("Order cancelled successfully and stock updated.", "success");
    } catch (err) {
      console.error("Failed to cancel order:", err);
      showPopup("Failed to cancel order.", "error");
      setConfirmCancelModalOpen(false);
    }
  };

  const cancelCancelOrder = () => {
    setOrderToCancel(null);
    setConfirmCancelModalOpen(false);
  };

  const handleOrderReceived = async (order) => {
    try {
      const completedOrder = {
        toshipID: order.toshipID,
        toreceiveID: order.toreceiveID,
        productID: order.productID,
        completedID: `CP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        address: order.address,
        createdAt: order.createdAt,
        deliveryFee: order.deliveryFee,
        delivery: order.delivery,
        items: order.items.map((item) => ({
          imageUrl: item.imageUrl,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
        })),
        name: order.name,
        orderId: order.orderId,
        packedAt: order.packedAt,
        shippedAt: order.shippedAt,
        receivedAt: new Date(),
        status: "Completed",
        total: order.total,
        userId: order.userId,
      };

      const completedRef = doc(collection(db, "completed"));
      await setDoc(completedRef, completedOrder);
      for (const item of order.items) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentSold = productData.sold || 0;
          const newSold = currentSold + item.quantity;

          await setDoc(productRef, { sold: newSold }, { merge: true });
        }
      }

      const toReceiveRef = doc(db, "toReceive", order.id);
      await deleteDoc(toReceiveRef);

      const notificationsRef = collection(db, "notifications");

      await addDoc(notificationsRef, {
        notifID: `NTC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: order.userId,
        title: "Order Received",
        message: `Orders is receive`,
        orderId: order.orderId,
        timestamp: new Date(),
        read: false,
      });

      setActiveTab("Completed");

      showPopup("Order is confirm received", "success");
    } catch (err) {
      console.error("Error marking order as received:", err);
      showPopup("Failed to mark order as received. Try again.", "error");
    }
  };

  const handleViewShippingDetails = async (order) => {
    try {
      const itemsWithDelivery = await Promise.all(
        order.items.map(async (item) => {
          const productData = await fetchProductDetails(item.productId);
          return {
            ...item,
            expectedDelivery: productData?.delivery || "TBD",
          };
        })
      );

      setShippingDetails({
        ...order,
        items: itemsWithDelivery,
      });

      setShippingModalOpen(true);
    } catch (err) {
      console.error("Error fetching shipping details:", err);
      showPopup("Failed to fetch shipping details.", "error");
    }
  };

  const handleViewCancellationDetails = async (order) => {
    try {
      setCancellationDetails({
        ...order,
        name: order.name || "N/A",
      });

      setCancellationModalOpen(true);
    } catch (err) {
      console.error("Error fetching cancellation details:", err);
      showPopup("Failed to fetch cancellation details.", "error");
    }
  };

  const handleRateOrder = (order) => {
    setRateOrderDetails(order);
    setRateModalOpen(true);
  };

  const renderOrders = () => {
    const orders = ordersWithProducts[activeTab] || [];

    if (!orders || orders.length === 0) {
      const emptyMessages = {
        Orders: "No orders yet.",
        ToShip: "No orders to ship.",
        ToReceive: "No orders to receive.",
        Completed: "No completed orders.",
        Cancelled: "No cancelled orders.",
      };
      return <p>{emptyMessages[activeTab]}</p>;
    }

    return orders.map((order) => (
      <div key={order.id} className="order-card">
        <img
          src={
            order.items?.[0]?.imageUrl ||
            "https://via.placeholder.com/120x120?text=No+Image"
          }
          alt={order.items?.[0]?.name || "Order Item"}
          className="order-image"
        />

        <div className="order-info">
          <h4>{order.items?.[0]?.productName || "No Item Name"}</h4>
          <p className="variant">{order.items?.[0]?.categorySub || "N/A"}</p>
          <p className="total">
            Total {order.items?.[0]?.quantity || 1} item(s):{" "}
            <span className="price">₱{order.total || "0"}</span>
          </p>

          {activeTab === "ToReceive" && (
            <div className="delivery-box">
              <p>Expected delivery: {order.expectedDelivery || "Today"}</p>
              <p>Rider: {order.rider || "Riguel Jameson Alleje"}</p>
            </div>
          )}
          {activeTab === "ToShip" && (
            <div
              className="button-group"
              style={{ alignItems: "center", gap: "10px" }}
            >
              <p style={{ margin: 0, fontWeight: "bold" }}>
                Order ID: {order.orderId}
              </p>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(order.orderId);
                  showPopup(`Order ID ${order.orderId} copied!`, "success");
                }}
              >
                COPY
              </button>
              <button
                className="view-btn"
                onClick={() => handleViewShippingDetails(order)}
              >
                View Shipping Details
              </button>
            </div>
          )}

          <div className="order-footer">
            {activeTab === "Orders" && (
              <div
                className="button-group"
                style={{ alignItems: "center", gap: "10px" }}
              >
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  Order ID: {order.orderId}
                </p>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(order.orderId);
                    showPopup(`Order ID ${order.orderId} copied!`, "success");
                  }}
                >
                  COPY
                </button>
                <button
                  className="view-btn"
                  onClick={() => handleCancelOrder(order)}
                >
                  Cancel
                </button>
              </div>
            )}

            {activeTab === "ToReceive" && (
              <button
                className="order-btn"
                onClick={() => handleOrderReceived(order)}
              >
                Order Received
              </button>
            )}

            {activeTab === "Completed" && (
              <div className="button-group">
                <button
                  className="rate-btn"
                  onClick={() => handleRateOrder(order)}
                >
                  Rate
                </button>

                <button
                  className="buy-again-btn"
                  onClick={() =>
                    navigate("/recheckout", {
                      state: { completedID: order.completedID },
                    })
                  }
                >
                  Buy Again
                </button>
              </div>
            )}

            {activeTab === "Cancelled" && (
              <div className="button-group">
                <button
                  className="view-btn"
                  onClick={() => handleViewCancellationDetails(order)}
                >
                  Cancellation Details
                </button>

                <button
                  className="buy-again-btn"
                  onClick={() =>
                    navigate("/recheckout", {
                      state: { cancelledID: order.cancelledID },
                    })
                  }
                >
                  Buy Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        <aside className="sidebar">
          <h3 className="sidebar-title">My Orders</h3>
          <ul className="sidebar-menu">
            {tabs.map((tab) => (
              <li
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
        </aside>

        <main className="orders-content">
          <div className="section-header">
            <h2>{activeTab}</h2>
          </div>
          <div className="content-wrapper single-column">{renderOrders()}</div>
        </main>
      </div>

      {popup.visible && (
        <div className={`popup ${popup.type}`}>
          <div className="popup-icon">
            {popup.type === "success" && "✅"}
            {popup.type === "warning" && "⚠️"}
            {popup.type === "error" && "❌"}
          </div>

          <div className="popup-text">
            <strong className="popup-title">
              {popup.type === "success"
                ? "Success!"
                : popup.type === "warning"
                ? "Warning!"
                : "Error!"}
            </strong>
            <p className="popup-message">{popup.message}</p>
          </div>

          <button className="popup-close" onClick={closePopup}>
            ×
          </button>
        </div>
      )}

      {shippingModalOpen && shippingDetails && (
        <div
          className="modal-overlay"
          onClick={() => setShippingModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Shipping Details:</h2>

            <p>
              <strong>User:</strong> {shippingDetails.name || "N/A"}
            </p>
            <p>
              <strong>Order ID:</strong> {shippingDetails.orderId}
            </p>
            <br></br>

            <h3>Items Info.</h3>
            {shippingDetails.items.map((item, idx) => (
              <div key={idx} className="modal-item">
                <p>
                  <strong>Status:</strong> {shippingDetails.status}
                </p>
                <p>
                  <strong>Product:</strong> {item.productName}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Size:</strong> {item.size}
                </p>
                <p>
                  <strong>Expected Delivery:</strong> {item.expectedDelivery}
                </p>
                <p>Status: Waiting to be shipped...</p>
                <hr />
              </div>
            ))}

            <button
              className="order-btn"
              onClick={() => setShippingModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {confirmCancelModalOpen && orderToCancel && (
        <div className="modal-overlay" onClick={cancelCancelOrder}>
          <div
            className="modal-content confirm-cancel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Confirm Cancellation</h2>
            <p>Are you sure you want to cancel this item?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              <button
                className="order-btn"
                onClick={cancelCancelOrder}
                style={{
                  background: "#ffffffff",
                  borderColor: "#6a5acd",
                  color: "#6a5acd",
                }}
              >
                No
              </button>
              <button
                className="order-btn"
                onClick={confirmCancelOrder}
                style={{ background: "#6a5acd", color: "#ffffffff" }}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {cancellationModalOpen && cancellationDetails && (
        <div
          className="modal-overlay"
          onClick={() => setCancellationModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Cancellation Details</h2>
            <p>
              <strong>Order ID:</strong> {cancellationDetails.orderId}
            </p>
            <p>
              <strong>Status:</strong> {cancellationDetails.status}
            </p>
            <p>
              <strong>User:</strong> {cancellationDetails.name}
            </p>
            <p>
              <strong>Cancelled At:</strong>{" "}
              {cancellationDetails.cancelledAt?.toDate
                ? cancellationDetails.cancelledAt.toDate().toLocaleString()
                : cancellationDetails.cancelledAt}
            </p>

            <h3>Items</h3>
            {cancellationDetails.items.map((item, idx) => (
              <div key={idx} className="modal-item">
                <p>
                  <strong>Product:</strong> {item.productName}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Size:</strong> {item.size}
                </p>
                <p>
                  <strong>Price:</strong> ₱{item.price}
                </p>
                <hr />
              </div>
            ))}

            <p>
              <strong>Total:</strong> ₱{cancellationDetails.total}
            </p>

            <button
              className="order-btn"
              onClick={() => setCancellationModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {rateModalOpen && rateOrderDetails && (
        <div className="modal-overlay" onClick={() => setRateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Rate Your Order</h2>
            <p>
              <strong>Order ID:</strong> {rateOrderDetails.orderId}
            </p>
            <p>
              <strong>User:</strong> {rateOrderDetails.name}
            </p>
            <hr />

            {rateOrderDetails.items.map((item, idx) => (
              <div key={idx} className="modal-item">
                <p>
                  <strong>Product:</strong> {item.productName}
                </p>
                <p>
                  <strong>Size:</strong> {item.size}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Price:</strong> ₱{item.price}
                </p>

                <div style={{ margin: "5px 0" }}>
                  <label>Rating: </label>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        cursor: "pointer",
                        color: "#9747FF",
                        fontSize: "1.2rem",
                        marginRight: "3px",
                      }}
                      onClick={() => {
                        setRateOrderDetails((prev) => ({
                          ...prev,
                          items: prev.items.map((i, iIdx) =>
                            iIdx === idx ? { ...i, rating: star } : i
                          ),
                        }));
                      }}
                    >
                      {rateOrderDetails.items[idx].rating >= star ? "★" : "☆"}
                    </span>
                  ))}
                </div>

                <textarea
                  placeholder="Write feedback (optional)..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                  value={item.comment || ""}
                  onChange={(e) => {
                    const comment = e.target.value;
                    setRateOrderDetails((prev) => ({
                      ...prev,
                      items: prev.items.map((i, iIdx) =>
                        iIdx === idx ? { ...i, comment } : i
                      ),
                    }));
                  }}
                />
                <hr />
              </div>
            ))}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                />{" "}
                Submit anonymously
              </label>
            </div>

            <button
              className="order-btn"
              onClick={async () => {
                try {
                  const reviewsCollection = collection(db, "productReviews");

                  for (const item of rateOrderDetails.items) {
                    await addDoc(reviewsCollection, {
                      reviewID: `RV-${Date.now()}-${Math.floor(
                        Math.random() * 1000
                      )}`,
                      productID: item.productID,
                      productName: item.productName,
                      size: item.size,
                      rating: item.rating || 0,
                      comment: item.comment || "",
                      userName: isAnonymous
                        ? "Anonymous"
                        : rateOrderDetails.name || "Anonymous",
                      createdAt: new Date(),
                    });

                    const reviewsQuery = query(
                      reviewsCollection,
                      where("productID", "==", item.productID)
                    );
                    const reviewSnap = await getDocs(reviewsQuery);

                    let totalRating = 0;
                    let count = 0;

                    reviewSnap.forEach((doc) => {
                      const data = doc.data();
                      if (data.rating !== undefined) {
                        totalRating += data.rating;
                        count++;
                      }
                    });

                    const avgRating =
                      count > 0
                        ? Math.round((totalRating / count) * 10) / 10
                        : 0;

                    const productsQuery = query(
                      collection(db, "products"),
                      where("productID", "==", item.productID)
                    );
                    const productSnap = await getDocs(productsQuery);

                    productSnap.forEach(async (productDoc) => {
                      const productRef = doc(db, "products", productDoc.id);
                      await updateDoc(productRef, { rating: avgRating });
                    });
                  }

                  showPopup("Ratings submitted successfully!", "success");
                  setRateModalOpen(false);
                } catch (err) {
                  console.error("Error submitting ratings:", err);
                  showPopup("Failed to submit ratings. Try again.", "error");
                }
              }}
            >
              Submit Ratings
            </button>
          </div>
        </div>
      )}

      <style>{`
        .orders-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-family: Arial, sans-serif;
          background: linear-gradient(to right, #e5dcff, #f3f0ff);
          padding-top: 160px;
          padding-bottom: 60px;
          overflow-x: hidden;
          margin: 0 auto;
          width: 100%;
          height: 100vh; 
          overflow-y: auto;
          justify-content: center;
        }

        .orders-container {
          display: flex;
          background: #fff;
          border: 2px solid #6a5acd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          box-sizing: border-box;
          flex-wrap: nowrap;
          width: 100%;
          height: 100%;
          display: flex;
        }

        .sidebar {
          flex: 0 0 270px;
          background: #f3f0ff;          
          padding: 20px;
          box-sizing: border-box;
          width: 250px;
          border-right: 1px solid #ddd;
          padding: 20px;
          position: sticky;
          top: 0;
          height: auto;      
          overflow-y: auto;    
          min-height: 100%;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 15px;
          color: #222;
          padding-bottom: 10px;
          border-bottom: 1px solid #ccc;
        }

        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-menu li {
          padding: 14px 15px;
          cursor: pointer;
          color: #555;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .sidebar-menu li:hover {
          background: #e5dcff;
          color: #000;
          width: 95%;
        }

        .sidebar-menu li.active {
          font-weight: bold;
          color: #000;
          background: #fff;
          border-left: 4px solid #d220ff;
          width: 94%;
        }

        .orders-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fff;
          flex: 1;
          overflow-y: auto; 
          padding: 0px;
          position: relative;
           min-height: 100vh;
           max-height: calc(100vh - 160px);
        }

        .section-header {
          width: 100%;
          padding: 20px 40px 15px;
          border-bottom: 1px solid #ccc;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          background: white;
          padding: 20px 0;
          z-index: 100;
          border-bottom: 1px solid #eee;
          height: auto;
        }

        .section-header h2 {
          font-size: 1.4rem;
          margin: 0;
          margin-top: 20px;
          margin-left: 20px;
          color: #222;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 40px;
          box-sizing: border-box;
          min-height: 700px;
          gap: 20px;
        }

        .order-card {
          display: flex;
          align-items: flex-start;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 20px;
          background: #fff;
          width: 90%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .order-image {
          width: 110px;
          height: 110px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 20px;
        }

        .order-info h4 {
          font-size: 1rem;
          margin: 0 0 5px;
          color: #222;
        }

        .variant {
          color: #777;
          margin: 0 0 10px;
          font-size: 0.9rem;
        }

        .total {
          font-size: 0.9rem;
          color: #333;
          margin: 0;
          margin-bottom: 10px;
        }

        .price {
          font-weight: bold;
          color: #6a5acd;
          margin-left: 4px;
        }

        .status {
          font-size: 0.85rem;
          color: #555;
          margin: 8px 0 15px;
        }

        .delivery-box {
          background: #cfc6ff;
          color: #222;
          font-size: 0.9rem;
          padding: 15px 120px;
          border-radius: 6px;
          margin: 15px 0;
          position: relative;
        }

        .delivery-box p {
          margin: 0;
          position: relative;
          left: -100px;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .button-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .order-btn {
          border: 1.5px solid #6a5acd;
          background: #fff;
          color: #6a5acd;
          font-weight: bold;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: 0.3s;
        }

        .order-btn:hover {
          background: #6a5acd;
          color: #fff;
        }

        .copy-btn {
          border: 1px solid #ccc;
          background: #fff;
          padding: 8px 14px;
          font-size: 0.85rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .view-btn {
          background: #6a5acd;
          color: #fff;
          border: none;
          padding: 8px 14px;
          font-size: 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          width: 200px;
        }

        .view-btn:hover {
          background: #5746c6;
        }

        .rate-btn {
          background: #fff;
          border: 1.5px solid #ccc;
          color: #000;
          font-size: 0.9rem;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.3s;
        }

        .rate-btn:hover {
          border-color: #6a5acd;
          color: #6a5acd;
        }

        .buy-again-btn {
          border: 1.5px solid #6a5acd;
          background: #f9f7ff;
          color: #6a5acd;
          font-weight: bold;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: 0.3s;
        }

        .buy-again-btn:hover {
          background: #6a5acd;
          color: #fff;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-content {
          background: #fff;
          padding: 30px 40px;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          position: relative;
        } 
        .confirm-cancel-modal {
          width: 320px;       
          max-width: 90%;     
          padding: 20px 25px; 
          text-align: center; 
          border-radius: 8px;
          margin-bottom: 620px;
        }
 
          .popup {
          position: fixed;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 22px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          font-family: 'Poppins', sans-serif;
          color: #333;
          animation: fadeIn 0.3s ease-in-out, fadeOut 0.5s ease-in-out 1.8s forwards;
          z-index: 9999;
          min-width: 320px;
        }

        .popup-icon {
          font-size: 1.6rem;
        }

        .popup-text {
          flex: 1;
        }

        .popup-title {
          display: block;
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 2px;
        }

        .popup-message {
          font-size: 0.9rem;
          color: #333;
          margin: 0;
        }

        .popup-close {
          background: transparent;
          border: none;
          font-size: 1.4rem;
          cursor: pointer;
          color: #333;
          font-weight: bold;
          margin-left: auto;
        }

        .popup.success {
          background: #e9f8ec;
          border-left: 6px solid #4CAF50;
          color: #256d32; 
        }

        .popup.warning {
          background: #fff8e1;
          border-left: 6px solid #f5b800; 
          color: #b07e00;
        }
        .popup.error {
          background: #fdecea;
          border-left: 6px solid #f44336; 
          color: #a30000;
        }
 
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes fadeOut {
          to { opacity: 0; transform: translate(-50%, -20px); }
        }


        @media (max-width: 480px) {
          .orders-page {
            padding-top: 120px !important; 
            padding-bottom: 40px;
            background: linear-gradient(to right, #e5dcff, #f3f0ff);
          }

          .orders-container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            flex-direction: row;
            align-items: stretch;
            border: none;
            box-shadow: none;
            overflow: hidden;
          }

          .button-group p {
            font-size: 0.65rem !important;
            color: #555;
            text-align: center;
            margin: 4px 0;
            word-break: break-all;
          }

          .delivery-box {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
            text-align: right;
            width: 100%;
            background: #f1e9ff;
            border-radius: 6px;
            padding: 6px 10px;
            box-sizing: border-box;
            margin-top: 6px;
          }

            .delivery-box {
              display: flex;
              flex-direction: column;
              align-items: center;        
              justify-content: center;   
              text-align: center;        
              width: 200px;
              background: #f1e9ff;
              border-radius: 6px;
              padding: 6px 10px;
              box-sizing: border-box;
              margin-top: 6px;
            }

            .delivery-box p {
              font-size: 0.7rem !important;
              left: 5px;
              line-height: 1.3;
            }

            .delivery-box p:first-child {
              font-weight: 600;
              color: #6a5acd;
            }

            .delivery-box p:last-child {
              color: #333;
            }
          }
 
          .sidebar {
            flex: 0 0 120px !important; 
            padding: 8px 6px;
            top: 100px; 
            background: #f3f0ff;
            border-right: 1px solid #ddd;
          }

          .sidebar-title {
            font-size: 0.85rem;
            margin-bottom: 8px;
            text-align: center;
          }

          .sidebar-menu li {
            font-size: 0.75rem;
            padding: 5px 4px;
            margin-bottom: 3px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            border-radius: 4px;
          }
 
          .orders-content {
            flex: 1;
            background: #fff;
            padding: 0;
          }

          .section-header {
            padding: 10px 12px;
            border-bottom: 1px solid #6a5acd;
          }

          .section-header h2 {
            font-size: 1rem;
          }
 
          .content-wrapper {
            padding: 10px;
            gap: 10px;
          }

          .order-card {
            flex-direction: column;
            align-items: center;
            padding: 10px;
            width: 100%;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .order-image {
            width: 85px;
            height: 85px;
            margin-bottom: 10px;
            margin-right: 0;
          }

          .order-info h4 {
            font-size: 0.85rem;
            text-align: center;
            margin-bottom: 4px;
          }

          .order-id {
            font-size: 0.75rem;
            text-align: center;
            color: #666;
          }

          .variant,
          .total,
          .price,
          .status {
            font-size: 0.75rem;
            text-align: center;
          }

          .delivery-box {
            font-size: 0.7rem;
            padding: 6px;
            margin: 8px 0;
          }

          .order-footer {
            flex-direction: column;
            align-items: center;
            gap: 6px;
          }
 
          .button-group {
            flex-direction: column;
            gap: 6px;
            width: 100%;
            align-items: center;
          }

          .order-btn,
          .copy-btn,
          .view-btn,
          .rate-btn,
          .buy-again-btn {
            font-size: 0.6rem;
            padding: 5px 8px;
            border-radius: 6px;
            width: 85%;
            text-align: center;
          }
 
          .modal-content {
            width: 90%;
            padding: 12px;
            max-height: 75vh;
          }

          .modal-content h3 {
            font-size: 1rem;
          }

          .modal-content p {
            font-size: 0.85rem;
          }

          .modal-content button {
            font-size: 0.8rem;
            padding: 6px 10px;
          }
        }
      `}</style>
    </div>
  );
}
