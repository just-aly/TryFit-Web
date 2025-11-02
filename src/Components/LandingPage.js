import React, { useEffect, useState, useMemo, useRef } from "react";
import { collection, getDocs, getDoc, doc, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/130x180.png?text=No+Image"; 

export default function LandingPage() {
  // 🔹 States
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bgColor, setBgColor] = useState("lavender");

  // 🔹 Refs
  const newArrivalsRef = useRef(null);
  const popularRef = useRef(null);
  const picksRef = useRef(null);
  const dragRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const handleNewArrivalClick = () => {
    navigate("/categories", {
      state: {
        activeTab: "Latest", // pass "Latest" as active tab
      },
    });
  };
  

  const PopularHeader = () => {
    navigate("/categories", {
      state: {
        activeTab: "Popular", // Set Popular tab active
      },
    });
  };

  // 🔹 Fetch Firestore Data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetched = [];

        querySnapshot.forEach((docSnap) => {
          const product = docSnap.data();
          if (product.price) {
            const numericPrice =
              typeof product.price === "string"
                ? parseInt(product.price.replace(/[^\d]/g, ""))
                : product.price;
            if (numericPrice && numericPrice <= 250) {
              fetched.push({ id: docSnap.id, ...product });
            }
          }
        });
        setProducts(fetched);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchNewArrivals = async () => {
      try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const firestoreDate = Timestamp.fromDate(oneMonthAgo);

        const logsSnapshot = await getDocs(
          query(collection(db, "recentActivityLogs"), where("timestamp", ">=", firestoreDate))
        );

        const uniqueProductIds = new Set();
        logsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.productId) uniqueProductIds.add(data.productId);
        });

        const newProducts = [];
        for (const id of uniqueProductIds) {
          const prodRef = doc(db, "products", id);
          const prodSnap = await getDoc(prodRef);
          if (prodSnap.exists()) {
            const data = prodSnap.data();
            newProducts.push({ id, ...data });
          }
        }

        setNewArrivals(newProducts);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      }
    };

    fetchProducts();
    fetchNewArrivals();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging.current && dragRef.current) {
        dragRef.current.scrollLeft += 600;
        // Loop back to start when reaching the end
        if (
          dragRef.current.scrollLeft + dragRef.current.clientWidth >=
          dragRef.current.scrollWidth
        ) {
          dragRef.current.scrollLeft = 0;
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Background Color Transition
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

  const handleMouseDown = (e) => {
      isDragging.current = true;
      dragRef.current.classList.add("dragging");
      startX.current = e.pageX - dragRef.current.offsetLeft;
      scrollStart.current = dragRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      dragRef.current.classList.remove("dragging");
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      dragRef.current.classList.remove("dragging");
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - dragRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.2; // scroll speed
      dragRef.current.scrollLeft = scrollStart.current - walk;
    };

  // Mobile touch
  const handleTouchStart = (e) => handleMouseDown(e.touches[0]);
  const handleTouchMove = (e) => handleMouseMove(e.touches[0]);
  const handleTouchEnd = () => handleMouseUp();


  const popularItems = [1, 2, 3, 4, 5, 6];
  const popularIndex = 0;
  const prevSlide = () => {};
  const nextSlide = () => {};

  return (
    <div className={`landing-page ${bgColor}`}>
      <div className="bg-overlay"></div>

    {/* ===== NEW ARRIVALS ===== */}
      <section ref={newArrivalsRef} className="section new-arrivals">
        <h2
          className="section-title"
          onClick={handleNewArrivalClick}
          style={{ cursor: "pointer" }}
        >
          New Arrivals
        </h2>

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
          <div className="arrivals-track">
            {newArrivals.length > 0 ? (
              newArrivals.map((product) => (
                <div
                  key={product.id}
                  className="arrival-item"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="arrival-img-wrapper">
                    <img
                      src={product.imageUrl || PLACEHOLDER_IMAGE}
                      alt={product.name || "New Arrival"}
                      className="arrival-img"
                    />
                    <div className="arrival-name-overlay">
                      <span>{product.name || "Unnamed Product"}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Loading new arrivals...</p>
            )}
          </div>
        </div>
      </section>



     {/* ===== POPULAR ===== */}
      <section ref={popularRef} className="section popular">
        <h2
      className="section-title"
      onClick={PopularHeader}
      style={{ cursor: "pointer" }} >
      Popular
    </h2>

        <div className="popular-scroll">
          <div className="popular-track">
            {products
              .filter((product) => product.sold >= 1000)
              .map((product) => (
                <div
                  key={product.id}
                  className="popular-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.imageUrl || PLACEHOLDER_IMAGE}
                    alt={product.name || "Popular Product"}
                    className="popular-image"
                  />
                  <p className="popular-name">
                    {product.name?.length > 16
                      ? product.name.slice(0, 14) + "…"
                      : product.name}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>


     {/* ===== OUR PICKS FOR YOU ===== */}
    <section ref={picksRef} className="section picks">
      <h2 className="section-title">Our Picks for You</h2>

      <div className="card-container">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <img
                src={product.imageUrl || PLACEHOLDER_IMAGE}
                alt={product.name || "Product"}
                className="card-img"
              />
              <div className="card-info">
                <h4>
                  {product.name?.length > 22
                    ? product.name.slice(0, 20) + "…"
                    : product.name}
                </h4>
                <p className="price">
                  ₱
                  {product.price
                    ? Number(product.price).toLocaleString()
                    : "N/A"}
                </p>
                <p className="details">
                  ⭐ {product.rating || "N/A"} | {product.sold || 0} Sold
                </p>
                <p className="days">
                  🚚 {product.delivery || "Delivery info not available"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>Loading products...</p>
        )}
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
      /* New Arrival */

       .arrival-item {
          flex: 0 0 auto;
          width: 300px;              /* 🔹 was 250px — bigger width */
          height: 420px;             /* 🔹 was 350px — taller card */
          border-radius: 18px;       /* smoother corners */
          overflow: hidden;
          background: #fff;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
          position: relative;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .arrival-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
        }
          .arrivals-scroll {
          overflow-x: auto;           /* allow sideways scrolling */
          overflow-y: hidden;         /* hide vertical overflow */
          white-space: nowrap;        /* keep children in one line */
          cursor: grab;
          scroll-behavior: smooth;
          padding: 10px 0;
        }

        .arrivals-track {
          display: flex;              /* 🔥 this makes items line up horizontally */
          gap: 20px;                  /* space between items */
        }


        .arrival-img-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .arrival-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .arrival-item:hover .arrival-img {
          transform: scale(1.05); /* 🔹 subtle zoom on hover */
        }

        .arrival-name-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          max-width: 85%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


       /* ===== POPULAR ===== */
        .popular {
          text-align: left;
        }

        .popular-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          cursor: grab;
          padding: 20px 0;
        }

        .popular-scroll:active {
          cursor: grabbing;
        }

        .popular-track {
          display: flex;
          gap: 45px;
          width: max-content;
          align-items: center;
          padding: 10px;
        }

        /* 🔹 Circle Product Card */
        .popular-card {
          flex: 0 0 auto;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
          position: relative;
          text-align: center;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .popular-card:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
        }

        /* 🔹 Product Image inside the circle */
        .popular-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          transition: transform 0.4s ease;
        }

        .popular-card:hover .popular-image {
          transform: scale(1.05);
        }

        /* 🔹 Product Name below the circle */
        .popular-name {
          font-weight: 600;
          font-size: 1rem;
          color: #333;
          margin-top: 12px;
          text-align: center;
        }


        .card-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 35px;
        }

        .card {
          background: rgba(255, 255, 255, 0.65);
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
          cursor: pointer;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .card-img {
          height: 260px;
          width: 100%;
          object-fit: cover;
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

        .details,
        .days {
          font-size: 0.9rem;
          color: #555;
        }

      `}</style>
    </div>
  );
}
