import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [animateExit, setAnimateExit] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      alert("Please fill all fields before continuing.");
      return;
    }

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  const handleCreateAccountClick = () => {
    setAnimateExit(true);
    setTimeout(() => {
      navigate("/login");
    }, 700); // let animation finish first
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Left (White Card) */}
        <div className="left-panel">
          <div className="signup-box">
            <h2 className="signup-title">Sign Up</h2>
            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  placeholder="Enter your Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

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

              <button type="submit" className="signup-btn" disabled={isLoading}>
                {isLoading ? "Signing Up..." : "Signup"}
              </button>
            </form>

            <p className="login-text">
              Already have an account?{" "}
              <span className="link" onClick={handleCreateAccountClick}>Login</span>
            </p>
          </div>
        </div>

        {/* Right (Purple Curved Side) */}
        <motion.div
          className="right-panel"
          initial={{ x: 0 }}
          animate={animateExit ? { x: "-100%" } : { x: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <h1>
            Create your <span>Account!</span>
          </h1>
          <p>Join our team now!</p>
        </motion.div>

      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      <style>{`
        .signup-page {
          font-family: 'Poppins', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f0ff 0%, #eae2ff 40%, #d8ccff 100%);
        }

        .signup-container {
          display: flex;
          width: 90%;
          max-width: 1000px;
          height: 600px;
          border-radius: 20px;
          overflow: hidden;
          background: white;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

       .left-panel {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff;
          position: relative;
          z-index: 1; /* below purple */
        }

        .right-panel {
          flex: 1;
          position: relative;
          background: linear-gradient(145deg, #7C4DFF 0%, #9C6BFF 50%, #B39DDB 100%);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 60px;
          border-top-left-radius: 100px;
          border-bottom-left-radius: 100px;
          z-index: 2; /* above white form */
        }

        .right-panel h1 {
          font-size: 2.8rem;
          margin: 0;
          font-weight: bold;
          line-height: 1.2;
        }

        .right-panel h1 span {
          color: #FFD1FF;
        }

        .right-panel p {
          font-size: 1.1rem;
          margin-top: 15px;
          color: #f5f2ff;
          opacity: 0.9;
        }

        .signup-box {
          width: 100%;
          max-width: 360px;
          padding: 40px;
          background: #ffffff;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
        }

        .signup-title {
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

        .signup-btn {
          width: 100%;
          padding: 15px;
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

        .signup-btn:hover {
          background: linear-gradient(90deg, #5e35b1, #8660ff);
        }

        .login-text {
          text-align: center;
          margin-top: 20px;
          color: #555;
          font-size: 0.95rem;
        }

        .login-text a {
          color: #7C4DFF;
          text-decoration: none;
          font-weight: 600;
        }

        .login-text a:hover {
          text-decoration: underline;
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

        /* ===== Responsive ===== */

        @media (max-width: 900px) {
          .signup-container {
            flex-direction: column-reverse;
            height: auto;
            border-radius: 16px;
          }

          .right-panel {
            width: 100%;
            border-radius: 16px 16px 0 0;
            text-align: center;
            align-items: center;
            padding: 25px 10px;
          }

          .right-panel h1 {
            font-size: 2rem;
          }

          .right-panel p {
            font-size: 0.95rem;
          }

          .left-panel {
            width: 100%;
            padding: 30px 20px;
          }

          .signup-box {
            max-width: 100%;
            padding: 10px;
          }

          .signup-title {
            font-size: 1.8rem;
          }

          .form-group input {
            width: 75%;
            font-size: 0.85rem;
          }

          .password-toggle {
            left: 290px;
          }

          .signup-btn {
            width: 92%;
            padding: 12px;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .right-panel h1 {
            font-size: 1.7rem;
          }

          .right-panel p {
            font-size: 0.85rem;
          }

          .signup-title {
            font-size: 1.6rem;
          }

          .form-group input {
            font-size: 0.9rem;
          }

          .login-text {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}




