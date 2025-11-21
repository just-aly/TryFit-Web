import React from "react";

export default function PrivacyAndPolicy() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="title-wrapper">
          <span className="line"></span>
          <h1 className="privacy-title">Privacy Policy</h1>
          <span className="line"></span>
        </div>

        <p className="privacy-intro">
          Your privacy is important to us. This Privacy Policy explains how
          Vadette collects, uses, and protects any personal information you
          provide.
        </p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            <strong>Email Address:</strong> Collected when you submit an inquiry
            via our contact form.
          </p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To respond to your inquiries and provide support.</li>
            <li>We do not share, sell, or store emails for marketing purposes.</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Protection</h2>
          <ul>
            <li>
              Your email is only used for responding to your concern and is not
              stored long-term.
            </li>
            <li>We take reasonable steps to secure the data we collect.</li>
          </ul>
        </section>

        <section>
          <h2>4. Contact Us</h2>
          <p>
            If you have questions about these Privacy Controls, please contact
            us at{" "}
            <a href="mailto:tryfit@gmail.com">tryfitar@gmail.com</a>.
          </p>
        </section>

        <p className="last-updated">
          Last Updated: <strong>April 2, 2025</strong>
        </p>
      </div>

      <style>{`
        .privacy-page {
          background: linear-gradient(to bottom, #e8e1ff, #f3f0ff);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 160px 20px 80px;
          box-sizing: border-box;
        }

        .privacy-container {
          background: #f7f5ff;
          border-radius: 8px;
          padding: 60px 70px;
          max-width: 820px;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          color: #1a1a1a;
          font-family: 'Poppins', sans-serif;
        }

        /* Title with centered black lines */
        .title-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .line {
          flex: 1;
          height: 1.5px;
          background-color: #000;
          max-width: 120px;
        }

        .privacy-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #27233a;
          margin: 0;
          white-space: nowrap;
        }

        .privacy-intro {
          text-align: center;
          font-size: 0.95rem;
          color: #2e2e2e;
          line-height: 1.7;
          margin-bottom: 40px;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
        }

        section {
          margin-bottom: 30px;
        }

        section h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 10px;
        }

        section p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #333;
          margin-left: 15px;
        }

        ul {
          margin-left: 35px;
          color: #333;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        a {
          color: #c22eff;
          font-weight: 600;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        .last-updated {
          margin-top: 40px;
          text-align: right;
          font-size: 0.9rem;
          color: #222;
        }

        @media (max-width: 768px) {
          .privacy-container {
            padding: 40px 25px;
          }

          .title-wrapper {
            flex-direction: column;
            gap: 5px;
          }

          .line {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
