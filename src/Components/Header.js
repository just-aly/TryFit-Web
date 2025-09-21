import React, { useState } from "react";
import {
  FaShoppingCart,
  FaShoppingBag,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate(); // ✅ React Router hook

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <header className="header">
      {/* Left: Logo */}
      <div className="logo" onClick={() => navigate("/landing")}>
        TRYFIT
      </div>

      {/* Center: Search + Right group */}
      <div className="center-area">
        {/* Search bar */}
        <div className="search-wrapper">
          <input type="text" placeholder="Search..." className="search-box" />
          <FaSearch className="search-icon" />
        </div>

        {/* Dropdowns + Bag (orders) + Cart + Profile */}
        <div className="nav-items">
          {/* Tops dropdown */}
          <div className="dropdown" onClick={() => toggleDropdown("tops")}>
            Tops {openDropdown === "tops" ? "▴" : "▾"}
            {openDropdown === "tops" && (
              <ul className="dropdown-menu small-menu">
                <li>T-Shirt</li>
                <li>Longsleeves</li>
              </ul>
            )}
          </div>

          {/* Bottoms dropdown */}
          <div className="dropdown" onClick={() => toggleDropdown("bottoms")}>
            Bottoms {openDropdown === "bottoms" ? "▴" : "▾"}
            {openDropdown === "bottoms" && (
              <ul className="dropdown-menu small-menu">
                <li>Pants</li>
                <li>Shorts</li>
              </ul>
            )}
          </div>

          {/* My Orders (bag icon + tooltip) */}
          <div className="nav-icon-wrapper">
            <FaShoppingBag className="icon" />
            <span className="tooltip">My Orders</span>
          </div>

          {/* Cart icon + tooltip */}
          <div className="nav-icon-wrapper">
            <FaShoppingCart className="icon" />
            <span className="tooltip">Cart</span>
          </div>

          {/* Profile icon + dropdown + tooltip */}
          <div
            className="dropdown nav-icon-wrapper"
            onClick={() => toggleDropdown("profile")}
          >
            <FaUser className="icon" />
            <span className="tooltip">Profile</span>
            {openDropdown === "profile" && (
              <ul className="dropdown-menu profile-menu">
      <li onClick={() => navigate("/profile")}>
      <FaUser className="dropdown-icon" /> My Profile
    </li>

                <li>
                  <FaBell className="dropdown-icon" /> Notification
                </li>
                <li>
                  <FaSignOutAlt className="dropdown-icon" /> Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .main-content {
          padding-top: 80px; /* adjust to match your header’s height */
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 40px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          height: 80px;
          font-family: Arial, sans-serif;

        }

        .logo {
          font-size: 2rem;
          font-weight: bold;
          cursor: pointer;
        }

        .logo:hover {
          color: #6A5ACD;
        }

        .center-area {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 100px;
        }

        /* Search wrapper with icon */
        .search-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 0 10px;
          transition: border 0.2s ease-in-out;
        }

        .search-wrapper:hover,
        .search-wrapper:focus-within {
          border: 1px solid #6A5ACD;
        }

        .search-box {
          width: 700px;
          padding: 10px 8px;
          border: none;
          outline: none;
          font-size: 1rem;
          flex: 1;
        }

        .search-icon {
          font-size: 1.2rem;
          color: #666;
          cursor: pointer;
          transition: color 0.2s ease-in-out;
        }

        .search-wrapper:hover .search-icon,
        .search-wrapper:focus-within .search-icon {
          color: #6A5ACD;
        }

        .nav-items {
          display: flex;
          align-items: center;
          gap: 35px;
        }

        .dropdown {
          position: relative;
          cursor: pointer;
          font-size: 1rem;
          padding-bottom: 4px;
          transition: border-bottom 0.2s ease-in-out;
        }

        /* ✅ Purple underline on hover */
        .dropdown:hover,
        .nav-icon-wrapper:hover {
          border-bottom: 2px solid #6A5ACD;
        }

        .dropdown-menu {
          position: absolute;
          top: 30px;
          left: 0;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          list-style: none;
          padding: 0;
          min-width: 140px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          z-index: 2000;
          overflow: hidden;
        }

        .dropdown-menu li {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 10px 10px;
          cursor: pointer;
          font-size: 0.9rem;
          border-bottom: 1px solid #eee;
        }

        .dropdown-menu li:last-child {
          border-bottom: none;
        }

        .dropdown-menu li:hover {
          background: #6A5ACD;
          color: #fff;
        }

        .dropdown-icon {
          font-size: 1rem;
          color: #6A5ACD;
        }

        .dropdown-menu li:hover .dropdown-icon {
          color: #fff;
        }

        .profile-menu {
          right: 0;
          left: auto;
        }

        .icon {
          font-size: 1.3rem;
          cursor: pointer;
          color: #333;
        }

        .icon:hover {
          color: #6A5ACD;
        }

        .nav-icon-wrapper {
          position: relative;
          display: inline-block;
          padding-bottom: 4px;
          transition: border-bottom 0.2s ease-in-out;
        }

        .tooltip {
          visibility: hidden;
          opacity: 0;
          background: #e2e2e2ff;
          color: #000000ff;
          text-align: center;
          border-radius: 3px;
          padding: 4px 8px;
          font-size: 0.8rem;
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        .icon:hover + .tooltip {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </header>
  );
}
