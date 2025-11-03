import React, { useEffect, useState } from 'react';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';


const fetchProductDetails = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return productSnap.data();
    }
    return null;
  } catch (err) {
    console.error('Error fetching product:', err);
    return null;
  }
};


const db = getFirestore();
const auth = getAuth();

export default function Orders() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [customUserId, setCustomUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('Orders');
  const tabs = ['Orders', 'ToShip', 'ToReceive', 'Completed', 'Cancelled'];
  const location = useLocation();
  const navigate = useNavigate();
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingDetails, setShippingDetails] = useState(null);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [cancellationDetails, setCancellationDetails] = useState(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateOrderDetails, setRateOrderDetails] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);




  const [ordersData, setOrdersData] = useState({
    Orders: [],
    ToShip: [],
    ToReceive: [],
    Completed: [],
    Cancelled: [],
  });

  const [ordersWithProducts, setOrdersWithProducts] = useState({
  Orders: [],
  ToShip: [],
  ToReceive: [],
  Completed: [],
  Cancelled: [],
});

  useEffect(() => {
    if (location.state?.fromCheckout && location.state?.orderId) {
      alert(`✅ Your order ${location.state.orderId} has been placed successfully!`);

      // Clear state to prevent alert from showing again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);


  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user || null);
    });
    return unsubscribe;
  }, []);

  // Get custom userId
  useEffect(() => {
    const fetchCustomUserId = async () => {
      if (!firebaseUser) return;

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.userId) setCustomUserId(data.userId);
        }
      } catch (err) {
        console.error('Error fetching custom userId:', err);
      }
    };
    fetchCustomUserId();
  }, [firebaseUser]);

  // Listen to all collections filtered by userId
  useEffect(() => {
    if (!customUserId) return;

    const collections = [
      { name: 'orders', key: 'Orders' },
      { name: 'toShip', key: 'ToShip' },
      { name: 'toReceive', key: 'ToReceive' },
      { name: 'completed', key: 'Completed' },
      { name: 'cancelled', key: 'Cancelled' },
    ];

    const unsubscribes = collections.map(({ name, key }) =>
      onSnapshot(collection(db, name), async (snapshot) => {
        const filteredOrders = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((order) => order.userId === customUserId);

        // Fetch product details for each order item
        const enrichedOrders = await Promise.all(
          filteredOrders.map(async (order) => {
            const itemsWithDetails = await Promise.all(
              order.items.map(async (item) => {
                const productData = await fetchProductDetails(item.productId);
                return { ...item, ...productData }; // merge product info
              })
            );
            return { ...order, items: itemsWithDetails }; // order.id remains
          })
        );

        // ✅ Replace array entirely to prevent duplicates
          setOrdersWithProducts(prev => {
            const existingOrders = prev[key] || [];
            const ordersMap = new Map();

            // Add existing orders
            existingOrders.forEach(o => ordersMap.set(o.id, o));

            // Add new orders, replacing duplicates
            enrichedOrders.forEach(o => ordersMap.set(o.id, o));

            return { ...prev, [key]: Array.from(ordersMap.values()) };
          });
      })
    );

    return () => unsubscribes.forEach(unsub => unsub());
  }, [customUserId]);


