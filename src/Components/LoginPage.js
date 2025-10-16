import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); 
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
                <input type="email" placeholder="Enter your email" /> {/*removed required which will be added after database is connected*/}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" /> {/*removed required which will be added after database is connected*/}
              </div>
              <button type="submit" className="login-btn">Login</button>
            </form>
            <p className="signup-text">
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>

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
          background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, 
          rgba(135, 123, 212, 0.6) 72%, rgba(106, 90, 205, 0.98) 100%);
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
          font-size: 4rem;
          color: #000;
          margin: 0;
          letter-spacing: 5px;
        }

        .tryfit-text {
          font-size: 5rem;
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
          background: #9747FF; 
          color: #fff;           
          border: 2px solid #9747FF;   
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
          width: 30%;
        }

        .download-bttn:hover {
          background: #f8f8f8ff;       
          color: #9747FF;          
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
          height: 450px;
          max-width: 410px;
        }

        .login-box h2 {
          margin-bottom: 25px;
          font-size: 2rem;
          text-align: center;
        }

        .form-group {
          text-align: left;
          margin-bottom: 30px;
        }

        .form-group label {
          display: block;
          font-weight: normal;
          margin-bottom: 8px;
          font-size: 17px;
        }

        .form-group input {
          width: 90%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }

        .login-btn {
          background-color: #6A5ACD;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          width: 50%;
          margin: 15px auto;
          font-size: 1rem;
          display: block;
          margin-bottom: 35px;
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
      `}</style>
    </div>
  );
}
