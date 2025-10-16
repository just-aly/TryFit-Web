import React, { useEffect, useState, useRef } from "react";

export default function LandingPage() {
  const [scrollX, setScrollX] = useState(0);
  const [popularIndex, setPopularIndex] = useState(0);
  const [bgColor, setBgColor] = useState("lavender");

  const newArrivalsRef = useRef(null);
  const popularRef = useRef(null);
  const picksRef = useRef(null);
  const dragRef = useRef(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging.current) {
        setScrollX((prev) => (prev + 600) % 2400);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Background color changes upon scroll down
  useEffect(() => {
    const handleScroll = () => {
      const newArrivalsTop = newArrivalsRef.current?.offsetTop || 0;
      const popularTop = popularRef.current?.offsetTop || 0;
      const picksTop = picksRef.current?.offsetTop || 0;
      const scrollY = window.scrollY + window.innerHeight / 2;

      if (scrollY >= picksTop) setBgColor("violetBlue");
      else if (scrollY >= popularTop) setBgColor("purplePink");
      else setBgColor("lavender");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Popular section
  const popularItems = Array(10).fill(0);

  const nextSlide = () => {
    if (popularIndex < popularItems.length - 4)
      setPopularIndex(popularIndex + 1);
  };

  const prevSlide = () => {
    if (popularIndex > 0) setPopularIndex(popularIndex - 1);
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - dragRef.current.offsetLeft;
    scrollStart.current = dragRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - dragRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    dragRef.current.scrollLeft = scrollStart.current - walk;
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    startX.current = e.touches[0].pageX - dragRef.current.offsetLeft;
    scrollStart.current = dragRef.current.scrollLeft;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const x = e.touches[0].pageX - dragRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    dragRef.current.scrollLeft = scrollStart.current - walk;
  };

  return (
    <div className={`landing-page ${bgColor}`}>
      <div className="bg-overlay"></div>

      {/* ===== NEW ARRIVALS ===== */}
      <section ref={newArrivalsRef} className="section new-arrivals">
        <h2 className="section-title">New Arrivals</h2>
        <div
          className="arrivals-scroll"
          ref={dragRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          <div
            className="arrivals-track"
            style={{ transform: `translateX(-${scrollX}px)` }}
          >
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="arrival-item placeholder">
                  <h3>Item {i + 1}</h3>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR ===== */}
      <section ref={popularRef} className="section popular">
        <h2 className="section-title align-left">Popular</h2>
        <div className="slider">
          <button className="arrow" onClick={prevSlide}>
            &#8249;
          </button>
          <div className="circle-container">
            {popularItems
              .slice(popularIndex, popularIndex + 4)
              .map((_, i) => (
                <div key={i} className="circle placeholder"></div>
              ))}
          </div>
          <button className="arrow" onClick={nextSlide}>
            &#8250;
          </button>
        </div>
      </section>

      {/* ===== OUR PICKS FOR YOU ===== */}
      <section ref={picksRef} className="section picks">
        <h2 className="section-title">Our Picks for You</h2>
        <div className="card-container">
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <div key={i} className="card">
              <div className="card-img placeholder"></div>
              <div className="card-info">
                <h4>Sample Product Name</h4>
                <p className="price">₱{(i + 1) * 100}</p>
                <p className="details">⭐ 4.8 | 3.7K Sold</p>
                <p className="days">🚚 3–5 Days</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        * { box-sizing: border-box; }

        body, html { margin: 0; padding: 0; overflow-x: hidden; }

        .landing-page {
          position: relative;
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          color: #111;
          padding: 60px 8%;
          transition: background 1.5s ease-in-out;
        }

        .landing-page.lavender {
          background: linear-gradient(to bottom right, #e9e4f0, #d3cce3);
        }
        .landing-page.purplePink {
          background: linear-gradient(to bottom right, #b19cd9, #f7c6ff);
        }
        .landing-page.violetBlue {
          background: linear-gradient(to bottom right, #a18cd1, #fbc2eb);
        }

        .bg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(0,0,0,0.05));
          mix-blend-mode: soft-light;
          opacity: 0.6;
          transition: opacity 1.5s ease-in-out;
          z-index: 0;
        }

        .section {
          margin-bottom: 220px;
          position: relative;
          z-index: 1;
        }

        .section-title {
          font-size: 2rem;
          margin-top: 100px;
        }

        .align-left { text-align: left; }

        .placeholder {
          background: #bcbcbc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        /* ===== NEW ARRIVALS ===== */
        .arrivals-scroll {
          overflow: hidden;
          width: 100%;
          cursor: grab;
        }
        .arrivals-scroll:active { cursor: grabbing; }

        .arrivals-track {
          display: flex;
          gap: 5px;
          width: max-content;
          transition: transform 1s ease-in-out;
        }

        .arrival-item {
          flex: 0 0 48%;
          height: 570px;
          min-width: 60%;
          font-size: 1.8rem;
          font-weight: 500;
        }

        /* ===== POPULAR ===== */
        .popular { text-align: left; }

        .slider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
        }

        .circle-container {
          display: flex;
          gap: 60px;
          transition: all 0.4s ease;
        }

        .circle {
          width: 240px;
          height: 240px;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .circle:hover { transform: scale(1.15); }

        .arrow {
          background: transparent;
          border: none;
          font-size: 3rem;
          cursor: pointer;
          color: #444;
          transition: 0.3s ease;
        }

        .arrow:hover { color: #000; }

        /* ===== OUR PICKS ===== */
        .picks { text-align: left; }

        .card-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 35px;
        }

        .card {
          background: rgba(255, 255, 255, 0.65);
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }

        .card:hover { 
          transform: translateY(-5px);
        }

        .card-img { 
          height: 260px; 
          width: 100%; 
        }

        .card-info { 
          padding: 18px; 
          }

        .card-info h4 { 
          margin: 0 0 10px; 
        }

        .price {
          color: #5a3ec8;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .details, .days { 
          font-size: 0.9rem; 
          color: #555; 
          }
      `}</style>
    </div>
  );
}
