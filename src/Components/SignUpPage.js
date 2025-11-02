import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      alert("Please fill all fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const counterRef = doc(db, "counters", "userId");
      let userId;

      // ✅ Firestore transaction for sequential userId
      await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        if (!counterDoc.exists()) {
          // First user
          transaction.set(counterRef, { lastId: 1 });
          userId = "U0001";
        } else {
          const newId = counterDoc.data().lastId + 1;
          transaction.update(counterRef, { lastId: newId });
          userId = `U${String(newId).padStart(4, "0")}`;
        }
      });

      // ✅ Store user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        email: email.trim(),
        userId,
        createdAt: serverTimestamp(),
      });

      console.log("✅ New user created:", userId);
      alert("Account created successfully!");

      // ✅ Redirect after successful signup
      navigate("/landing");
    } catch (error) {
      console.error("Firebase Sign Up Error:", error.code, error.message);

      let message = "Something went wrong. Please try again.";
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already used.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please check your internet.";
          break;
        default:
          break;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-section">
        <div className="signup-box">
          <h2>Create an Account</h2>
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group password-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="login-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>

      <style>{`
        body { margin: 0; padding: 0; }

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

        .password-group {
          position: relative;
        }

        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-wrapper input {
          width: 1000px;
          padding: 12px;
          padding-right: 218px; /* space for eye icon */
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          box-sizing: border-box;
          height: 42px; /* ensures uniform height with others */
        }

        .password-toggle {
          position: absolute;
          right: 5px;
          cursor: pointer;
          color: #6A5ACD;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
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
