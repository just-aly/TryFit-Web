import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, getDoc, doc, query, where, Timestamp, onSnapshot } from "firebase/firestore";
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
        activeTab: "Latest", 
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
useEffect(() => {
  // 🔹 Fetch all products in real-time
  const unsubscribeProducts = onSnapshot(
    collection(db, "products"),
    (querySnapshot) => {
      const fetched = [];
      querySnapshot.forEach((docSnap) => {
        const product = docSnap.data();
        const normalized = {
          id: docSnap.id,
          ...product,
          productName: product.productName || product.name || "",
          name: product.name || product.productName || "",
        };

        if (normalized.price) {
          const numericPrice =
            typeof normalized.price === "string"
              ? parseInt(normalized.price.replace(/[^\d]/g, ""))
              : normalized.price;
          if (numericPrice && numericPrice <= 250) {
            fetched.push(normalized);
          }
        }
      });
      setProducts(fetched);
    },
    (error) => {
      console.error("Error fetching products:", error);
    }
  );

  // 🔹 Fetch new arrivals in real-time
  const unsubscribeNewArrivals = onSnapshot(
    collection(db, "products"),
    (querySnapshot) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 31);

      const newProducts = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.createdAt) return;

        const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        if (createdAt >= oneMonthAgo) {
          newProducts.push({
            id: docSnap.id,
            productID: data.productID,
            productName: data.productName,
            price: data.price,
            rating: data.rating,
            sold: data.sold,
            delivery: data.delivery,
            categoryMain: data.categoryMain,
            categorySub: data.categorySub,
            sizes: data.sizes,
            stock: data.stock,
            colors: data.colors,
            imageUrl: data.imageUrl,
            description: data.description,
            createdAt: data.createdAt,
            arUrl: data.arUrl || null,
          });
        }
      });

      setNewArrivals(newProducts);
    },
    (error) => {
      console.error("Error fetching new arrivals:", error);
    }
  );

  // 🔹 Cleanup listeners on unmount
  return () => {
    unsubscribeProducts();
    unsubscribeNewArrivals();
  };
}, []);

  // Improved auto-scroll interval (smooth & loops)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging.current && dragRef.current) {
        const scrollBox = dragRef.current;
        const scrollAmount = 600;
        if (scrollBox.scrollLeft + scrollBox.clientWidth >= scrollBox.scrollWidth - 5) {
          scrollBox.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollBox.scrollBy({ left: scrollAmount, behavior: "smooth" });
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

  // ===== DRAG HANDLERS =====
  const handleMouseDown = (e) => {
    isDragging.current = true;
    if (dragRef.current) dragRef.current.classList.add("dragging");
    startX.current = e.pageX - (dragRef.current?.offsetLeft || 0);
    scrollStart.current = dragRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (dragRef.current) dragRef.current.classList.remove("dragging");
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (dragRef.current) dragRef.current.classList.remove("dragging");
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !dragRef.current) return;
    e.preventDefault();
    const x = e.pageX - dragRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2; // scroll speed
    dragRef.current.scrollLeft = scrollStart.current - walk;
  };

  // ===== MOBILE TOUCH FIX =====
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleMouseDown({
      pageX: touch.pageX,
      preventDefault: () => {},
    });
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMouseMove({
      pageX: touch.pageX,
      preventDefault: () => {},
    });
  };

  const handleTouchEnd = () => handleMouseUp();

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
                      alt={product.productName || product.name || "New Arrival"}
                      className="arrival-img"
                    />
                    <div className="arrival-name-overlay">
                      <span>{product.productName || product.name || "Unnamed Product"}</span>
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
          style={{ cursor: "pointer" }}
        >
          Popular
        </h2>

        <div className="popular-scroll">
          <div className="popular-track">
            {products
              .filter((product) => Number(product.sold || 0) >= 1000)
              .map((product) => (
                <div
                  key={product.id}
                  className="popular-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.imageUrl || PLACEHOLDER_IMAGE}
                    alt={product.name || product.productName || "Popular Product"}
                    className="popular-image"
                  />
                  <p className="popular-name">
                    { (product.productName || product.name)?.length > 16
                      ? (product.productName || product.name).slice(0, 14) + "…"
                      : (product.productName || product.name)
                    }
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
                  alt={product.productName || product.name || "Product"}
                  className="card-img"
                />
                <div className="card-info">
                  <h4>
                    {(product.productName || product.name)?.length > 22
                      ? (product.productName || product.name).slice(0, 20) + "…"
                      : (product.productName || product.name)}
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
        img {
          -webkit-user-drag: none;
          -moz-user-select: none;
          -webkit-user-select: none;
          user-select: none;
        }

        .arrivals-scroll,
        .popular-scroll {
          cursor: grab;
        }

        .arrivals-scroll.dragging,
        .popular-scroll.dragging {
          cursor: grabbing;
        }

        .arrival-item {
          flex: 0 0 auto;
          width: 300px;              
          height: 420px;             
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
          overflow-x: auto;           
          overflow-y: hidden;         
          white-space: nowrap;        
          cursor: grab;
          scroll-behavior: smooth;
          padding: 10px 0;
        }

        .arrivals-track {
          display: flex;              
          gap: 10px;                  
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
          transform: scale(1.05); 
        }

        .arrival-name-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          padding: 8px 12px;
          font-size: 0.7rem;
          font-weight: 500;
          max-width: 85%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Hide scrollbars */
        .arrivals-scroll::-webkit-scrollbar,
        .popular-scroll::-webkit-scrollbar {
          display: none;
        }
        .arrivals-scroll,
        .popular-scroll {
          -ms-overflow-style: none;  
          scrollbar-width: none;     
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
        
     /* ===== Responsive Layout + Smaller Gaps ===== */
@media (max-width: 1280px) {
  .section {
    margin-bottom: 160px; 
  }

  .arrivals-track,
  .popular-track {
    gap: 30px; 
  }

  .card-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
}

@media (max-width: 1024px) {
  .landing-page {
    padding: 50px 6%;
  }

  .section {
    margin-bottom: 140px;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .arrivals-track,
  .popular-track {
    gap: 25px;
  }

  .card-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
}

@media (max-width: 768px) {
  .landing-page {
    padding: 40px 5%;
  }

  .section {
    margin-bottom: 120px;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .arrivals-track,
  .popular-track {
    gap: 18px;
  }

  .arrival-item {
    width: 200px;
    height: 300px;
  }

  .popular-card {
    width: 160px;
    height: 160px;
  }

  .card-container {
    grid-template-columns: repeat(2, 1fr); 
    gap: 20px;
  }

  .card-img {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .landing-page {
    padding: 30px 4%;
  }

  .section {
    margin-bottom: 100px;
  }

  .section-title {
    font-size: 1.4rem;
  }

  .arrivals-track,
  .popular-track {
    gap: 15px;
  }

  .arrival-item {
    width: 160px;
    height: 260px;
  }

  .popular-card {
    width: 130px;
    height: 130px;
  }

  .card-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .card-img {
    height: 180px;
  }
}

      `}</style>
    </div>
  );
}
