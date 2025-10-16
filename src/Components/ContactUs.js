import { FaFacebook, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function ContactUs() {
  return (
    <div className="contact-container">
      {/* LEFT SECTION */}
      <div className="contact-left">
        <h1>Contact Us</h1>

        <div className="contact-box">
          <h2 className="section-title">Location</h2>
          <p className="location">
            <FaMapMarkerAlt className="icon" />
            San Isidro Campus, Brgy. San Isidro.<br />
            Tarlac City<br />
            2300 Tarlac.
          </p>

          <h2 className="section-title">Contacts</h2>
          <p className="contact-item">
            <FaEnvelope className="icon" />
            tryfit@gmail.com
          </p>
          <p className="contact-item">
            <FaPhone className="icon" />
            09123456789
          </p>

          <div className="social-icons">
            <FaFacebook className="fb" />
            <FaInstagram className="ig" />
            <FaXTwitter className="x" />
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="contact-form">
        <h2 className="form-title">CONTACT FORM</h2>

        <form>
          <label htmlFor="name">Name:</label>
          <input id="name" type="text" placeholder="Enter your name" />

          <label htmlFor="email">Email Address:</label>
          <input id="email" type="email" placeholder="Enter your email address" />

          <label htmlFor="message">Message:</label>
          <textarea id="message" rows="4" placeholder="Type your message..."></textarea>

          <button type="submit">SEND MESSAGE</button>
        </form>
      </div>

      <style>{`
        .contact-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 60px;
          padding: 200px 0;
          min-height: 55vh;
          background: linear-gradient(to bottom, #e5d9f2, #d8c7ef);
          font-family: Arial, sans-serif;
          color: #333;
        }

        .contact-left {
          flex: 1;
          max-width: 400px;
        }

        .contact-left h1 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 30px;
        }

        .contact-box {
          border-left: 4px solid #e9408b;
          padding-left: 20px;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: #d63384;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        .location, .contact-item {
          font-size: 0.95rem;
          color: #333;
          margin-bottom: 10px;
          display: flex;
          align-items: start;
          gap: 10px;
        }

        .icon {
          color: #d63384;
          margin-top: 4px;
        }

        .social-icons {
          display: flex;
          gap: 15px;
          margin-top: 25px;
        }

        .social-icons .fb { color: #1877F2; font-size: 28px; cursor: pointer; }
        .social-icons .ig { color: #E4405F; font-size: 28px; cursor: pointer; }
        .social-icons .x { color: #000; font-size: 28px; cursor: pointer; }
        .social-icons svg:hover { opacity: 0.8; }

        .contact-form {
          flex: 1;
          max-width: 400px;
          background: #fff;
          border-radius: 20px;
          padding: 30px 35px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .form-title {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        .contact-form form {
          display: flex;
          flex-direction: column;
        }

        .contact-form label {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .contact-form input,
        .contact-form textarea {
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 8px 10px;
          margin-bottom: 16px;
          font-size: 0.9rem;
          width: 100%;
        }

        .contact-form input:focus,
        .contact-form textarea:focus {
          outline: none;
          border-color: #7B5CD6;
          box-shadow: 0 0 0 2px rgba(123, 92, 214, 0.2);
        }

        .contact-form button {
          background: #7B5CD6;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          padding: 10px;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }

        .contact-form button:hover {
          background: #6a49c4;
        }

        @media (max-width: 900px) {
          .contact-container {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .contact-box {
            border-left: none;
            border-top: 4px solid #e9408b;
            padding-left: 0;
            padding-top: 15px;
          }

          .location, .contact-item {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
