import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [animateExit, setAnimateExit] = useState(false);

  const [popup, setPopup] = useState({ type: "", title: "", message: "" });

  const showPopup = (type, title, message) => {
    setPopup({ type, title, message });
    setTimeout(() => setPopup({ type: "", title: "", message: "" }), 5000);
  };

  const closePopup = () => setPopup({ type: "", title: "", message: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showPopup("error", "Login Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          showPopup("error", "Profile Missing", "Logged in, but user data not found.");
          setIsLoading(false);
          return;
        }

        showPopup("success", "Login Successful", "Redirecting to your dashboard...");
        setTimeout(() => navigate("/landing"), 1200);
      }
    } catch (err) {
      let message = "Login Failed. Please try again.";
      switch (err?.code) {
        case "auth/user-not-found":
          message = "No user found with that Email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect Password.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Try again later.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Check your connection.";
          break;
        default:
          message = err?.message || message;
          break;
      }
      showPopup("error", "Login Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccountClick = () => {
    setAnimateExit(true);
    setTimeout(() => {
      navigate("/signup");
    }, 700);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <motion.div
          className="left-panel"
          animate={animateExit ? { x: "100%" } : { x: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <h1>
            Welcome back to <span>TryFit!</span>
          </h1>
          <p>Make shopping more exciting with the touch of AR!</p>
        </motion.div>

        <div className="right-panel">
          <div className="login-box">
            <h2 className="login-title">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group password-group">
                <label className="input-label">Password</label>
                <div className="password-wrapper">
                  <input
                    type={hidePassword ? "password" : "text"}
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setHidePassword(!hidePassword)}
                  >
                    {hidePassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Login"}
              </button>
            </form>

            <p className="signup-text">
              New here?{" "}
              <span className="link" onClick={handleCreateAccountClick}>
                Create an Account
              </span>
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      {/* 🟣 Popup Notification */}
      {popup.message && (
        <div className="popup-overlay top">
          <motion.div
            className={`popup-box popup-${popup.type}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <button className="popup-close" onClick={closePopup}>
              &times;
            </button>
            <h3>{popup.title}</h3>
            <p>{popup.message}</p>
          </motion.div>
        </div>
      )}

      <style>{`
        .login-page {
          font-family: 'Poppins', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f7f4fc 0%, #e3d9f9 25%, #d3c4fd 50%, #cac0fc 75%, #a997c9 100%);
          overflow: hidden;
        }

        .login-container {
          display: flex;
          width: 90%;
          max-width: 1000px;
          height: 600px;
          border-radius: 20px;
          overflow: hidden;
          background: white;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        /* 🟣 Left Panel */
        .left-panel {
          flex: 1;
          background: linear-gradient(145deg, #7C4DFF 0%, #9C6BFF 50%, #B39DDB 100%);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 60px;
          border-top-right-radius: 100px;
          border-bottom-right-radius: 100px;
          position: relative;
          width: 50%;
          z-index: 2;
        }

        .left-panel h1 {
          font-size: 2.8rem;
          margin: 0;
          font-weight: bold;
          line-height: 1.2;
        }

        .left-panel h1 span {
          color: #FFD1FF;
        }

        .left-panel p {
          font-size: 1.1rem;
          margin-top: 15px;
          color: #f5f2ff;
          opacity: 0.9;
        }

        /* ⚪ Right Section */
        .right-panel {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff;
          z-index: 1;
        }

        .login-box {
          width: 100%;
          max-width: 360px;
          padding: 40px;
          background: #ffffff;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
        }

        .login-title {
          text-align: left;
          color: #7C4DFF;
          font-size: 1.80rem;
          margin-bottom: 30px;
        }

        .input-label {
          display: block;
          font-weight: 500;
          color: #444;
          margin-bottom: 6px;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group input {
          width: 85%;
          padding: 13px 45px 13px 15px;
          border: 1px solid #ccc;
          border-radius: 30px;
          font-size: 1rem;
          color: #333;
          transition: border 0.2s ease;
        }

        .form-group input:focus {
          border-color: #7C4DFF;
          outline: none;
          box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.15);
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #666;
          font-size: 1.2rem;
        }

        .login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(90deg, #6f42c1, #9b7bff);
          border: none;
          border-radius: 30px;
          color: #fff;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-top: 8px;
        }

        .login-btn:hover {
          background: linear-gradient(90deg, #5e35b1, #8660ff);
        }

        .signup-text {
          text-align: center;
          margin-top: 20px;
          color: #555;
          font-size: 0.95rem;
        }

        .link {
          color: #7C4DFF;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }

        .link:hover {
          text-decoration: underline;
        }

        .popup-overlay.top {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          pointer-events: none;
        }

        .popup-box {
          pointer-events: auto;
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px 15px;
          text-align: left;
          width: 340px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          animation: fadeIn 0.3s ease;
          position: relative;
        }

        .popup-success {
          border-left: 6px solid #28a745;
        }

        .popup-error {
          border-left: 6px solid #d9534f;
        }

        .popup-warning {
          border-left: 6px solid #f0ad4e;
        }

        .popup-box h3 {
          margin: 0 0 6px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
        }

        .popup-box p {
          font-size: 0.95rem;
          color: #444;
          margin: 0;
        }

        .popup-close {
          position: absolute;
          top: 6px;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.3rem;
          color: #999;
          cursor: pointer;
          transition: color 0.2s;
        }

        .popup-close:hover {
          color: #333;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 900px) {
          .login-container {
            flex-direction: column;
            height: auto;
            border-radius: 16px;
          }

          .left-panel {
            width: 100%;
            border-radius: 16px 16px 0 0;
            text-align: center;
            align-items: center;
            padding: 25px 5px;
          }

          .left-panel h1 {
            font-size: 2rem;
          }

          .left-panel p {
            font-size: 0.95rem;
          }

          .right-panel {
            width: 100%;
            padding: 30px 20px;
          }

          .login-box {
            max-width: 100%;
            padding: 10px;
          }

          .login-title {
            font-size: 1.8rem;
          }

          .form-group input {
            width: 75%;
            font-size: 0.85rem;
          }

          .password-toggle {
            left: 250px;
          }

          .login-btn {
            width: 92%;
            padding: 12px;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .left-panel h1 {
            font-size: 1.7rem;
          }

          .left-panel p {
            font-size: 0.85rem;
          }

          .login-title {
            font-size: 1.6rem;
          }

          .form-group input {
            font-size: 0.9rem;
          }

          .signup-text {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
