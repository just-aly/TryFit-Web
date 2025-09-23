import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Profile() {
  const [activeOption, setActiveOption] = useState("Edit Profile");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const menuOptions = [
    "Edit Profile",
    "Shipping Location",
    "Change Password",
    "Delete Account",
  ];

  const headerMap = {
    "Edit Profile": "My Profile",
    "Shipping Location": "My Address",
    "Change Password": "My Password",
    "Delete Account": "Delete Account",
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3 className="sidebar-title">My Account</h3>
          <ul className="sidebar-menu">
            {menuOptions.map((option) => (
              <li
                key={option}
                className={activeOption === option ? "active" : ""}
                onClick={() => setActiveOption(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="profile-content">
          {/* Section Header */}
          <div className="section-header">
            <h2>{headerMap[activeOption]}</h2>
          </div>

          {/* Main Wrapper */}
          <div
            className={`content-wrapper ${
              activeOption !== "Edit Profile" ? "single-column" : ""
            }`}
          >
            {/* Left form */}
            <div className="form-left">
              {activeOption === "Edit Profile" && (
                <>
                  <label>
                    Name
                    <input type="text" placeholder="Enter your full name" />
                  </label>
                  <label>
                    User name
                    <input type="text" placeholder="Enter your username" />
                  </label>
                  <label>
                    Email
                    <input type="email" placeholder="lengdoe@gmail.com" />
                  </label>
                  <label>
                    Phone Number
                    <input type="text" placeholder="Enter your phone number" />
                  </label>
                  <label className="gender-label">Gender</label>
                  <div className="gender-options">
                    <label>
                      <input type="radio" name="gender" value="male" /> Male
                    </label>
                    <label>
                      <input type="radio" name="gender" value="female" /> Female
                    </label>
                    <label>
                      <input type="radio" name="gender" value="other" /> Other
                    </label>
                  </div>
                  <button className="save-btn">Save</button>
                </>
              )}

              {activeOption === "Shipping Location" && (
                <>
                  <label>
                    Name
                    <input type="text" placeholder="Enter your full name" />
                  </label>
                  <label>
                    Phone Number
                    <input type="text" placeholder="e.g. 09123456789" />
                  </label>
                  <label>
                    Address
                    <input
                      type="text"
                      placeholder="Barangay, Municipality, Province"
                    />
                  </label>
                  <label>
                    Street Name, Building, House No.
                    <input
                      type="text"
                      placeholder="Street, Building, House Number"
                    />
                  </label>
                  <label>
                    Postal ID
                    <input type="text" placeholder="Enter postal code" />
                  </label>
                  <button className="save-btn">Save</button>
                </>
              )}

              {activeOption === "Change Password" && (
                <>
                  <label>
                    Current Password
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                      />
                      <span
                        className="eye-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </label>
                  <label>
                    New Password
                    <div className="password-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                      />
                      <span
                        className="eye-icon"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </label>
                  <label>
                    Confirm New Password
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                      />
                      <span
                        className="eye-icon"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </label>
                  <button className="save-btn">Save</button>
                </>
              )}

              {activeOption === "Delete Account" && (
                <>
                  <p className="delete-warning">
                    Warning: Deleting your account is permanent and cannot be
                    undone. All your data including:
                  </p>
                  <ul className="delete-list">
                    <li>Order history</li>
                    <li>Preferences</li>
                    <li>Personal information</li>
                  </ul>
                  <p className="delete-footer">will be permanently removed.</p>
                  <label>
                    Email Address
                    <input type="email" placeholder="Enter your email" />
                  </label>
                  <label>
                    Confirm Password
                    <div className="password-wrapper">
                      <input
                        type={showDeletePassword ? "text" : "password"}
                        placeholder="Enter your password"
                      />
                      <span
                        className="eye-icon"
                        onClick={() =>
                          setShowDeletePassword(!showDeletePassword)
                        }
                      >
                        {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </label>
                  <button className="save-btn">Delete Account</button>
                </>
              )}
            </div>

            {/* Profile picture - only for Edit Profile */}
            {activeOption === "Edit Profile" && (
              <div className="form-right">
                <div className="profile-pic-wrapper">
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Profile"
                    className="profile-pic"
                  />
                  <button className="edit-btn">✎</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .profile-page {
          flex-direction: column;
          padding-top: 160px; 
          padding-bottom: 60px; 
          display: flex;
          justify-content: center;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background: linear-gradient(to right, #e5dcff, #f3f0ff);
          margin: 0 auto;
          overflow-x: hidden;
        }

        .profile-container {
          display: flex;
          background: #fff;
          border: 2px solid #6a5acd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          box-sizing: border-box;
          flex-wrap: nowrap;
        }

        /* Sidebar */
        .sidebar {
          flex: 0 0 270px; 
          background: #f3f0ff;
          padding: 20px;
          box-sizing: border-box;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 15px;
          color: #222;
          padding-bottom: 10px;
          border-bottom: 1px solid #ccc;
        }

        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-menu li {
          position: relative;
          padding: 14px 15px;
          cursor: pointer;
          color: #555;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .sidebar-menu li:hover {
          background: #e5dcff;
          color: #000;
          width: 95%;
        }

        .sidebar-menu li.active {
          font-weight: bold;
          color: #000;
          background: #fff;
          border-left: 4px solid #d220ff;
          width: 94%;
        }

        /* Main content */
        .profile-content {
          flex: 1;            
          min-width: 0;       
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .section-header {
          width: 90%;
          padding: 20px 40px 15px;
          border-bottom: 1px solid #ccc;
          box-sizing: border-box;
          display: flex;
          align-items: center;
        }

        .section-header h2 {
          font-size: 1.4rem;
          margin: 0;
          margin-top: 20px;
          color: #222;
        }

        .content-wrapper {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          padding: 40px;
          box-sizing: border-box;
          min-height: 500px;
        }

        .content-wrapper.single-column {
          justify-content: flex-start;
          align-items: flex-start;
        }

        .form-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 600px;
        }

        label {
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #333;
        }

        .profile-page input[type="text"],
        .profile-page input[type="email"],
        .profile-page input[type="password"] {
          padding: 10px;
          border: 1.5px solid #999;
          border-radius: 6px;
          font-size: 0.9rem;
          outline: none;
          width: 100%;
        }

        input:focus {
          border-color: #6a5acd;
        }

        .gender-options {
          display: flex;
          gap: 20px;
          font-size: 0.9rem;
        }

        .save-btn {
          margin-top: 10px;
          padding: 12px;
          background: #6a5acd;
          color: #fff;
          font-size: 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 160px;
          transition: 0.2s;
        }

        .save-btn:hover {
          background: #5746c6;
        }

        .form-right {
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          padding-top: 5px; 
          padding-left: 50px;
        }

        .profile-pic-wrapper {
          position: relative;
          display: inline-block;
        }

        .profile-pic {
          width: 160px;
          height: 160px; 
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #6a5acd;
          display: block; 
        }

        .edit-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: #6a5acd;
          color: white;
          border: none;
          border-radius: 50%;
          padding: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        /* Password eye toggle */
        .password-wrapper {
          position: relative;
          width: 100%;
        }

        .password-wrapper input {
          width: 100%;
          padding-right: 35px;
        }

        .eye-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #666;
        }

        /* Delete account section */
        .delete-warning {
          color: red;
          margin-bottom: 6px;
        }

        .delete-list {
          margin: 0 0 6px 20px;
          padding: 0;
          font-size: 0.9rem;
          color: red;
        }

        .delete-list li {
          margin-bottom: 4px;
          list-style-type: disc;
          color: red;
        }

        .delete-footer {
          margin: 0 0 16px 0;
          color: red;
        }
      `}</style>
    </div>
  );
}
