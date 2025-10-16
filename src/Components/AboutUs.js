import React, { useEffect, useState, useRef } from "react";

export default function AboutUs() {
  const [imageSet, setImageSet] = useState(0);
  const aboutRef = useRef(null);

  // Phone placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setImageSet((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll down to About section
  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page">
      {/* ===== WELCOME ===== */}
      <section className="welcome">
        <div className="text">
          <h1>
            Welcome to <span>TryFit</span>
          </h1>
          <p>
            Discover outfit inspirations that match your style. Explore trends
            and bring your fashion ideas to life. Download the app to try
            outfits in AR and shop instantly!
          </p>
        </div>

        <div className="phones">
          <div
            className="track"
            style={{
              transform: `translateX(-${imageSet * 25}%)`,
              transition: "transform 1.5s ease-in-out",
            }}
          >
            {[
              "https://via.placeholder.com/300x640?text=Phone+1",
              "https://via.placeholder.com/300x640?text=Phone+2",
              "https://via.placeholder.com/300x640?text=Phone+3",
              "https://via.placeholder.com/300x640?text=Phone+4",
            ].map((src, i) => (
              <div className="item" key={i}>
                <img src={src} alt={`Phone ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Explore + Arrow side by side */}
        <div className="scroll-down" onClick={scrollToAbout}>
          <span className="explore-text">Explore</span>
          <span className="arrow-down">▼</span>
        </div>
      </section>

      {/* ===== ABOUT US ===== */}
      <section className="about" ref={aboutRef}>
        <div className="cols">
          <div className="left">
            <h2>About&nbsp;Us</h2>
          </div>
          <div className="right">
            <p>
              TryFit is built to help people express their creativity through
              outfits. We curate fashion looks inspired by diverse aesthetics —
              from minimalist to streetwear — giving users a place to explore
              and define their style identity.
            </p>
          </div>
        </div>
      </section>

      {/* ===== OUR MISSION ===== */}
      <section className="mission">
        <div className="cols">
          <div className="left">
            <h2>Our&nbsp;Mission</h2>
          </div>
          <div className="right">
            <p>
              Our mission is to make style discovery seamless and fun. Through
              technology and community, we connect people who love fashion,
              helping them try, share, and grow together in one inspiring
              platform.
            </p>
          </div>
        </div>
      </section>

      {/* ===== JOIN US ===== */}
      <section className="join">
        <h2>Join&nbsp;Us</h2>
        <p>
          Become part of our growing creative family. Follow us on social media
          for trends, looks, and fashion inspiration.
        </p>
        <p className="highlight">Download TryFit and start styling today!</p>
      </section>

      <style>{`
        .page {
          font-family: "Poppins", sans-serif;
          color: #1c143a;
          overflow-x: hidden;
        }

        /* ===== WELCOME ===== */
        .welcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 430px 10% 160px;
          background: linear-gradient(to bottom, #e8e1ff, #f3f0ff);
          gap: 40px;
          flex-wrap: wrap;
          position: relative;
        }

        .text {
          flex: 1;
          min-width: 260px;
          max-width: 480px;
          margin-top: 80px;
        }

        .text h1 {
          font-size: 3rem;
          color: #1c143a;
          margin-bottom: 16px;
        }

        .text span {
          color: #6a5acd;
        }

        .phones {
          flex: 1;
          display: flex;
          justify-content: center;
          overflow: hidden;
          max-width: 360px;
          position: relative;
        }

        .track {
          display: flex;
          width: 400%;
          gap: 20px;
        }

        .item {
          flex: 0 0 25%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .item img {
          width: 220px;
          max-height: 420px;
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(28, 20, 58, 0.18);
        }

        arrow-down {
          font-size: 2em;
        }
      
        .scroll-down {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          color: #6a5acd;
          cursor: pointer;
          animation: bounce 1.5s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, 10px); }
        }

        .explore-text {
          font-size: 1.6em;
          font-weight: 500;
          color: #6a5acd;
        }

        /* ===== ABOUT / MISSION ===== */
        .about, .mission {
          background: linear-gradient(135deg, #6a5acd 0%, #8e80ff 100%);
          color: #fff;
          padding: 160px 10%;
        }

        .cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
          max-width: 1100px;
          margin: 0 auto;
        }

        .left h2 {
          font-size: 4rem;
          font-weight: 700;
          margin: 0;
        }

        .right p {
          font-size: 1.1rem;
          line-height: 1.8;
        }

        /* ===== JOIN US ===== */
        .join {
          background: #ffffff;
          color: #222;
          padding: 160px 10%;
          text-align: center;
        }

        .join h2 {
          font-size: 2.6rem;
          color: #6a5acd;
          margin-bottom: 20px;
        }

        .highlight {
          color: #d220ff;
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .cols {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .left h2 {
            font-size: 3rem;
          }

          .item img {
            width: 180px;
          }

          .scroll-down {
            bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
