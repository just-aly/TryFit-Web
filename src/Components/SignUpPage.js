import React from "react";
import { Link } from "react-router-dom";

export default function SignUpPage() {
  return (
    <div className="signup-page">
      <div className="signup-section">
        <div className="signup-box">
          <h2>Create an Account</h2>
          <form>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm your password" required />
            </div>
            <button type="submit" className="signup-btn">Sign Up</button>
          </form>
          <p className="login-text">
            Already have an account? <Link to="/login">Login</Link>
        </p>
        </div>
      </div>

      <style>{`
        body {
          margin: 0;
          padding: 0;
        }

        .signup-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, 
          rgba(135, 123, 212, 0.6) 72%, rgba(106, 90, 205, 0.98) 100%);
        }

        .signup-section {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
        }

        .signup-box {
          background: #fff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
        }

        .signup-box h2 {
          margin-bottom: 25px;
          font-size: 1.8rem;
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

        .signup-btn {
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

        .signup-btn:hover {
          background-color: #5746c6;
        }

        .login-text {
          margin-top: 15px;
          text-align: center;
          font-size: 0.95rem;
        }

        .login-text a {
          color: #6A5ACD;
          text-decoration: none;
          font-weight: bold;
        }

        .login-text a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
