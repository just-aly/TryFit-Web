import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function AboutUs() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: "easeOut" },
    });
  }, [controls]);

  return (
    <div className="about-page">
      {/* ===== Section 1: Welcome ===== */}
      <motion.section
        className="welcome-section"
        initial={{ opacity: 0, y: 30 }}
        animate={controls}
      >
        <div className="welcome-text">
          <h1>Welcome to <span>TryFit</span></h1>
          <p>
            Discover outfit inspirations that match your style. Explore trends
            and bring your fashion ideas to life. Download the app to try
            outfits in AR and shop instantly!
          </p>
        </div>

        <div className="welcome-images">
          <img src="https://via.placeholder.com/140x300" alt="App preview 1" />
          <img src="https://via.placeholder.com/140x300" alt="App preview 2" />
          <img src="https://via.placeholder.com/140x300" alt="App preview 3" />
        </div>
      </motion.section>

      {/* ===== Section 2: About Us ===== */}
      <motion.section
        className="about-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <div className="about-content">
          <h2>ABOUT<br />US</h2>
          <p>
            Our platform is designed to help you discover outfit inspirations
            that match your unique aesthetic. Whether you love Y2K, coquette, or
            minimalist fashion, we bring together the best styles to spark your
            creativity.
          </p>
          <h4>
            We believe fashion is more than just clothing—
            <br />it’s a way to express yourself.
          </h4>
        </div>
      </motion.section>

      {/* ===== Section 3: Vision ===== */}
      <motion.section
        className="vision-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <h2>OUR VISION</h2>
        <p>
          We’re shaping the future of fashion by blending creativity with
          technology. Our goal is to make style discovery more interactive,
          accessible, and fun for everyone.
        </p>
      </motion.section>

      {/* ===== Section 4: Join Us ===== */}
      <motion.section
        className="join-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <div className="join-text">
          <p>
            Be part of our growing fashion community! Follow us on social media
            for the latest outfit trends, styling tips, and exclusive updates.
            Ready to bring your dream outfits to life?
          </p>
          <p className="highlight">
            Download the app today and start exploring!
          </p>
        </div>
        <div className="join-image">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
            alt="Team collaboration"
          />
        </div>
      </motion.section>

      {/* ===== Final CTA ===== */}
      <motion.div
        className="cta-banner"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2>JOIN US!</h2>
      </motion.div>

      <style>{`
        .about-page {
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        /* ===== Welcome Section ===== */
        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 150px 10%;
          background: linear-gradient(to bottom, #e8e1ff, #f3f0ff);
          flex-wrap: wrap;
        }

        .welcome-text {
          flex: 1;
          min-width: 320px;
        }

        .welcome-text h1 {
          font-size: 2.8rem;
          color: #1c143a;
          margin-bottom: 20px;
        }

        .welcome-text span {
          color: #6a5acd;
        }

        .welcome-text p {
          font-size: 1.1rem;
          color: #1e1e1e;
          line-height: 1.6;
        }

        .welcome-images {
          flex: 1;
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .welcome-images img {
          border-radius: 15px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          transition: transform 0.3s ease;
        }

        .welcome-images img:hover {
          transform: translateY(-10px);
        }

        /* ===== About Section ===== */
        .about-section {
          background: #6a5acd;
          color: white;
          padding: 120px 10%;
          text-align: left;
        }

        .about-content h2 {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: 2px;
          line-height: 1;
        }

        .about-content p {
          margin-top: 30px;
          font-size: 1.1rem;
          max-width: 600px;
          line-height: 1.7;
        }

        .about-content h4 {
          margin-top: 40px;
          font-weight: 500;
          font-size: 1.2rem;
        }

        /* ===== Vision Section ===== */
        .vision-section {
          background: #7c7691;
          text-align: center;
          color: white;
          padding: 100px 15%;
        }

        .vision-section h2 {
          font-size: 2.4rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .vision-section p {
          font-size: 1.1rem;
          color: #f0f0f0;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ===== Join Section ===== */
        .join-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 100px 10%;
          background: #f2f0f5;
          flex-wrap: wrap;
        }

        .join-text {
          flex: 1;
          min-width: 300px;
        }

        .join-text p {
          font-size: 1rem;
          color: #222;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .join-text .highlight {
          color: #d220ff;
          font-weight: 600;
        }

        .join-image {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .join-image img {
          border-radius: 10px;
          width: 400px;
          height: auto;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        /* ===== CTA Banner ===== */
        .cta-banner {
          background: #6a5acd;
          text-align: center;
          color: white;
          padding: 60px 0;
        }

        .cta-banner h2 {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 2px;
        }

        @media (max-width: 900px) {
          .welcome-section,
          .join-section {
            flex-direction: column;
            text-align: center;
          }
          .welcome-images,
          .join-image {
            margin-top: 30px;
          }
        }
      `}</style>
    </div>
  );
}