const handleCancelOrder = async (order) => {
  const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
  if (!confirmCancel) return;

  try {
    // ✅ Only the fields you listed + cancelledAt
    const cancelledOrder = {
      cancelledID: `CN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      address: order.address,
      createdAt: order.createdAt,
      deliveryFee: order.deliveryFee,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        size: item.size,
        price: item.price,
        status: 'Cancelled', 
      })),
      name: order.name,
      orderId: order.orderId,
      status: 'Cancelled',
      total: order.total,
      userId: order.userId,
      cancelledAt: new Date(), // new field
    };

    const cancelledRef = doc(collection(db, 'cancelled'));
    await setDoc(cancelledRef, cancelledOrder);

    // Restore stock for each item
    for (const item of order.items) {
      const productRef = doc(db, 'products', item.productId);
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) continue;

      const productData = productSnap.data();
      const updatedStock = {
        ...productData.stock,
        [item.size]: (productData.stock?.[item.size] || 0) + item.quantity,
      };
      const totalStock = Object.values(updatedStock).reduce((sum, val) => sum + val, 0);

      await setDoc(productRef, { ...productData, stock: updatedStock, totalStock }, { merge: true });
    }

    // Delete the original order from 'orders'
    const orderRef = doc(db, 'orders', order.id);
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

    // Switch to Cancelled tab
    setActiveTab('Cancelled');

    alert('Order cancelled successfully and stock updated.');
  } catch (err) {
    console.error('Failed to cancel order:', err);
    alert(`Failed to cancel order. Error: ${err.message}`);
  }
};



const handleOrderReceived = async (order) => {
  try {
    // ✅ Only the fields you listed + receivedAt
    const completedOrder = {
      toshipID: order.toshipID,         
      toreceiveID: order.toreceiveID,
      productID: order.productID,
      completedID: `CP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      address: order.address,
      createdAt: order.createdAt,
      deliveryFee: order.deliveryFee,
      items: order.items.map(item => ({
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
      receivedAt: new Date(), // new field
      status: 'Completed',
      total: order.total,
      userId: order.userId,
    };

   const completedRef = doc(collection(db, 'completed'));
    await setDoc(completedRef, completedOrder);

    // Delete the original doc from 'toReceive'
    const toReceiveRef = doc(db, 'toReceive', order.id);
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

    // Switch to Completed tab
    setActiveTab('Completed');

    alert('Order marked as received and moved to Completed.');
  } catch (err) {
    console.error('Error marking order as received:', err);
    alert('Failed to mark order as received. Try again.');
  }
};

  const handleViewShippingDetails = async (order) => {
    try {
      // Fetch expected delivery for each product
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
      alert("Failed to fetch shipping details.");
    }
  };

 const handleViewCancellationDetails = async (order) => {
  try {
    // Use the name already saved in the cancelled order document
    setCancellationDetails({
      ...order,
      name: order.name || 'N/A',
    });

    setCancellationModalOpen(true);
  } catch (err) {
    console.error('Error fetching cancellation details:', err);
    alert('Failed to fetch cancellation details.');
  }
};

const handleRateOrder = (order) => {
  setRateOrderDetails(order);
  setRateModalOpen(true);
};


  // ✅ Render orders per tab
  const renderOrders = () => {
    const orders = ordersWithProducts[activeTab] || [];

    if (!orders || orders.length === 0) {
      const emptyMessages = {
        Orders: 'No orders yet.',
        ToShip: 'No orders to ship.',
        ToReceive: 'No orders to receive.',
        Completed: 'No completed orders.',
        Cancelled: 'No cancelled orders.',
      };
      return <p>{emptyMessages[activeTab]}</p>;
    }

    return orders.map((order) => (
      
      <div key={order.id} className="order-card">
        <img
            src={order.items?.[0]?.imageUrl || 'https://via.placeholder.com/120x120?text=No+Image'}
            alt={order.items?.[0]?.name || 'Order Item'}
            className="order-image"
          />

        <div className="order-info">
           <h4>{order.items?.[0]?.productName || 'No Item Name'}</h4>
            <p className="variant">{order.items?.[0]?.categorySub || 'N/A'}</p>
            <p className="total">
              Total {order.items?.[0]?.quantity || 1} item(s):{' '}
              <span className="price">₱{order.total || '0'}</span>
            </p>

          {activeTab === 'ToReceive' && (
            <div className="delivery-box">
              <p>Expected delivery: {order.expectedDelivery || 'Today'}</p>
              <p>Rider: {order.rider || 'Riguel Jameson Alleje'}</p>
            </div>
          )}
          {activeTab === 'ToShip' && (
              <div className="button-group" style={{ alignItems: 'center', gap: '10px' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Order ID: {order.orderId}</p>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(order.orderId);
                    alert(`Order ID ${order.orderId} copied!`);
                  }}
                >
                  COPY
                </button>
                <button className="view-btn" onClick={() => handleViewShippingDetails(order)}>
                  View Shipping Details
                </button>

              </div>
            )}

          <div className="order-footer">
              {activeTab === 'Orders' && (
                <div className="button-group" style={{ alignItems: 'center', gap: '10px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Order ID: {order.orderId}</p>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(order.orderId);
                      alert(`Order ID ${order.orderId} copied!`);
                    }}
                  >
                    COPY
                  </button>
                  <button className="view-btn" onClick={() => handleCancelOrder(order)}>
                    Cancel
                  </button>
                </div>
              )}
 
            {activeTab === 'ToReceive' && (
              <button
                className="order-btn"
                onClick={() => handleOrderReceived(order)}
              >
                Order Received
              </button>
            )}

        {activeTab === 'Completed' && (
          <div className="button-group">
            <button className="rate-btn" onClick={() => handleRateOrder(order)}>
              Rate
            </button>

            <button
              className="buy-again-btn"
              onClick={() => navigate('/checkout', { state: { completedDocId: order.id } })}
            >
              Buy Again
            </button>
          </div>
        )}


          {activeTab === 'Cancelled' && (
            <div className="button-group">
              <button
                className="view-btn"
                onClick={() => handleViewCancellationDetails(order)}
              >
                View Cancellation Details
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
        {/* Sidebar */}
        <aside className="sidebar">
          <h3 className="sidebar-title">My Orders</h3>
          <ul className="sidebar-menu">
            {tabs.map((tab) => (
              <li
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="orders-content">
          <div className="section-header">
            <h2>{activeTab}</h2>
          </div>
          <div className="content-wrapper single-column">{renderOrders()}</div>
        </main>
      </div>

      {/* Shipping Modal */}
      {shippingModalOpen && shippingDetails && (
        <div className="modal-overlay" onClick={() => setShippingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Shipping Details:</h2>

            <p><strong>User:</strong> {shippingDetails.name || 'N/A'}</p>
            <p><strong>Order ID:</strong> {shippingDetails.orderId}</p><br></br>
            
          
            <h3>Items Info.</h3>
            {shippingDetails.items.map((item, idx) => (
              <div key={idx} className="modal-item">
                <p><strong>Status:</strong> {shippingDetails.status}</p>
                <p><strong>Product:</strong> {item.productName}</p>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Size:</strong> {item.size}</p>
                <p><strong>Expected Delivery:</strong> {item.expectedDelivery}</p>
                <p>Status: Waiting to be shipped...</p>
                <hr />
              </div>
            ))}

            <button className="order-btn" onClick={() => setShippingModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellationModalOpen && cancellationDetails && (
        <div className="modal-overlay" onClick={() => setCancellationModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Cancellation Details</h2>
            <p><strong>Order ID:</strong> {cancellationDetails.orderId}</p>
            <p><strong>Status:</strong> {cancellationDetails.status}</p>
            <p><strong>User:</strong> {cancellationDetails.name}</p>
            <p><strong>Cancelled At:</strong> {cancellationDetails.cancelledAt?.toDate ? cancellationDetails.cancelledAt.toDate().toLocaleString() : cancellationDetails.cancelledAt}</p>
            
            <h3>Items</h3>
            {cancellationDetails.items.map((item, idx) => (
              <div key={idx} className="modal-item">
                <p><strong>Product:</strong> {item.productName}</p>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Size:</strong> {item.size}</p>
                <p><strong>Price:</strong> ₱{item.price}</p>
                <hr />
              </div>
            ))}

            <p><strong>Total:</strong> ₱{cancellationDetails.total}</p>

            <button className="order-btn" onClick={() => setCancellationModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {rateModalOpen && rateOrderDetails && (
        <div className="modal-overlay" onClick={() => setRateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Rate Your Order</h2>
            <p><strong>Order ID:</strong> {rateOrderDetails.orderId}</p>
            <p><strong>User:</strong> {rateOrderDetails.name}</p>
            <hr />

            {rateOrderDetails.items.map((item, idx) => (
              <div key={idx} className="modal-item">
                <p><strong>Product:</strong> {item.productName}</p>
                <p><strong>Size:</strong> {item.size}</p>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Price:</strong> ₱{item.price}</p>

                <div style={{ margin: "5px 0" }}>
                  <label>Rating: </label>
                  {[1,2,3,4,5].map((star) => (
                    <span
                      key={star}
                      style={{
                        cursor: "pointer",
                        color: "#9747FF",
                        fontSize: "1.2rem",
                        marginRight: "3px"
                      }}
                      onClick={() => {
                        setRateOrderDetails(prev => ({
                          ...prev,
                          items: prev.items.map((i, iIdx) =>
                            iIdx === idx ? { ...i, rating: star } : i
                          )
                        }));
                      }}
                    >
                      {rateOrderDetails.items[idx].rating >= star ? "★" : "☆"}
                    </span>
                  ))}
                </div>

                <textarea
                  placeholder="Write feedback (optional)..."
                  style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
                  value={item.comment || ""}
                  onChange={(e) => {
                    const comment = e.target.value;
                    setRateOrderDetails(prev => ({
                      ...prev,
                      items: prev.items.map((i, iIdx) =>
                        iIdx === idx ? { ...i, comment } : i
                      )
                    }));
                  }}
                />
                <hr />
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
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
                const reviewsCollection = collection(db, 'productReviews');

                for (const item of rateOrderDetails.items) {
                  await addDoc(reviewsCollection, {
                    reviewID: `RV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    productID: item.productID,
                    productName: item.productName,
                    size: item.size,
                    rating: item.rating || 0,
                    comment: item.comment || "",
                    userName: isAnonymous ? "Anonymous" : rateOrderDetails.name || "Anonymous",
                    createdAt: new Date()
                  });

                  // Fetch all reviews for this productID
                  const reviewsQuery = query(reviewsCollection, where("productID", "==", item.productID));
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

                  const avgRating = count > 0 ? totalRating / count : 0;

                  // Update the products collection correctly
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

                alert("Ratings submitted successfully!");
                setRateModalOpen(false);
              } catch (err) {
                console.error("Error submitting ratings:", err);
                alert("Failed to submit ratings. Try again.");
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
          min-height: 100vh;
          padding-top: 160px;
          padding-bottom: 60px;
          overflow-x: hidden;
          margin: 0 auto;
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
        }

        .sidebar {
          flex: 0 0 270px;
          background: #f3f0ff;
          padding: 20px;
          box-sizing: border-box;
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
        }

        .section-header {
          width: 90%;
          padding: 20px 40px 15px;
          border-bottom: 1px solid #ccc;
          box-sizing: border-box;
          display: flex;
          align-items: center;
        }

        .section-header h2 {
          font-size: 1.4rem;
          margin: 0;
          margin-top: 20px;
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

        .buy-btn {
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

        .buy-btn:hover {
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

    `}</style>
    </div>
  );
}
