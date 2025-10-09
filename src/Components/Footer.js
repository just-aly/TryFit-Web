import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  const navigate = useNavigate(); 

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Contact Info */}
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

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li onClick={() => navigate("/aboutus")} style={{ cursor: "pointer", color: "#ddd" }}>About Us</li>
            <li onClick={() => navigate("/contactus")} style={{ cursor: "pointer", color: "#ddd" }}>
              Contact Us
            </li>
             <li onClick={() => navigate("/termsofservice")} style={{ cursor: "pointer", color: "#ddd" }}>
              Terms of Service
             </li>
            <li onClick={() => navigate("/privacyandpolicy")} style={{ cursor: "pointer", color: "#ddd" }}>Privacy Policy</li>
          </ul>
        </div>

        {/* Download App */}
        <div className="footer-section">
          <h3>Download the App</h3>
          <p className="footer-desc">
            Discover outfit ideas and find your style. Try in AR & shop—only in our app!
          </p>
          <button className="download-btn">Download App</button>
        </div>
      </div>

      <p className="footer-bottom">© 2025 TryFit. All rights reserved.</p>

      <style>{`
        .footer {
          background: #4b39c2b8;
          color: #fff;
          padding: 40px 60px 20px;
          font-family: Arial, sans-serif;
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
          text-align: left;
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
        .icon {
          margin-right: 8px;
          color: #000;
        }
        .download-btn {
          background: #9747ff49;
          color: #fff;
          border: 2px solid #ccccccff;
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
    </footer>
  );
}
