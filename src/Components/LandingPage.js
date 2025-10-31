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

  // Background color change on scroll
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

  const popularItems = Array(10).fill(0);

  const nextSlide = () => {
    if (popularIndex < popularItems.length - 4)
      setPopularIndex(popularIndex + 1);
  };

  const prevSlide = () => {
    if (popularIndex > 0) setPopularIndex(popularIndex - 1);
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - dragRef.current.offsetLeft;
    scrollStart.current = dragRef.current.scrollLeft;
  };
  const handleMouseUp = () => (isDragging.current = false);
  const handleMouseLeave = () => (isDragging.current = false);
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
  const handleTouchEnd = () => (isDragging.current = false);
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
        <h2 className="section-title">Popular</h2>
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

      {/* ===== OUR PICKS ===== */}
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

      {/* ===== STYLES ===== */}
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; }

        .landing-page {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          padding: 100px 8% 60px;
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
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(0,0,0,0.05));
          mix-blend-mode: soft-light;
          opacity: 0.6;
          z-index: 0;
        }

        .section { margin-bottom: 220px; position: relative; z-index: 1; }
        .section-title {
          font-size: 2rem;
          font-weight: 600;
          text-align: left;
          margin: 60px 0 40px;
        }

        .placeholder {
          background: #bcbcbc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        /* NEW ARRIVALS */
        .arrivals-scroll {
          overflow: hidden;
          width: 100%;
          cursor: grab;
        }
        .arrivals-scroll:active { cursor: grabbing; }

        .arrivals-track {
          display: flex;
          gap: 12px;
          width: max-content;
          transition: transform 1s ease-in-out;
        }

        .arrival-item {
          flex: 0 0 45%;
          height: 620px;
          font-size: 1.8rem;
          font-weight: 500;
        }

        /* POPULAR */
        .popular { text-align: left; }
        .slider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          flex-wrap: nowrap; /* ✅ stays one line */
          overflow-x: auto;
        }

        .circle-container {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: nowrap; /* ✅ prevent wrapping */
        }

        .circle {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .circle:hover { transform: scale(1.1); }

        .arrow {
          background: transparent;
          border: none;
          font-size: 2.5rem;
          cursor: pointer;
          color: #444;
        }

        /* OUR PICKS */
        .picks { text-align: left; }
        .card-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 35px;
        }

        .card {
          background: rgba(255,255,255,0.65);
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .card-img { 
          height: 260px; 
          width: 100%; 
        }

        .card-info { 
          padding: 18px; 
        }

        .price { 
          color: #5a3ec8; 
          font-weight: bold; 
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 768px) {
          .landing-page { padding: 80px 6%; }
          .section { margin-bottom: 140px; }

          .section-title {
            font-size: 1.4rem;
            margin: 30px 0 25px;
          }

          .arrival-item {
            flex: 0 0 48%;
            width: 50px;
            height: 350px;
            font-size: 1.2rem;
          }

          .circle {
            width: 110px;
            height: 110px;
          }

          .circle-container {
            gap: 20px;
          }

          .card-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
          }
        }

        @media (max-width: 480px) {
          .landing-page { padding: 60px 5%; }
          .section-title {
            font-size: 1.1rem;
          }
          .arrival-item {
            height: 340px;
          }
          .circle {
            width: 110px;
            height: 110px;
          }
        }
      `}</style>
    </div>
  );
}
