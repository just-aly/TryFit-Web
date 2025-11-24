import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  setDoc,
  serverTimestamp,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

const auth = getAuth();
const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/300x400.png?text=No+Image";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [popup, setPopup] = useState({ visible: false, message: "", type: "" });
  const [directCheckoutModal, setDirectCheckoutModal] = useState(false);
  const [cartSuccessModal, setCartSuccessModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(true);

  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadLink, setDownloadLink] = useState(
    "https://expo.dev/artifacts/eas/ttCsDsfrtThQZW84AFJyuf.apk"
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prodRef = doc(db, "products", productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          setProduct({ id: prodSnap.id, ...prodSnap.data() });
        } else {
          showPopup("Product not found.", "error");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        showPopup("Error loading product.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!product?.productID) return;
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, "productReviews"),
          where("productID", "==", product.productID)
        );
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.comment && item.comment.trim() !== "");

        setReviews(fetched);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [product?.productID]);

  const showPopup = (message, type = "info") => {
    setPopup({ visible: true, message, type });
    setTimeout(() => setPopup({ visible: false, message: "", type: "" }), 2000);
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading product...
      </p>
    );
  if (!product)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Product not found.
      </p>
    );

  const safeStock = product.stock || {};
  const getSizeStock = (size) => Number(safeStock[size]) || 0;

  const incrementQuantity = () => {
    if (selectedSize && quantity < getSizeStock(selectedSize))
      setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const saveCartItem = async () => {
    if (!selectedSize) return showPopup("Please select a size.", "warning");
    const stockAvailable = getSizeStock(selectedSize);
    if (quantity > stockAvailable)
      return showPopup(`Only ${stockAvailable} available.`, "warning");

    try {
      const user = auth.currentUser;
      if (!user) return showPopup("Login required.", "error");

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists())
        return showPopup("User data missing.", "error");

      const customUserId = userDocSnap.data().userId;
      const cartItemCode = doc(collection(db, "cartItems")).id;

      await setDoc(doc(db, "cartItems", cartItemCode), {
        cartItemCode,
        userId: customUserId,
        productId: product.id,
        productID: product.productID,
        productName: product.productName,
        imageUrl: product.imageUrl,
        size: selectedSize,
        quantity,
        price: product.price,
        delivery: product.delivery,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        notifID: `CRT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: customUserId,
        title: "Add to Cart",
        message: `${product.productName} (${selectedSize}) added to cart.`,
        productID: product.productID,
        timestamp: serverTimestamp(),
        read: false,
      });

      setModalVisible(false);
      setCartSuccessModal(true);
      setSelectedSize(null);
      setQuantity(1);
    } catch (err) {
      console.error("Error adding to cart:", err);
      showPopup("Failed to add item to cart.", "error");
    }
  };

  const handleDirectCheckout = () => {
    if (!selectedSize) return showPopup("Please select a size.", "warning");
    const stockAvailable = getSizeStock(selectedSize);
    if (quantity > stockAvailable)
      return showPopup(`Only ${stockAvailable} available.`, "warning");

    const checkoutItem = {
      productId: product.id,
      productID: product.productID,
      productName: product.productName,
      imageUrl: product.imageUrl,
      size: selectedSize,
      quantity,
      price: product.price,
      delivery: product.delivery,
      cartItemCode: `TEMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    navigate("/checkout", { state: { cartItems: [checkoutItem] } });
    setDirectCheckoutModal(false);
    setSelectedSize(null);
    setQuantity(1);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.7;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <span className="stars">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={"full" + i} className="star full">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}

        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={"empty" + i} className="star empty">
            ☆
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="product-details-container">
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
          <button
            className="popup-close"
            onClick={() => setPopup({ visible: false, message: "", type: "" })}
          >
            ×
          </button>
        </div>
      )}

      <div className="product-layout">
        <div className="product-image-section">
          <img
            src={product.imageUrl || PLACEHOLDER_IMAGE}
            alt={product.productName}
            className="product-image"
          />
        </div>

        <div className="product-info-section">
          <h2 className="product-title">{product.productName}</h2>
          <p className="price">₱{Number(product.price).toLocaleString()}</p>
          <div className="rating-stars">
            {renderStars(Number(product.rating || 0))}
            <span className="rating-number">
              {" "}
              {Number(product.rating).toFixed(1)}{" "}
            </span>
          </div>

          <p className="sold">{product.sold || 0} Sold</p>

          <div className="note">
            Size recommendations and AR experience are available only on the{" "}
            <span className="app-link" onClick={() => setDownloadModal(true)}>
              mobile app
            </span>
            .
          </div>

          <div className="reviews-section">
            <h3> Reviews</h3>
            {showReviews && (
              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((rev, index) => (
                    <div key={index} className="review-card">
                      <div className="review-avatar">A</div>
                      <div className="review-content">
                        <strong>{rev.userName || "Anonymous"}</strong>
                        <p className="review-size">Size: {rev.size}</p>
                        <p className="review-comment">{rev.comment}</p>
                      </div>
                      <div className="review-stars">
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(5 - rev.rating)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet.</p>
                )}
              </div>
            )}
            {reviews.length > 0 && (
              <p
                className="toggle-reviews"
                onClick={() => setShowReviews(!showReviews)}
              >
                {showReviews ? "Hide Reviews" : "Show Reviews"}
              </p>
            )}
          </div>

          <div className="button-group">
            <button
              className="add-to-cart-btn"
              onClick={() => setModalVisible(true)}
            >
              Add to Cart
            </button>
            <button
              className="checkout-btn"
              onClick={() => setDirectCheckoutModal(true)}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Size & Quantity</h3>
            <div className="c_a-container">
              <div className="product-image-section">
                <img
                  src={product.imageUrl || PLACEHOLDER_IMAGE}
                  alt={product.productName}
                  className="product-image-C_A"
                />
              </div>

              <div className="product-info-section">
                <p style={{ fontWeight: "bold" }}>{product.productName}</p>
                <div className="sizes">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      disabled={getSizeStock(size) === 0}
                      className={
                        selectedSize === size ? "size-btn selected" : "size-btn"
                      }
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                    >
                      {size} ({getSizeStock(size)} pcs)
                    </button>
                  ))}
                </div>

                <div className="quantity">
                  <label className="quantity-label">Quantity:</label>
                  <button onClick={decrementQuantity} disabled={quantity <= 1}>
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={
                      selectedSize && quantity >= getSizeStock(selectedSize)
                    }
                  >
                    ＋
                  </button>
                </div>
              </div>
            </div>

            <button className="confirm-btn" onClick={saveCartItem}>
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {directCheckoutModal && (
        <div
          className="modal-overlay"
          onClick={() => setDirectCheckoutModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Checkout Now</h3>

            <div className="c_a-container">
              <div className="product-image-section">
                <img
                  src={product.imageUrl || PLACEHOLDER_IMAGE}
                  alt={product.productName}
                  className="product-image-C_A"
                />
              </div>

              <div className="product-info-section">
                <p style={{ fontWeight: "bold" }}>{product.productName}</p>
                <div className="sizes">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      disabled={getSizeStock(size) === 0}
                      className={
                        selectedSize === size ? "size-btn selected" : "size-btn"
                      }
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                    >
                      {size} ({getSizeStock(size)} pcs)
                    </button>
                  ))}
                </div>

                <div className="quantity">
                  <label className="quantity-label">Quantity:</label>
                  <button onClick={decrementQuantity} disabled={quantity <= 1}>
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={
                      selectedSize && quantity >= getSizeStock(selectedSize)
                    }
                  >
                    ＋
                  </button>
                </div>
              </div>
            </div>

            <button className="confirm-btn" onClick={handleDirectCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {cartSuccessModal && (
        <div
          className="modal-overlay"
          onClick={() => setCartSuccessModal(false)}
        >
          <div
            className="modal-content animated"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: "center" }}
          >
            <div className="checkmark-circle">
              <span className="checkmark">✔</span>
            </div>
            <h3 style={{ marginBottom: "10px" }}>Order added to cart!</h3>
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button
                className="confirm-btn"
                style={{ flex: 1, backgroundColor: "#7B5CD6" }}
                onClick={() => navigate("/landing")}
              >
                Continue Shopping
              </button>
              <button
                className="cart-btn"
                style={{ flex: 1, border: "1px solid #7B5CD6" }}
                onClick={() => navigate("/cart")}
              >
                Go to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {downloadModal && (
        <div className="modal-overlay" onClick={() => setDownloadModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: "center" }}
          >
            <h3>Download Mobile App</h3>
            <p>Are you sure you want to download the mobile application?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button
                className="confirm-btn"
                style={{ flex: 1, backgroundColor: "#9747FF" }}
                onClick={() => {
                  window.open(downloadLink, "_blank");
                  setDownloadModal(false);
                }}
              >
                Yes
              </button>
              <button
                className="cart-btn"
                style={{
                  flex: 1,
                  border: "1px solid #9747FF",
                  background: "transparent",
                }}
                onClick={() => setDownloadModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{` 
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
          margin-left: 8px;
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

        .app-link {
          color: #9747FF;
          font-weight: bold;
          text-decoration: underline;
          cursor: pointer;
        }

        .app-link:hover {
          color: #6e32b8;
        }
        .product-details-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 150px 10px;
          font-family: Arial, sans-serif;
        }

        .product-layout {
          display: flex;
          flex-direction: row;
          gap: 40px;
          align-items: flex-start;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          padding: 10px;
          max-width: 900px;
          width: 100%;
        }

        .product-image {
          width: 100%;
          height: 450px;
          object-fit: contain;
          border-radius: 16px;
          background-color: #f9f9f9;
          padding: 10px;
        }
        .c_a-container {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .product-image-section {
          flex: 1;
        }

        .product-image-C_A {
          width: 100%;
          max-width: 250px; 
          border-radius: 10px;
          object-fit: cover;
        }

        .product-info-section {
          flex: 2;
          display: flex;
          flex-direction: column;
        }

        .note {
          color: #9747FF;
          font-size: 15px;
        }
        
        .price {
          color: #9747FF;
          font-weight: bold;
        }
        
        .reviews-section {
          margin-top: 20px;
          background: #fff;
          border-radius: 12px;
          padding: 10px 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-height: 250px;
          overflow-y: auto;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .review-card {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #fff;
          padding: 12px;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .review-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #9747FF;
          color: #fff;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
        }

        .review-content {
          flex: 1;
        }

        .review-size {
          color: gray;
          font-size: 0.85rem;
          margin: 0;
        }

        .review-comment {
          margin: 4px 0 0;
          color: #555;
        }

        .review-stars {
          font-size: 1.2rem;
          color: gold;
        }

        .stars {
          display: inline-flex;
          align-items: center;
        }

        .star {
          font-size: 20px;
          margin-right: 2px;
          color: #EFBF04; 
          position: relative;
        }

        .star.full {
          color: #EFBF04;
        }

        .star.empty {
          color: #ccc;
        }

        .star.half {
          color: #ccc;
        }

        .star.half::before {
          content: "★";
          position: absolute;
          left: 0;
          width: 50%;
          overflow: hidden;
          color: #EFBF04;
        }

        .toggle-reviews {
          color: #9747FF;
          text-align: center;
          margin-top: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .toggle-reviews:hover {
          text-decoration: underline;
        }

        .button-group {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .add-to-cart-btn {
          background-color: #9747FF;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          width: 45%;
        }

        .checkout-btn {
          background-color: white;
          color: #9747FF;
          border: 2px solid #9747FF;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          width: 45%;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 80%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          width: 80%;
          max-width: 450px;
        }

        .sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }

        .quantity {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 15px 0 20px;
        }

        .quantity-label {
          font-weight: 600;
          color: #333;
          font-size: 1rem;
        }

        .quantity button {
          font-size: 1.4rem;
          width: 40px;
          height: 40px;
          border: 1px solid #000000ff;
          background: white;
          color: #000000ff;
          cursor: pointer;
          font-weight: bold;
        }

        .quantity button:hover {
          background: #9747FF;
          color: white;
        }

        .quantity-value {
          font-size: 1.2rem;
          font-weight: bold;
          min-width: 30px;
          text-align: center;
        }

        .confirm-btn { 
          background: #9747FF; 
          color: white; 
          padding: 10px 16px; 
          border: none; 
          border-radius: 3px; 
          cursor: pointer; 
          width: 100%; }

        .size-btn {
          padding: 12px 18px;
          font-size: 1rem;
        }

        .size-btn.selected {
          border-color: #9747FF;
          background: #F3E5F5;
        }

         .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-in-out;
        }

        .modal-content.animated {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          width: 90%;
          max-width: 350px;
          animation: scaleIn 0.5s ease-out;
        }

        .checkmark-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 20px auto;
          animation: bounce 0.6s ease-out;
        }

        .checkmark {
          color: #9747FF;
          font-size: 2rem;
          transform: scale(0) rotate(-45deg);
          animation: checkAnimation 0.6s forwards;
        }

        @keyframes checkAnimation {
        0% {
          transform: scale(0) rotate(-45deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.2) rotate(15deg);
          opacity: 1;
        }
        70% {
          transform: scale(0.9) rotate(-5deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
        }
       }
          
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-7px); }
        }
 
        @media (max-width: 768px) {
        .product-details-container {
          padding: 100px 10px 80px; 
        }

        .product-layout {
          flex-direction: column; 
          align-items: center;
          gap: 20px;
          padding: 20px;
          box-shadow: none;
          border-radius: 0;
        }

        .product-image-section {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .product-image {
          width: 100%;
          max-width: 350px;
          height: auto;
          border-radius: 12px;
        }

        .product-info-section {
          width: 100%;
          text-align: left;
        }

        .product-title {
          font-size: 1.1rem;
        }

        .price {
          font-size: 1rem;
        }

        .rating, .sold, .note {
          font-size: 0.9rem;
        }

        .reviews-section {
          margin-top: 20px;
          padding: 8px;
          box-shadow: none;
          border: 1px solid #f0f0f0;
          max-height: 180px;
          text-align: left;
        }

        .review-card {
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
        }

        .review-stars {
          align-self: flex-end;
        }

        .button-group {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 90%;
          background: #fff;
          border-top: 1px solid #ddd;
          padding: 10px 16px;
          display: flex;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .add-to-cart-btn, .checkout-btn {
          flex: 1;
          padding: 12px 0;
          font-size: 0.9rem;
          border-radius: 8px;
        }

        .modal-content {
          width: 85%;
          max-width: 450px;
          padding: 15px;
        }

        .sizes {
          justify-content: center;
        }

        .size-btn {
          font-size: 0.9rem;
          padding: 10px 14px;
        }

        .quantity-label {
          font-size: 0.9rem;
        }

        .quantity button {
          width: 36px;
          height: 36px;
          font-size: 1.2rem;
        }

        .confirm-btn {
          font-size: 0.9rem;
          padding: 10px;
        }
          .stars {
          display: inline-flex;
          align-items: center;
        }

        .star {
          font-size: 20px;
          margin-right: 2px;
          color: #EFBF04;
          position: relative;
        }

        .star.full {
          color: #EFBF04;
        }

        .star.empty {
          color: #ccc;
        }

        .star.half {
          color: #ccc;  
        }

        .star.half::before {
          content: "★";
          position: absolute;
          left: 0;
          width: 50%;
          overflow: hidden;
          color: #EFBF04;
        }
      }
      `}</style>
    </div>
  );
}
