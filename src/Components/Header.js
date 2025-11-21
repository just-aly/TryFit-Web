import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase"; 
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";



export default function Header() {
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [placeholder, setPlaceholder] = useState("T-Shirt");
  const [animate, setAnimate] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [uniqueUserId, setUniqueUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const headerRef = useRef(null);
  const searchRef = useRef(null);

  //  Static base suggestions
  const BASE_SUGGESTIONS = ["T-shirt", "Longsleeves", "Pants", "Shorts"];

  const [searchSuggestions, setSearchSuggestions] = useState(BASE_SUGGESTIONS);

  //  Fuse for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(searchSuggestions, {
        includeScore: true,
        threshold: 0.4,
      }),
    [searchSuggestions]
  );

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return; 

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUniqueUserId(snap.data().userId); 
      }
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!uniqueUserId) return;

    const notifRef = collection(db, "notifications");

    const q = query(
      notifRef,
      where("userId", "==", uniqueUserId),   
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });

    return unsub;
  }, [uniqueUserId]);


  //  Placeholder animation
  useEffect(() => {
    const items = ["T-shirt", "Longsleeve", "Shorts", "Pants"];
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

  //  Fetch product names from backend (optional)
  useEffect(() => {
    const fetchProductNames = async () => {
      try {
        // Example: fetch from API or Firebase later
        const fetchedNames = ["Joggers", "Hoodie",];
        const merged = Array.from(new Set([...BASE_SUGGESTIONS, ...fetchedNames]));
        setSearchSuggestions(merged);
      } catch (err) {
        console.error("Error fetching product names:", err);
      }
    };
    fetchProductNames();
  }, []);

  // Search handler
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

  //  Handle suggestion click
  const handleSuggestionClick = (item) => {
    setInputValue("");
    setFilteredSuggestions([]);
    navigate(`/searchresults?query=${encodeURIComponent(item)}`);
  };

  //  Submit search manually
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      navigate(`/searchresults?query=${encodeURIComponent(inputValue.trim())}`);
      setFilteredSuggestions([]);
      setInputValue("");
    }
  };

  //  Outside click closes dropdowns & suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target) &&
        (!searchRef.current || !searchRef.current.contains(event.target))
      ) {
        setOpenDropdown(null);
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //  Logout confirmation handlers
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setOpenDropdown(null);
  };

    const confirmLogout = async () => {
      await signOut(auth);
      setShowLogoutModal(false);

      // Prevent back navigation
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = function () {
        window.history.go(1);
      };

      // Reset navigation like React Native reset()
      navigate("/login", { replace: true });
    };


  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
    <header className="header" ref={headerRef}>
        <div className="logo" onClick={() => navigate("/landing")}>
          TRYFIT
        </div>

        <div className="center-area">
          {/*  Search bar */}
          <form className="search-wrapper" ref={searchRef} onSubmit={handleSearchSubmit}>
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
            <button type="submit" className="search-icon-btn">
              <FaSearch className="search-icon" />
            </button>

            {/*  Suggestions dropdown */}
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
          </form>

          {/* Navigation */}
          <div className="nav-items">
            <div className="dropdown" onClick={() => toggleDropdown("tops")}>
              Tops {openDropdown === "tops" ? "▴" : "▾"}
              {openDropdown === "tops" && (
                <ul className="dropdown-menu small-menu">
                  <li onClick={() => navigate("/categories?category=T-Shirt")}>
                    T-Shirts
                  </li>
                  <li onClick={() => navigate("/categories?category=Longsleeves")}>
                    Longsleeves
                  </li>
                </ul>
              )}
            </div>

            <div className="dropdown" onClick={() => toggleDropdown("bottoms")}>
              Bottoms {openDropdown === "bottoms" ? "▴" : "▾"}
              {openDropdown === "bottoms" && (
                <ul className="dropdown-menu small-menu">
                  <li onClick={() => navigate("/categories?category=Pants")}>Pants</li>
                  <li onClick={() => navigate("/categories?category=Shorts")}>Shorts</li>
                </ul>
              )}
            </div>

            <div className="nav-icon-wrapper" onClick={() => navigate("/myorders")}>
              <FaShoppingBag className="icon" />
               <span className="tooltip">My Orders</span>
            </div>

            <div className="nav-icon-wrapper" onClick={() => navigate("/cart")}>
              <FaShoppingCart className="icon" />
              <span className="tooltip">Cart</span>
            </div>
            <div
              className="dropdown nav-icon-wrapper"
              onClick={() => toggleDropdown("profile")}
              style={{ position: "relative" }}
            >
              <FaUser className="icon" />

              {/*  RED DOT ON THE HEADER ICON */}
              {unreadCount > 0 && (
                <span
                  className="notif-badge-dot"
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    width: "8px",
                    height: "8px",
                    backgroundColor: "red",
                    borderRadius: "50%",
                    border: "1px solid white",
                  }}
                ></span>
              )}

              <span className="tooltip">Profile</span>

              {openDropdown === "profile" && (
                <ul className="dropdown-menu profile-menu">
                  <li onClick={() => navigate("/profile")}>
                    <FaUser className="dropdown-icon" /> My Profile
                  </li>

                  <li
                    onClick={() => navigate("/notification")}
                    style={{ position: "relative", display: "flex", alignItems: "center" }}
                  >
                    <FaBell className="dropdown-icon" /> Notifications

                    {/*  RED DOT IN DROPDOWN */}
                    {unreadCount > 0 && (
                      <span
                        className="notif-badge-dot"
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "5px",
                          width: "8px",
                          height: "8px",
                          backgroundColor: "red",
                          borderRadius: "50%",
                        }}
                      ></span>
                    )}
                  </li>

                  <li onClick={handleLogoutClick}>
                    <FaSignOutAlt className="dropdown-icon" /> Logout
                  </li>
                </ul>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <h3>Are you sure you want to sign out?</h3>
            <div className="modal-buttons">
              <button className="yes-btn" onClick={confirmLogout}>
                Yes
              </button>
              <button className="no-btn" onClick={cancelLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

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
          font-family: 'Krona One', sans-serif;
        }

        .logo:hover { 
          color: #6A5ACD; 
        }

        .center-area {
          display: flex; align-items: center; justify-content: center;
          flex: 1; gap: 100px;
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
        .search-wrapper:focus-within { border: 1px solid #6A5ACD; }

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
        .placeholder-text.slide { transform: translateX(-15px); opacity: 0; }

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

        .search-icon-btn {
          background: none;
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .search-icon-btn:hover .search-icon {
          color: #6A5ACD;
        }

        .search-wrapper:hover .search-icon,
        .search-wrapper:focus-within .search-icon { color: #6A5ACD; }

        .nav-items { display: flex; align-items: center; gap: 35px; }

        .dropdown {
          position: relative;
          cursor: pointer;
          font-size: 1rem;
          padding-bottom: 4px;
          transition: border-bottom 0.2s ease-in-out;
        }
        .dropdown:hover,
        .nav-icon-wrapper:hover { border-bottom: 2px solid #6A5ACD; }

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
        .dropdown-menu li:hover { background: #6A5ACD; color: #fff; }
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
        .icon:hover + .tooltip { visibility: visible; opacity: 1; }

        /*  Logout Modal */
        .modal-overlay {
          position: fixed;
          font-family: Arial, sans-serif;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
        }

        .logout-modal {
          background: #fff;
          padding: 30px 40px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          width: 420px;
          max-width: 90%;
        }

        .logout-modal h3 {
          font-size: 1.2rem;
          margin-bottom: 20px;
          color: #333;
        }

        .modal-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .yes-btn {
          background-color: #6A5ACD;
          color: #fff;
          border: none;
          padding: 10px 25px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s;
        }
        .yes-btn:hover { background-color: #5948b0; }

        .no-btn {
          background-color: #f1f1f1;
          color: #333;
          border: none;
          padding: 10px 25px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s;
        }
        .no-btn:hover { background-color: #e0e0e0; }

        @media (max-width: 1024px) {
          .header {
            flex-direction: column;
            align-items: center;
            height: auto;
            padding: 8px 15px;
            gap: 8px;
          }

          .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
          }

          .tryfit-text { display: inline; }
          .home-icon { display: none; }

          .center-area {
            flex-direction: column;
            gap: 8px;
          }

          .nav-items {
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
          }

          .search-wrapper {
            width: 100%;
            max-width: 400px;
          }
        }

        @media (max-width: 600px) {
          .header {
            flex-direction: column;
            align-items: stretch;
            height: auto;
            padding: 10px;
            gap: 10px;
          }

          .logo {
            justify-content: center;
            font-size: 1.1rem;
          }

          .tryfit-text { display: none; }
          .home-icon { display: inline; font-size: 1.4rem; cursor: pointer; }

          .center-area {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }

          .search-wrapper {
            border: 1px solid #ccc;
            border-radius: 6px;
            width: 90%;
            max-width: 280px;
            transition: all 0.3s ease;
            position: relative;
          }

          .search-wrapper.active {
            width: 90%;
          }

          .search-box {
            font-size: 0.9rem;
            padding: 6px 8px;
          }

          .nav-items {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 10px;
            font-size: 0.8rem;
          }

          .icon {
            font-size: 1.1rem;
          }

          .dropdown-menu {
            position: relative;
            top: 0;
            box-shadow: none;
            border: 1px solid #eee;
          }

          .profile-menu {
            right: auto;
            left: 0;
          }

          .suggestions-container {
            width: 100%;
            top: 35px;
            font-size: 0.85rem;
          }

          .dropdown {
            position: relative;
          }

          .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            padding: 8px 0;
            margin: 0;
            z-index: 1000;
            list-style: none;
            min-width: 130px;
          }

          .dropdown-menu li {
            padding: 8px 12px;
            cursor: pointer;
            white-space: nowrap;
          }

          .dropdown-menu li:hover {
            background: #f2f2f2;
          }

          .profile-menu {
            right: 0;
            left: auto; 
          }
        }
      `}</style>
    </>
  );
}
