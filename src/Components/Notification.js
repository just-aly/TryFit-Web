import React from "react";

export default function Notification() {
  return (
    <div className="notif-page">
      {/* ===== Header Section ===== */}
      <div className="notif-header">
        <div className="notif-header-inner">
          <div className="notif-title-row">
            <h1>Notification</h1>
            <div className="header-line"></div>
          </div>
        </div>
      </div>

      {/* ===== Notification Content ===== */}
      <div className="notif-box">
        <div className="notif-section">
          <h2 className="notif-date">Today</h2>

          <div className="notif-item">
            <h3 className="notif-header-text">Order Confirmed</h3>
            <p className="notif-text">
              [10:15 AM] Your order #[ORDER_ID] has been confirmed! We’re
              preparing it for shipment.
            </p>
          </div>

          <div className="notif-item">
            <h3 className="notif-header-text">Order Shipped</h3>
            <p className="notif-text">
              [2:30 PM] Your order #[ORDER_ID] is now on its way! <br />
              Current Location: Pampanga
            </p>
          </div>
        </div>

        <div className="notif-section">
          <h2 className="notif-date">Yesterday</h2>

          <div className="notif-item">
            <h3 className="notif-header-text">Out for Delivery</h3>
            <p className="notif-text">
              [8:00 AM] Your order #[ORDER_ID] is out for delivery! Expect it to
              arrive today.
            </p>
          </div>

          <div className="notif-item">
            <h3 className="notif-header-text">Delivery Driver Status</h3>
            <p className="notif-text">
              [8:30 AM] Driver Name: Haechan Santos Batumbakal <br />
              Phone Number: 09********
            </p>
          </div>
        </div>

        <div className="notif-section">
          <h2 className="notif-date">Mar 3, 2025</h2>

          <div className="notif-item">
            <h3 className="notif-header-text">Delivered</h3>
            <p className="notif-text">
              [3:45 PM] Your order #[ORDER_ID] has been delivered! We hope you
              love it. Let us know your feedback!
            </p>
          </div>

          <div className="notif-item">
            <h3 className="notif-header-text">Delivered</h3>
            <p className="notif-text">
              [3:45 PM] Your order #[ORDER_ID] has been delivered! We hope you
              love it. Let us know your feedback!
            </p>
          </div>
        </div>
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

        /* ===== Header ===== */
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
          width: 83%;
          background: #6c56ef;
          box-shadow: 0 2px 6px rgba(108, 86, 239, 0.3);
        }

        /* ===== Notification Box ===== */
        .notif-box {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 1000px;
          padding: 40px;
          border: 1px solid #e4e2ffff;
        }

        .notif-section {
          margin-bottom: 30px;
        }

        .notif-date {
          font-size: 1rem;
          font-weight: bold;
          color: #5a3dbd;
          margin-bottom: 15px;
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

          .notif-header-inner {
            padding: 0 25px;
          }

          .notif-box {
            width: 100%;
            padding: 25px;
          }

          .notif-title-row h1 {
            font-size: 2rem;
          }

          .header-line {
            width: 83%;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
}
