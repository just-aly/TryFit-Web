import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Checkout() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    });
  }, [controls]);

  return (
    <div className="checkout-page">
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
        {/* ===== Left Column ===== */}
        <div className="checkout-left">
          <div className="address-box">
            <div>
              <h3>Ariana Innocencio</h3>
              <p>(+63) 963 678 1122</p>
              <p>Cornella St. Grandline East Blue, Fishman District, 3D2Y</p>
            </div>
            <span className="arrow">{">"}</span>
          </div>

          {/* Product Card */}
          <div className="product-card">
            <img
              src="https://via.placeholder.com/80"
              alt="Product"
              className="product-image"
            />
            <div className="product-details">
              <h4>Men’s Formal Longsleeves</h4>
              <p>Black, L</p>
              <p className="price">₱489</p>
            </div>
            <span className="qty">x1</span>
          </div>

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

          {/* Total Items */}
          <div className="total-items">
            <p>Total 1 item(s)</p>
            <p className="total">₱547</p>
          </div>
        </div>

        {/* ===== Right Column ===== */}
        <div className="checkout-right">
          <div className="payment-card">
            <h3>Payment Details</h3>
            <div className="payment-row">
              <p>Merchandise Subtotal</p>
              <span>₱489</span>
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
              <span>₱547</span>
            </div>
          </div>

          {/* New separate card for Total + Button */}
          <div className="order-card">
            <div className="order-total">
              <p>
                Total: <span>₱547</span>
              </p>
              <button>Place Order</button>
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
