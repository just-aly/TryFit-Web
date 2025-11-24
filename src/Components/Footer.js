import { FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate(); 

  return (
<footer className="footer">
  <div className="footer-content">
    {/* Contact Info */}
    <div className="footer-section">
      <h3>Contact Us</h3>
      <p><FaEnvelope className="icon" /> tryfitar@gmail.com</p>
      <p><FaPhone className="icon" /> +63 912 345 6789</p>
      <p><FaMapMarkerAlt className="icon" /> Tarlac City, Philippines</p>

      <div className="social-icons">
        <a href="https://www.facebook.com/profile.php?id=61584286040005" target="_blank" rel="noopener noreferrer">
          <FaFacebook className="social-icon facebook" />
        </a>
        <a href="https://www.instagram.com/try_fits/" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="social-icon instagram" />
        </a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer">
          <FaXTwitter className="social-icon twitter" />
        </a>
      </div>
    </div>

    {/* Quick Links */}
    <div className="footer-section">
      <h3>Quick Links</h3>
      <ul className="quick-links">
        <li onClick={() => navigate("/aboutus")}>About Us</li>
        <li onClick={() => navigate("/contactus")}>Contact Us</li>
        <li onClick={() => navigate("/termsofservice")}>Terms of Service</li>
        <li onClick={() => navigate("/privacyandpolicy")}>Privacy Policy</li>
      </ul>
    </div>

    {/* Download App */}
    <div className="footer-section">
      <h3>Download the App</h3>
      <p className="footer-desc">
        Discover outfit ideas and find your style. Try in AR & shop—only in our app!
      </p>
    
      <a 
        href="https://expo.dev/artifacts/eas/ttCsDsfrtThQZW84AFJyuf.apk"
        target="_blank"
        rel="noopener noreferrer"
        className="download-btn"
      >
        Download
      </a>
    </div>
    </div>

  <p className="footer-bottom">© 2025 TryFit. All rights reserved.</p>

  <style>{`
    .footer {
      background: #4b39c2b8;
      color: #fff;
      padding: 40px 60px 20px;
      font-family: Arial, sans-serif;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      max-width: 1200px;
      margin: 0 auto;
      text-align: left;
      gap: 90px;
    }

    .footer-section {
      flex: 1;
      margin: 10px 20px;
    }

    .footer-section h3 {
      font-size: 2rem;
      margin-bottom: 15px;
    }

    .footer-section p,
    .footer-section ul li,
    .footer-section a {
      font-size: 1.5rem;
      line-height: 1.6;
    }

    .footer-section p.footer-desc {
      font-size: 1.2rem;
      margin-bottom: 12px;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .quick-links li {
      margin-bottom: 10px;
      cursor: pointer;
      color: #ddd;
      transition: color 0.3s ease, transform 0.2s ease;
    }

    .quick-links li:hover {
      color: #fff;
      transform: translateX(5px);  
    }

    .icon {
      margin-right: 8px;
      color: #000;
    }

    .social-icons {
      margin-top: 15px;
      display: flex;
      gap: 15px;
    }

    .social-icon {
      font-size: 1.5rem;
      color: #fff;
      border-radius: 50%;
      padding: 10px;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .social-icon:hover {
      transform: scale(1.1);
    }

    .facebook { background: #1877F2; }
    .instagram { background: #E4405F; }
    .twitter { background: #000; }

    .footer-bottom {
      margin-top: 30px;
      font-size: 1rem;
      color: #ddd;
      text-align: center;
    }

    .download-btn {
      display: inline-block;      
      background: transparent;
      color: #fff;
      padding: 5px 20px;
      font-size: 1rem;
      border-radius: 8px;
      font-weight: bold;
      text-decoration: none;
      transition: background 0.3s ease, transform 0.2s ease;
      border: 2px solid #fff;
    }

    .download-btn:hover {
      background: #fff;
      color: #4b39c2;
      transform: scale(1.05);
    }

    @media (max-width: 480px) {
      .footer {
        padding: 25px 15px;
      }

      .footer-content {
        flex-direction: column;
        gap: 20px;
        text-align: center;
        align-items: center;
      }

      .footer-section {
        margin: 0;
        width: 100%;
      }

      .footer-section h3 {
        font-size: 1.2rem;
        margin-bottom: 10px;
      }

      .footer-section p,
      .footer-section ul li,
      .footer-section a,
      .footer-section p.footer-desc {
        font-size: 0.95rem;
        text-align: center;
        margin: 4px 0;
      }

      .footer-section ul {
        padding: 0;
        text-align: center;
      }

      .footer-section ul li {
        margin-bottom: 6px;
      }

      .social-icons {
        justify-content: center;
        gap: 10px;
        margin-top: 10px;
      }

      .social-icon {
        width: 36px;
        height: 36px;
        font-size: 1.5rem;
        padding: 8px;
      }

      .footer-bottom {
        font-size: 0.9rem;
        margin-top: 20px;
      }
    }
  `}</style>
</footer>

  );
}
