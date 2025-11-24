export default function TermsOfService() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="title-wrapper">
          <span className="line"></span>
          <h1 className="terms-title">Terms of Service</h1>
          <span className="line"></span>
        </div>

        <p className="terms-intro">
          These Terms of Service govern your use of our website and app. By
          accessing or using our services, you agree to these Terms. If you do
          not agree, please do not use our website or app.
        </p>

        <section>
          <h2>1. Use of Our Services</h2>
          <p>
            Vadette provides outfit inspirations and fashion-related content.
            The website is for browsing only. To access AR try-on and purchase
            features, you must download the Vadette app. You must be at least 13
            years old to use our services.
          </p>
        </section>

        <section>
          <h2>2. Intellectual Property</h2>
          <p>
            Some images are sourced from non-copyrighted websites, while others
            belong to Vadette. You may not copy, modify, or use our content
            without permission.
          </p>
        </section>

        <section>
          <h2>3. User Submissions</h2>
          <p>
            If you submit inquiries via our contact form, you agree to provide a
            valid email address. Your email is used only for responding to your
            concern (see our Privacy Policy for details).
          </p>
        </section>

        <section>
          <h2>4. Limitation of Liability</h2>
          <p>
            Our website provides fashion inspiration and does not guarantee
            product availability. We are not liable for any inaccuracies,
            third-party content, or external links.
          </p>
        </section>

        <section>
          <h2>5. Privacy Policy</h2>
          <p>
            Since we collect emails for inquiries, our Privacy Policy explains
            how we handle your data. By using our website, you agree to the
            terms outlined in our Privacy Policy.
          </p>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>
            If you have questions about these Terms, please contact us at{" "}
            <a href="mailto:tryfit@gmail.com">tryfitar@gmail.com</a>.
          </p>
        </section>

        <p className="last-updated">
          Last Updated: <strong>April 2, 2025</strong>
        </p>
      </div>

      <style>{`
        .terms-page {
          background: linear-gradient(to bottom, #e8e1ff, #f3f0ff);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 160px 20px 80px;
          box-sizing: border-box;
        }

        .terms-container {
          background: #f7f5ff;
          border-radius: 8px;
          padding: 60px 70px;
          max-width: 820px;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          color: #1a1a1a;
          font-family: 'Poppins', sans-serif;
        }

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
          max-width: 300px;
        }

        .terms-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #27233a;
          margin: 0;
          white-space: nowrap;
        }

        .terms-intro {
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
          .terms-container {
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
