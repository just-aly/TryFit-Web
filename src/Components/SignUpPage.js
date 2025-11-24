import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [animateExit, setAnimateExit] = useState(false); 
  const [popup, setPopup] = useState({ type: "", title: "", message: "" });
  const [showPopupBox, setShowPopupBox] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const showPopup = (type, title, message) => {
    setPopup({ type, title, message });
    setShowPopupBox(true); 
    setTimeout(() => {
      setShowPopupBox(false);
      setTimeout(() => setPopup({ type: "", title: "", message: "" }), 400);
    }, 3000);
  };

  const closePopup = () => {
    setShowPopupBox(false);
    setTimeout(() => setPopup({ type: "", title: "", message: "" }), 400);
  };
 
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      showPopup("error", "Validation Error", "Please fill all fields before continuing.");
      return;
    }
 
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(password)) {
      showPopup(
        "error",
        "Weak Password",
        "Password must be at least 6 characters long and include at least 1 number and 1 special character."
      );
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const counterRef = doc(db, "counters", "userId");
      let userId;

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

      await setDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        email: email.trim(),
        userId,
        createdAt: serverTimestamp(),
      });
 
      setShowSuccessOverlay(true);
      setTimeout(() => navigate("/landing"), 3000);

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

      showPopup("error", "Sign Up Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccountClick = () => {
    setAnimateExit(true);
    setTimeout(() => {
      navigate("/login");
    }, 700);
  };

  return (
    <div className="signup-page">
      <div className="signup-container"> 
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
 
      {popup.type && (
        <div
          className={`popup-container popup-${popup.type} ${showPopupBox ? "show" : "hide"}`}
        >
          <button className="close-btn" onClick={closePopup}>×</button>
          <h3>{popup.title}</h3>
          <p>{popup.message}</p>
        </div>
      )}
 
      {showSuccessOverlay && (
        <div className="success-overlay">
          <div className="success-message">
            Account Created Successfully!
          </div>
        </div>
      )}

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
        }

        .right-panel h1 {
          font-size: 2.8rem;
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
          color: #7C4DFF;
          font-size: 1.80rem;
          margin-bottom: 30px;
        }

        .input-label {
          font-weight: 500;
          color: #444;
          margin-bottom: 6px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group input {
          width: 85%;
          padding: 13px 45px 13px 15px;
          border: 1px solid #939292ff;
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
 
        .popup-container {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          text-align: center;
          min-width: 300px;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .popup-container.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .popup-container.hide {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }

        .popup-success { border-left: 6px solid #28a745; }
        .popup-error { border-left: 6px solid #d9534f; }
        .popup-warning { border-left: 6px solid #f0ad4e; }

        .close-btn {
          position: absolute;
          top: 8px;
          right: 12px;
          background: none;
          border: none;
          font-size: 1.2rem;
          color: #888;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .close-btn:hover { color: #000; }

        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start; 
          padding-top: 20px;
          background: rgba(255, 255, 255, 0.13); 
          backdrop-filter: blur(8px);          
          -webkit-backdrop-filter: blur(8px); 
          z-index: 9999;
          pointer-events: none;                 
          animation: fadeIn 0.4s ease;
        }

        .success-message {
          background: #transparent;         
          padding: 16px 30px;
          font-size: 1.2rem;
          font-weight: 600;
          color: #7C4DFF;
          text-align: center;
          border-radius: 12px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
 
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

          .password-toggle { left: 290px; }

          .signup-btn { width: 92%; padding: 12px; font-size: 1rem; }
        }

        @media (max-width: 480px) {
          .right-panel h1 { font-size: 1.7rem; }
          .right-panel p { font-size: 0.85rem; }
          .signup-title { font-size: 1.6rem; }
          .password-toggle { left: 280px; }
          .form-group input { font-size: 0.9rem; }
          .login-text { font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
