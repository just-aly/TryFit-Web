import { useEffect, useRef, useState } from "react";
import image4 from "../images/measurement.jpg";
import image1 from "../images/step1.jpg";
import image2 from "../images/step2.jpg";
import image3 from "../images/step3.jpg";
import image5 from "../images/tracking.jpg";

export default function AboutUs() {
  const [index, setIndex] = useState(1);
  const trackRef = useRef(null);
  const aboutRef = useRef(null);

  const images = [image1, image2, image3, image4, image5];

  const slides = [images[images.length - 1], ...images, images[0]];

  useEffect(() => {
    const interval = setInterval(() => slideTo(index + 1), 4000);
    return () => clearInterval(interval);
  }, [index]);

  const slideTo = (newIndex) => {
    if (!trackRef.current) return;
    setIndex(newIndex);
    trackRef.current.style.transition = "transform 1s ease-in-out";
    trackRef.current.style.transform = `translateX(-${newIndex * 20}%)`;
  };

  const handleTransitionEnd = () => {
    if (index === slides.length - 1) {
      trackRef.current.style.transition = "none";
      setIndex(1);
      trackRef.current.style.transform = `translateX(-20%)`;
    } else if (index === 0) {
      trackRef.current.style.transition = "none";
      setIndex(slides.length - 2);
      trackRef.current.style.transform = `translateX(-${
        (slides.length - 2) * 20
      }%)`;
    }
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page">
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
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((src, i) => (
              <div className="item" key={i}>
                <img src={src} alt={`Slide ${i}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="scroll-down" onClick={scrollToAbout}>
          <span className="explore-text">Explore</span>
          <span className="arrow-down">▼</span>
        </div>
      </section>

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

        
        .welcome {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 250px 8% 80px;
          background: linear-gradient(to bottom, #e8e1ff, #f3f0ff);
          gap: 30px;
          flex-wrap: wrap;
          position: relative;
        }

        .text {
          flex: 1;
          min-width: 220px;
          max-width: 450px;
        }

        .text h1 {
          font-size: 2.5rem;
          color: #1c143a;
          margin-bottom: 14px;
        }

        .text span {
          color: #6a5acd;
        }

        .text p {
          font-size: 1rem;
          line-height: 1.5;
        }

        .phones {
          flex: 1;
          display: flex;
          justify-content: center;
          overflow: hidden;
          max-width: 700px;
          position: relative;
        }

        .track {
          display: flex;
          width: 100%;
          gap: 15px; 
        }

        .item {
          flex: 0 0 20%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .item img {
          width: 250px;
          height: 400px; 
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(28, 20, 58, 0.2);
          object-fit: cover;
        }

        .scroll-down {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6a5acd;
          cursor: pointer;
          animation: bounce 1.5s infinite;
        }

        .arrow-down {
          font-size: 1.5em;
        }

        .explore-text {
          font-size: 1.1em;
          font-weight: 500;
          color: #6a5acd;
        }

        @keyframes bounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, 6px); }
        }

        
        .about, .mission {
          background: linear-gradient(135deg, #6a5acd 0%, #8e80ff 100%);
          color: #fff;
          padding: 100px 5%;
        }

        .cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          align-items: start;
          max-width: 900px;
          margin: 0 auto;
        }

        .left h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
        }

        .right p {
          font-size: 0.95rem;
          line-height: 1.5;
        }

        
        .join {
          background: #ffffff;
          color: #222;
          padding: 100px 5%;
          text-align: center;
        }

        .join h2 {
          font-size: 1.8rem;
          color: #6a5acd;
          margin-bottom: 16px;
        }

        .highlight {
          color: #d220ff;
          font-weight: 600;
        }

        
        @media (max-width: 900px) {
          .cols {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .left h2 {
            font-size: 2.2rem;
          }

          .item img {
            width: 200px;
            height: 320px;
          }
        }

        @media (max-width: 480px) {
          .welcome {
            padding: 150px 5% 60px;
            gap: 15px;
          }

          .text h1 {
            font-size: 1.8rem;
          }

          .text p {
            font-size: 0.9rem;
          }

          .phones {
            max-width: 220px;
          }

          .item img {
            width: 140px;
            height: 220px;
          }

          .scroll-down {
            gap: 5px;
            bottom: 8px;
          }

          .explore-text {
            font-size: 0.9em;
            text-align: center;
          }

          .left h2 {
            font-size: 1.8rem;
          }

          .right p {
            font-size: 0.9rem;
          }

          .join h2 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}
