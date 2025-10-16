import React, { useState } from "react";

export default function MyOrders() {
  const [activeTab, setActiveTab] = useState("To Ship");

  const tabs = ["To Ship", "To Receive", "Completed", "Cancelled"];

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
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="orders-content">
          {/* Section Header */}
          <div className="section-header">
            <h2>{activeTab}</h2>
          </div>

          <div className="content-wrapper single-column">
            {/* TO SHIP */}
            {activeTab === "To Ship" && (
              <div className="orders-list">
                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Shirt"
                    alt="Light Blue Cotton Linen Longsleeve"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Light Blue Cotton Linen Longsleeve</h4>
                    <p className="variant">light blue</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱1,229</span>
                    </p>
                    <p className="status">
                      Waiting for Courier to confirm shipment.
                    </p>
                    <div className="order-footer">
                      <p className="order-id">
                        Order ID: <span>#1TT11000PS5</span>
                      </p>
                      <div className="button-group">
                        <button className="copy-btn">COPY</button>
                        <button className="view-btn">
                          View Shipping Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Couple+Shirt"
                    alt="Cotton Couple Shirt"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Cotton Couple Shirt</h4>
                    <p className="variant">screw & nut</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱350</span>
                    </p>
                    <p className="status">
                      Waiting for Courier to confirm shipment.
                    </p>
                    <div className="order-footer">
                      <p className="order-id">
                        Order ID: <span>#1TT11000PS5</span>
                      </p>
                      <div className="button-group">
                        <button className="copy-btn">COPY</button>
                        <button className="view-btn">
                          View Shipping Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TO RECEIVE */}
            {activeTab === "To Receive" && (
              <div className="orders-list">
                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Dress+Pink"
                    alt="Fairy Dress in Pink"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Fairy Dress in Pink</h4>
                    <p className="variant">small</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱559</span>
                    </p>
                    <div className="delivery-box">
                      <p>Expected delivery: April 1, 2025</p>
                      <p>Rider: Nanami Kento</p>
                    </div>
                    <div className="order-footer">
                      <button className="order-btn">Order Received</button>
                    </div>
                  </div>
                </div>

                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Dress+Brown"
                    alt="Fitted Dress Off Shoulder Brown"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Fitted Dress Off Shoulder Brown</h4>
                    <p className="variant">medium</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱699</span>
                    </p>
                    <div className="delivery-box">
                      <p>Expected delivery: April 1, 2025</p>
                      <p>Rider: Nanami Kento</p>
                    </div>
                    <div className="order-footer">
                      <button className="order-btn">Order Received</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETED */}
            {activeTab === "Completed" && (
              <div className="orders-list">
                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Shrek+Tee"
                    alt="Shrek meme Classic T-Shirt"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Shrek meme Classic T-Shirt</h4>
                    <p className="variant">black</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱199</span>
                    </p>
                    <div className="order-footer">
                      <div className="button-group">
                        <button className="rate-btn">Rate</button>
                        <button className="buy-btn">Buy Again</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Off+Shoulder"
                    alt="Black Off-Shoulder Top"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Black Off-Shoulder Top</h4>
                    <p className="variant">black</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱359</span>
                    </p>
                    <div className="order-footer">
                      <div className="button-group">
                        <button className="rate-btn">Rate</button>
                        <button className="buy-btn">Buy Again</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Chiffon+Blouse"
                    alt="Women’s short sleeved chiffon shirt women’s blouse"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Women’s short sleeved chiffon shirt women’s blouse</h4>
                    <p className="variant">mint green</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱259</span>
                    </p>
                    <div className="order-footer">
                      <div className="button-group">
                        <button className="rate-btn">Rate</button>
                        <button className="buy-btn">Buy Again</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CANCELLED */}
            {activeTab === "Cancelled" && (
              <div className="orders-list">
                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Blouse+Brown"
                    alt="Bow Tie Neckline Blouse"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Bow Tie Neckline Blouse</h4>
                    <p className="variant">brown</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱599</span>
                    </p>
                    <div className="order-footer">
                      <div className="button-group">
                        <button className="view-btn">
                          View Cancellation Details
                        </button>
                        <button className="buy-btn">Buy Again</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-card">
                  <img
                    src="https://via.placeholder.com/120x120?text=Trouser+Black"
                    alt="Straight Leg Trouser"
                    className="order-image"
                  />
                  <div className="order-info">
                    <h4>Straight Leg Trouser</h4>
                    <p className="variant">black</p>
                    <p className="total">
                      Total 1 item: <span className="price">₱2,039</span>
                    </p>
                    <div className="order-footer">
                      <div className="button-group">
                        <button className="view-btn">
                          View Cancellation Details
                        </button>
                        <button className="buy-btn">Buy Again</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

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
      `}</style>
    </div>
  );
}
