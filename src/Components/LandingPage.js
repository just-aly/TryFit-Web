import React, { useState } from "react";
import { FaShoppingCart, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function LandingPage() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo">TRYFIT</div>

        {/* Search bar */}
        <div className="search-container">
          <input type="text" placeholder="Search..." className="search-box" />
        </div>

        {/* Dropdowns + Icons */}
        <div className="header-right">
          <div className="dropdowns">
            <div className="dropdown" onClick={() => toggleDropdown("tops")}>
              Tops {openDropdown === "tops" ? "▴" : "▾"}
              {openDropdown === "tops" && (
                <ul className="dropdown-menu">
                  <li>T-Shirt</li>
                  <li>Longsleeves</li>
                </ul>
              )}
            </div>

            <div className="dropdown" onClick={() => toggleDropdown("bottoms")}>
              Bottoms {openDropdown === "bottoms" ? "▴" : "▾"}
              {openDropdown === "bottoms" && (
                <ul className="dropdown-menu">
                  <li>Pants</li>
                  <li>Shorts</li>
                </ul>
              )}
            </div>
          </div>

          <div className="nav-icons">
            <FaShoppingCart className="icon cart" />
            <FaUser className="icon profile" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Discover Your Perfect Fit</h1>
          <p>
            Experience fashion in augmented reality. Try on outfits, explore
            styles, and shop instantly — only with TryFit.
          </p>
          <button className="hero-btn">Get Started</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p><FaEnvelope className="icon" /> tryfit@gmail.com</p>
            <p><FaPhone className="icon" /> +63 912 345 6789</p>
            <p><FaMapMarkerAlt className="icon" /> Tarlac City, Philippines</p>

            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="social-icon facebook" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="social-icon instagram" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer">
                <FaXTwitter className="social-icon twitter" />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Download the App</h3>
            <p className="footer-desc">
              Discover outfit ideas and find your style. Try in AR & shop—only in our app!
            </p>
            <button className="download-btn">Download App</button>
          </div>
        </div>
        <p className="footer-bottom">© 2025 TryFit. All rights reserved.</p>
      </footer>

      <style>{`
        body {
          margin: 0;
          padding: 0;
        }

        .landing-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 40px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          color: #000;
        }

        .search-container {
          flex: 0 0 250px; /* narrower search box */
          margin: 0 20px;
        }

        .search-box {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .dropdowns {
          display: flex;
          gap: 15px;
        }

        .dropdown {
          position: relative;
          cursor: pointer;
          font-size: 1.1rem;
          user-select: none;
        }

        .dropdown-menu {
          position: absolute;
          top: 35px;
          left: 0;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          list-style: none;
          padding: 10px 0;
          min-width: 140px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          z-index: 1001;
        }

        .dropdown-menu li {
          padding: 10px 15px;
          cursor: pointer;
        }

        .dropdown-menu li:hover {
          background: #f2f2f2;
        }

        .nav-icons {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .icon {
          font-size: 1.5rem;
          cursor: pointer;
          color: #333;
        }

        .icon:hover {
          color: #6A5ACD;
        }

        /* Hero Section */
        .hero {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 120px 80px 60px;
        }

        .hero-text {
          flex: 1;
          padding-right: 40px;
        }

        .hero-text h1 {
          font-size: 3rem;
          margin-bottom: 20px;
          color: #333;
        }

        .hero-text p {
          font-size: 1.2rem;
          color: #555;
          margin-bottom: 30px;
        }

        .hero-btn {
          background: #6A5ACD;
          color: #fff;
          padding: 14px 28px;
          border: none;
          border-radius: 6px;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .hero-btn:hover {
          background: #5746c6;
        }

        .footer {
          background: #4b39c2b8;
          color: #fff;
          padding: 40px 60px 20px;
        }

        .social-icons {
          margin-top: 15px;
          display: flex;
          gap: 15px;
        }

        .social-icon {
          font-size: 1.5rem;
          color: #fff;
          border-radius: 50%;
          padding: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .social-icon:hover {
          transform: scale(1.1);
        }

        .facebook { background: #1877F2; }
        .instagram { background: #E4405F; }
        .twitter { background: #000; }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          max-width: 1200px;
          margin: 0 auto;
          gap: 90px;
        }

        .footer-section {
          flex: 1;
          margin: 10px 20px;
        }

        .footer-section h3 {
          font-size: 2rem;
          margin-bottom: 15px;
        }

        .footer-section p,
        .footer-section ul li,
        .footer-section a {
          font-size: 1.5rem;
          line-height: 1.6;
        }

        .footer-section p.footer-desc {
          font-size: 1.2rem;
          margin-bottom: 12px;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 10px;
        }

        .footer-section a {
          text-decoration: none;
          color: #ddd;
        }

        .footer-section a:hover {
          color: #fff;
        }

        .download-btn {
          background: #9747ff49;
          color: #fff;
          border: 2px solid #ffffffff;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .download-btn:hover {
          background: #9747FF;
          color: #fff;
        }

        .footer-bottom {
          margin-top: 30px;
          font-size: 1rem;
          color: #ddd;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
