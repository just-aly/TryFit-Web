import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // prevent form refresh
    // add authentication check here
    navigate("/landing");
  };

  return (
    <div className="login-page">
      {/* Main Content Split */}
      <div className="main-section">
        {/* Welcome Text */}
        <div className="welcome-section">
          <h1 className="welcome-text">WELCOME to</h1>
          <h1 className="tryfit-text">TRYFIT</h1>
          <p className="tagline">
            Try outfits in AR & shop instantly. Get the app now!
          </p>
          <button className="download-bttn">Download</button>
        </div>

        {/*Login Form */}
        <div className="login-section">
          <div className="login-box">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter your email" /> {/*removed required which will be added after database's connected*/}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" /> {/*removed required which will be added after database's connected*/}
              </div>
              <button type="submit" className="login-btn">Login</button>
            </form>
            <p className="signup-text">
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
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
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
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
      </footer>

      <style>{`
        body {
          margin: 0;
          padding: 0;
        }

        .login-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
        }

        .main-section {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 60px 80px;
        }

        .welcome-section {
          flex: 1;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .welcome-text {
          font-size: 3rem;
          color: #000;
          margin: 0;
          letter-spacing: 5px;
        }

        .tryfit-text {
          font-size: 70px;
          color: #FF4ABA;
          margin: 10px 0 20px;
          letter-spacing: 8px;
        }

        .tagline {
          font-size: 1.2rem;
          color: #444;
          margin-bottom: 20px;
        }

        .welcome-section .download-btn {
          background: #6A5ACD;
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }

        .welcome-section .download-btn:hover {
          background: #5746c6;
        }

        .download-bttn {
          background: #fff;       
          color: #9747FF;            
          border: 2px solid #9747FF;   
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
          width: 30%;
        }

        .download-bttn:hover {
          background: #9747FF; 
          color: #fff;         
        }

        /* Login Section */
        .login-section {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .login-box {
          background: #fff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 340px;
        }

        .login-box h2 {
          margin-bottom: 25px;
          font-size: 1.5rem;
          text-align: center;
        }

        .form-group {
          text-align: left;
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          font-weight: normal;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }

        .login-btn {
          background-color: #6A5ACD;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 50%;
          margin: 15px auto;
          font-size: 1rem;
          display: block;
        }

        .login-btn:hover {
          background-color: #5746c6;
        }

        .signup-text {
          margin-top: 15px;
          text-align: center;
          font-size: 0.95rem;
        }

        .signup-text a {
          color: #6A5ACD;
          text-decoration: none;
          font-weight: bold;
        }

        .signup-text a:hover {
          text-decoration: underline;
        }

        /* Footer */
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
          text-align: left;
          gap: 90px;
        }

        .footer-section {
          flex: 1;
          margin: 10px 20px;
        }

        .footer-section h3 {
          font-size: 2rem; /* bigger headings */
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
          color: #ffffffff;            
          border: 2px solid #9747FF;  
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
          border: 2px solid #ccccccff;
        }

        .download-btn:hover {
          background: #9747FF; 
          color: #fff;         
        }
        .footer-desc {
          font-size: 1.5rem;
          margin-bottom: 15px;
        }

        .footer-subtext {
          font-size: 1.4rem;
          margin-top: 12px;
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
