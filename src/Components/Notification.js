import React from "react";

export default function Notification() {
  return (
    <div className="notif-container">
      <h1 className="notif-title">Notification</h1>

      <div className="notif-box">
        <div className="notif-section">
          <h2 className="notif-date">Today</h2>

          <div className="notif-item">
            <h3 className="notif-header">Order Confirmed</h3>
            <p className="notif-text">
              [10:15 AM] Your order #[ORDER_ID] has been confirmed! We’re
              preparing it for shipment.
            </p>
          </div>

          <div className="notif-item">
            <h3 className="notif-header">Order Shipped</h3>
            <p className="notif-text">
              [2:30 PM] Your order #[ORDER_ID] is now on its way! <br />
              Current Location: Pampanga
            </p>
          </div>
        </div>

        <div className="notif-section">
          <h2 className="notif-date">Yesterday</h2>

          <div className="notif-item">
            <h3 className="notif-header">Out for Delivery</h3>
            <p className="notif-text">
              [8:00 AM] Your order #[ORDER_ID] is out for delivery! Expect it to
              arrive today.
            </p>
          </div>

          <div className="notif-item">
            <h3 className="notif-header">Delivery Driver Status</h3>
            <p className="notif-text">
              [8:30 AM] Driver Name: Haechan Santos Batumbakal <br />
              Phone Number: 09********
            </p>
          </div>
        </div>

        <div className="notif-section">
          <h2 className="notif-date">Mar 3, 2025</h2>

          <div className="notif-item">
            <h3 className="notif-header">Delivered</h3>
            <p className="notif-text">
              [3:45 PM] Your order #[ORDER_ID] has been delivered! We hope you
              love it. Let us know your feedback!
            </p>
          </div>

          <div className="notif-item">
            <h3 className="notif-header">Delivered</h3>
            <p className="notif-text">
              [3:45 PM] Your order #[ORDER_ID] has been delivered! We hope you
              love it. Let us know your feedback!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .notif-container {
          background: linear-gradient(to bottom, #e5d9f2, #d8c7ef);
          min-height: 100vh;
          padding: 160px 100px;
          font-family: Arial, sans-serif;
          color: #333;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .notif-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 40px;
          text-align: left;
          color: #000000ff;
        }

        .notif-box {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 900px;
          padding: 40px;
          margin-left: 80px;
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

        .notif-header {
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

        /* Responsive */
        @media (max-width: 900px) {
          .notif-container {
            padding: 140px 20px;
            align-items: center;
          }

          .notif-box {
            margin-left: 0;
            width: 100%;
            padding: 25px;
          }

          .notif-title {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
