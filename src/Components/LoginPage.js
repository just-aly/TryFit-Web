import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const showErrorPopup = (message) => {
    // simple alert to match existing behavior; you can replace with a modal later
    alert(message);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showErrorPopup("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = userCredential.user;

      if (user) {
        // fetch user document from Firestore, similar to Flutter logic
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          console.log("User Firestore data:", userDocSnap.data());
        } else {
          console.log("No Firestore data found for this user.");
          showErrorPopup("Logged in, but user profile data not found.");
          setIsLoading(false);
          return;
        }

        // Success: redirect to landing (replace route as needed)
        navigate("/landing");
      }
    } catch (err) {
      console.error("FirebaseAuthException:", err?.code, err?.message);
      let message = "Login Failed. Please try again.";

      // map common Firebase Auth error codes to friendly messages (matches Flutter logic)
      switch (err?.code) {
        case "auth/user-not-found":
        case "user-not-found":
          message = "No user found with that Email.";
          break;
        case "auth/wrong-password":
        case "wrong-password":
          message = "Incorrect Password.";
          break;
        case "auth/invalid-email":
        case "invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/invalid-credential":
        case "invalid-credential":
          message = "Invalid email or password.";
          break;
        case "auth/too-many-requests":
        case "too-many-requests":
          message = "Too many attempts. Try again later.";
          break;
        case "auth/network-request-failed":
        case "network-request-failed":
          message = "Network error. Check your connection.";
          break;
        default:
          // include raw message for debugging but keep user-friendly text
          message = err?.message ? `${err.message}` : message;
          break;
      }

      showErrorPopup(message);
    } finally {
      setIsLoading(false);
    }
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

        {/* Login Form */}
        <div className="login-section">
          <div className="login-box">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group password-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={hidePassword ? "password" : "text"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setHidePassword(!hidePassword)}
                    role="button"
                    aria-label={hidePassword ? "Show password" : "Hide password"}
                  >
                    {hidePassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Login"}
              </button>
            </form>

            <p className="signup-text">
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      <style>{`
        body { margin: 0; padding: 0; }

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
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-sizing: border-box;
          font-size: 1rem;
          height: 42px;
        }

        /* Password field styles (match other inputs) */
        .password-group {
          position: relative;
        }

        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-wrapper input {
          width: 100%;
          padding-right: 40px; /* space for icon */
          border: 1px solid #ddd;
          border-radius: 6px;
          height: 42px;
          box-sizing: border-box;
          padding: 12px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          cursor: pointer;
          color: #6A5ACD;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .password-toggle:hover {
          color: #5746c6;
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

        /* Loading overlay */
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .spinner {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 6px solid rgba(255,255,255,0.2);
          border-top-color: #9747FF;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
