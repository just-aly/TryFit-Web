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
          <div className="section-header">
            <h2>{activeTab}</h2>
          </div>

          <div className="content-wrapper single-column">
            {activeTab === "To Ship" && <p>You have no items to ship yet.</p>}
            {activeTab === "To Receive" && <p>You have no items to receive.</p>}
            {activeTab === "Completed" && <p>No completed orders yet.</p>}
            {activeTab === "Cancelled" && <p>No cancelled orders.</p>}
          </div>
        </main>
      </div>

      <style>{`
        .orders-page {
          flex-direction: column;
          padding-top: 130px; 
          padding-bottom: 20px; 
          display: flex;
          justify-content: center;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background: linear-gradient(to right, #e5dcff, #f3f0ff);
          margin: 0 auto;
          overflow-x: hidden;
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

        /* Sidebar */
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
          position: relative;
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

        /* Main content */
        .orders-content {
          flex: 1;            
          min-width: 0;       
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
          justify-content: flex-start;
          gap: 40px;
          padding: 40px;
          box-sizing: border-box;
          min-height: 500px;
        }

        .content-wrapper.single-column {
          flex-direction: column;
          align-items: flex-start;
        }
      `}</style>
    </div>
  );
}
