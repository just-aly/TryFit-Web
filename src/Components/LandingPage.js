import React, { useState } from "react";
import { FaShoppingCart, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function LandingPage() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Discover Your Perfect Fit</h1>
          <p>
            Experience fashion in augmented reality. Try on outfits, explore
            styles, and shop instantly — only with TryFit.
          </p>
          <button className="hero-btn">Get Started</button>
        </div>
      </section>

      <style>{`
        body {
          margin: 0;
          padding: 0;
        }

        .landing-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
        }
          
        /* Hero Section */
        .hero {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 120px 80px 60px;
        }

        .hero-text {
          flex: 1;
          padding-right: 40px;
        }

        .hero-text h1 {
          font-size: 3rem;
          margin-bottom: 20px;
          color: #333;
        }

        .hero-text p {
          font-size: 1.2rem;
          color: #555;
          margin-bottom: 30px;
        }

        .hero-btn {
          background: #6A5ACD;
          color: #fff;
          padding: 14px 28px;
          border: none;
          border-radius: 6px;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .hero-btn:hover {
          background: #5746c6;
        }
      `}</style>
    </div>
  );
}
