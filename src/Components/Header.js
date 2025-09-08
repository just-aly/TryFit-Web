import React, { useState } from "react";
import { FaShoppingCart, FaUser, FaBell, FaMapMarkerAlt, FaKey, FaTrash, FaSignOutAlt, FaIdBadge, FaLock } from "react-icons/fa";

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <header className="header">
      {/* Left: Logo */}
      <div className="logo">TRYFIT</div>

      {/* Center: Search + Right group */}
      <div className="center-area">
        {/* Search bar */}
        <div className="search-wrapper">
          <input type="text" placeholder="Search..." className="search-box" />
        </div>

        {/* Dropdowns + Icons right beside search */}
        <div className="nav-items">
          {/* Tops dropdown */}
          <div className="dropdown" onClick={() => toggleDropdown("tops")}>
            Tops {openDropdown === "tops" ? "▴" : "▾"}
            {openDropdown === "tops" && (
              <ul className="dropdown-menu">
                <li>T-Shirt</li>
                <li>Longsleeves</li>
              </ul>
            )}
          </div>

          {/* Bottoms dropdown */}
          <div className="dropdown" onClick={() => toggleDropdown("bottoms")}>
            Bottoms {openDropdown === "bottoms" ? "▴" : "▾"}
            {openDropdown === "bottoms" && (
              <ul className="dropdown-menu">
                <li>Pants</li>
                <li>Shorts</li>
              </ul>
            )}
          </div>

          {/* Cart icon */}
          <FaShoppingCart className="icon" />

          {/* Profile icon + dropdown */}
          <div className="dropdown" onClick={() => toggleDropdown("profile")}>
            <FaUser className="icon" />
            {openDropdown === "profile" && (
              <ul className="dropdown-menu profile-menu">
                <li><FaUser className="dropdown-icon" /> My Profile</li>
                <li><FaBell className="dropdown-icon" /> Notification</li>
                <li><FaMapMarkerAlt className="dropdown-icon" /> Shipping Location</li>
                <li><FaLock className="dropdown-icon" /> Change Password</li>
                <li><FaTrash className="dropdown-icon" /> Delete Account</li>
                <li><FaSignOutAlt className="dropdown-icon" /> Logout</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <style>{`
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
          width: 100%;
          z-index: 1000;
          font-family: Arial, sans-serif;
        }

        .logo {
          font-size: 2rem;
          font-weight: bold;
        }

        .center-area {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 100px;
        }

        .search-wrapper {
          display: flex;
          justify-content: center;
        }

        .search-box {
          width: 750px;
          padding: 10px 14px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }

        .nav-items {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .dropdown {
          position: relative;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .dropdown-menu {
          position: absolute;
          top: 30px;
          left: 0;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          list-style: none;
          padding: 8px 0;
          min-width: 250px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          z-index: 2000;
        }

        .dropdown-menu li {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 5px 15px;
          cursor: pointer;
          font-size: 1.3rem;
          margin-bottom: 17px;
        }

        .dropdown-menu li:hover {
          background: #6A5ACD;
          color: #fff;
        }

        .dropdown-icon {
          font-size: 1.3rem;
          color: #6A5ACD;
        }
          
        .dropdown-icon:hover {
          color: #f1efefff;
        }

        .profile-menu {
          right: 0;
          left: auto;
        }

        .icon {
          font-size: 1.4rem;
          cursor: pointer;
          color: #333;
        }

        .icon:hover {
          color: #6A5ACD;
        }
      `}</style>
    </header>
  );
}
