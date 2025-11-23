import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

export default function ContactUs() {
  return (
    <div className="contact-page">

      {/* HEADER */}
      <div className="contact-header">
        <div className="floating-shapes"></div>
        <h1>Contact Us</h1>
        <p>Connect with us — we’re here to help and happy to assist.</p>
      </div>

      {/* CARDS */}
      <div className="contact-card-container">

        {/* FACEBOOK */}
        <div className="contact-card fade-in" style={{ animationDelay: "0s" }}>
          <FaFacebook className="contact-icon" style={{ color: "#1877F2" }} />
          <h3>Facebook Page</h3>
          <p>Message us on Facebook anytime.</p>
          <a
            href="https://www.facebook.com/profile.php?id=61584286040005"
            className="contact-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Facebook
          </a>
        </div>

        {/* EMAIL — CENTERED */}
        <div className="contact-card fade-in" style={{ animationDelay: "0.15s" }}>
          <SiGmail className="contact-icon gmail-icon" />
          <h3>Email Us</h3>
          <p>Reach us directly through our email address.</p>
          <p className="gmail-address">tryfitar@gmail.com</p>
        </div>

        {/* INSTAGRAM */}
        <div className="contact-card fade-in" style={{ animationDelay: "0.3s" }}>
          <FaInstagram className="contact-icon" style={{ color: "#E4405F" }} />
          <h3>Instagram</h3>
          <p>Follow and reach out to us on Instagram.</p>
          <a
            href="https://www.instagram.com/try_fits/"
            className="contact-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Instagram
          </a>
        </div>

      </div>
 
      <style>{`
        .contact-page {
          width: 100%;
          min-height: 100vh;
          background: #faf7ff;
          font-family: Arial, sans-serif;
          padding-bottom: 80px;
          overflow-x: hidden;
        }

        .contact-header {
          width: 100%;
          text-align: center;
          padding: 110px 20px 150px;
          background: linear-gradient(135deg, #b084ff, #7a3bd1);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .contact-header h1 {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 10px;
          z-index: 2;
          position: relative;
        }

        .contact-header p {
          font-size: 1.15rem;
          opacity: 0.9;
          z-index: 2;
          position: relative;
        }

        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            radial-gradient(circle at 10% 20%, rgba(255,255,255,0.15) 6px, transparent 0),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 8px, transparent 0),
            radial-gradient(circle at 50% 40%, rgba(255,255,255,0.10) 10px, transparent 0),
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12) 7px, transparent 0);
          background-size: 160px 160px;
          animation: floatBg 18s infinite linear;
          opacity: 0.45;
        }

        @keyframes floatBg {
          0% { background-position: 0 0, 0 0, 0 0, 0 0; }
          100% { background-position: 300px 300px, -300px 200px, 200px -200px, -250px -250px; }
        }

        .contact-card-container {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 32px;
          margin-top: -90px;
          padding: 0 20px;
          z-index: 10;
          position: relative;
        }

        .contact-card {
          background: white;
          width: 290px;
          padding: 42px 24px;
          border-radius: 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
          text-align: center;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .contact-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.18);
        }

        .contact-icon {
          font-size: 52px;
          margin-bottom: 18px;
          transition: transform 0.3s ease;
        }

        .gmail-icon {
          color: #D44638;  
        }

        .contact-card:hover .contact-icon {
          transform: scale(1.12);
        }

        .contact-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .contact-card p {
          font-size: 0.95rem;
          color: #555;
          margin-bottom: 20px;
        }

        .gmail-address {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin-top: 5px;
        }

        .contact-btn {
          display: inline-block;
          background: #7a3bd1;
          color: white;
          padding: 10px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: background 0.25s ease;
        }

        .contact-btn:hover {
          background: #6932bb;
        }

        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.7s ease forwards;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .contact-card-container {
            flex-direction: column;
            align-items: center;
          }
          .contact-header h1 {
            font-size: 2.4rem;
          }
        }
      `}</style>
    </div>
  );
}
