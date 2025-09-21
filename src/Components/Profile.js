import React, { useState } from "react";

export default function Profile() {
  const [activeOption, setActiveOption] = useState("Edit Profile");

  const menuOptions = ["Edit Profile", "Shipping Location", "Change Password", "Delete Account"];

  return (
     
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3 className="sidebar-title">My Profile</h3>
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
          <div className="form-left">
            <label>
              Name
              <input type="text" />
            </label>

            <label>
              User name
              <input type="text" />
            </label>

            <label>
              Email
              <input type="email" placeholder="lengdoe@gmail.com" />
            </label>

            <label>
              Phone Number
              <input type="text" />
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
          </div>

          {/* Profile image */}
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
        </main>
      </div>

      <style>{`
        .profile-page {
          display: flex;
          margin-top: 50px;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background: linear-gradient(to right, #e5dcff, #f3f0ff);
        }

        .profile-container {
          display: flex;
          background: #fff;
          border: 2px solid #6a5acd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
          width: 80%;
          max-width: 1000px;
        }

        /* Sidebar */
        .sidebar {
          width: 270px;
          background: #f3f0ff;
          padding: 20px;
        }

        .sidebar-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 25px;
          color: #222;
        }

        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-menu li {
          position: relative;
          padding: 15px 15px;
          cursor: pointer;
          overflow: hidden;
          color: #555;
          transition: color 0.3s ease;
          font-size: 1.2rem;
        }

        /* Left border bar */
        .sidebar-menu li.active::before,
        .sidebar-menu li:hover::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #d220ffff;
        }

        .sidebar-menu li.active,
        .sidebar-menu li:hover {
          font-weight: bold;
          color: #000;
          background-color: #ffffffff;
          width: 260px;
          
        }

        /* Profile content */
        .profile-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          gap: 40px;
          background: #fff;
          padding: 40px;
          box-sizing: border-box;
        }

        .form-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        label {
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #333;
        }

        input[type="text"],
        input[type="email"] {
          padding: 10px;
          border: 1.5px solid #999;
          border-radius: 6px;
          font-size: 0.9rem;
          outline: none;
        }

        input:focus {
          border-color: #6a5acd;
        }

        .gender-label {
          margin-top: 10px;
        }

        .gender-options {
          display: flex;
          gap: 20px;
          font-size: 0.9rem;
        }

        .save-btn {
          margin-top: 20px;
          padding: 12px;
          background: #6a5acd;
          color: #fff;
          font-size: 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 160px;
          transition: 0.2s;
          align-self: center;
        }

        .save-btn:hover {
          background: #5746c6;
        }

        /* Profile picture with edit button */
        .form-right {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-pic-wrapper {
          position: relative;
          display: inline-block;
        }

        .profile-pic {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #6a5acd;
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
      `}</style>
    </div>
  );
}
