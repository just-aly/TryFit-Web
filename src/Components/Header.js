import React, { useState, useEffect, useMemo } from "react";
import {
  FaShoppingCart,
  FaShoppingBag,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

export default function Header() {
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [placeholder, setPlaceholder] = useState("T-Shirt");
  const [animate, setAnimate] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const SEARCH_SUGGESTIONS = ["T-Shirts", "Longsleeves", "Pants", "Shorts"];

  // ✅ Create Fuse instance
  const fuse = useMemo(
    () =>
      new Fuse(SEARCH_SUGGESTIONS, {
        includeScore: true,
        threshold: 0.4, // controls fuzzy matching
      }),
    []
  );

  // ✅ Handle dropdown toggles
  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // ✅ Animated placeholder rotation
  useEffect(() => {
    const items = ["T-Shirt", "Longsleeve", "Shorts", "Pants"];
    let index = 0;

    const interval = setInterval(() => {
      if (inputValue.trim() === "") {
        setAnimate(true);
        setTimeout(() => {
          index = (index + 1) % items.length;
          setPlaceholder(items[index]);
          setAnimate(false);
        }, 400);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [inputValue]);

  // ✅ Handle input change + Fuse.js search
  const handleSearchChange = (e) => {
    const text = e.target.value;
    setInputValue(text);

    if (text.trim() !== "") {
      const results = fuse.search(text);
      setFilteredSuggestions(results.map((r) => r.item));
    } else {
      setFilteredSuggestions([]);
    }
  };

  // ✅ When user clicks a suggestion
  const handleSuggestionClick = (item) => {
    setInputValue(item);
    setFilteredSuggestions([]);
    navigate(`/categories?category=${encodeURIComponent(item)}`);
  };

  const goToCategory = (category) => {
    navigate(`/categories?category=${encodeURIComponent(category)}`);
    setOpenDropdown(null);
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/landing")}>
        TRYFIT
      </div>

      <div className="center-area">
        {/* 🔍 Search bar with smart suggestions */}
        <div className="search-wrapper">
          <div className="placeholder-wrapper">
            <input
              type="text"
              className="search-box"
              value={inputValue}
              onChange={handleSearchChange}
              onFocus={() => setAnimate(true)}
              onBlur={() => setAnimate(false)}
            />
            {inputValue.trim() === "" && (
              <span className={`placeholder-text ${animate ? "slide" : ""}`}>
                {placeholder}
              </span>
            )}
          </div>
          <FaSearch className="search-icon" />

          {/* 💡 Suggestions dropdown */}
          {filteredSuggestions.length > 0 && (
            <div className="suggestions-container">
              {filteredSuggestions.map((item, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation items */}
        <div className="nav-items">
          {/* Tops dropdown */}
          <div className="dropdown" onClick={() => toggleDropdown("tops")}>
            Tops {openDropdown === "tops" ? "▴" : "▾"}
            {openDropdown === "tops" && (
              <ul className="dropdown-menu small-menu">
                <li onClick={() => goToCategory("T-Shirts")}>T-Shirt</li>
                <li onClick={() => goToCategory("Longsleeves")}>Longsleeves</li>
              </ul>
            )}
          </div>

          {/* Bottoms dropdown */}
          <div className="dropdown" onClick={() => toggleDropdown("bottoms")}>
            Bottoms {openDropdown === "bottoms" ? "▴" : "▾"}
            {openDropdown === "bottoms" && (
              <ul className="dropdown-menu small-menu">
                <li onClick={() => goToCategory("Pants")}>Pants</li>
                <li onClick={() => goToCategory("Shorts")}>Shorts</li>
              </ul>
            )}
          </div>

          {/* My Orders */}
          <div className="nav-icon-wrapper" onClick={() => navigate("/myorders")}>
            <FaShoppingBag className="icon" />
            <span className="tooltip">My Orders</span>
          </div>

          {/* Cart */}
          <div className="nav-icon-wrapper" onClick={() => navigate("/cart")}>
            <FaShoppingCart className="icon" />
            <span className="tooltip">Cart</span>
          </div>

          {/* Profile */}
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
                <li onClick={() => navigate("/notification")}>
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

        .logo:hover { color: #6A5ACD; }

        .center-area {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 100px;
        }

        .search-wrapper {
          position: relative;
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

        .placeholder-wrapper { position: relative; width: 700px; }

        .search-box {
          width: 100%;
          padding: 10px 8px;
          border: none;
          outline: none;
          font-size: 1rem;
          background: transparent;
          color: #000;
          z-index: 2;
        }

        .placeholder-text {
          position: absolute;
          left: 8px;
          top: 10px;
          font-size: 1rem;
          color: rgba(0, 0, 0, 0.5);
          font-style: italic;
          pointer-events: none;
          transition: transform 0.4s ease, opacity 0.4s ease;
        }

        .placeholder-text.slide {
          transform: translateX(-15px);
          opacity: 0;
        }

        .suggestions-container {
          position: absolute;
          top: 42px;
          left: 0;
          width: 100%;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 5;
        }

        .suggestion-item {
          padding: 8px 10px;
          cursor: pointer;
        }

        .suggestion-item:hover {
          background: #6A5ACD;
          color: white;
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
          padding: 10px 10px;
          cursor: pointer;
          font-size: 0.9rem;
          border-bottom: 1px solid #eee;
        }

        .dropdown-menu li:last-child { border-bottom: none; }

        .dropdown-menu li:hover {
          background: #6A5ACD;
          color: #fff;
        }

        .profile-menu { right: 0; left: auto; }

        .icon { font-size: 1.3rem; cursor: pointer; color: #333; }
        .icon:hover { color: #6A5ACD; }

        .nav-icon-wrapper {
          position: relative;
          display: inline-block;
          padding-bottom: 4px;
          transition: border-bottom 0.2s ease-in-out;
        }

        .tooltip {
          visibility: hidden;
          opacity: 0;
          background: #e2e2e2;
          color: #000;
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
