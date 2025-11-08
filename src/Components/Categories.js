import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";


export default function Categories() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("T-Shirts");
  const [activeTab, setActiveTab] = useState("Category");

  const [allProducts, setAllProducts] = useState([]); 
  const [categoryProducts, setCategoryProducts] = useState([]);
  const navigate = useNavigate();  
  
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);



  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromURL = params.get("category");
    if (categoryFromURL) {
      setActiveCategory(categoryFromURL);
      setActiveTab("Category");
    }
  }, [location.search]);

  // Fetch all products once
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllProducts(products);
  };

  useEffect(() => {
    const fetchProductsByTab = async () => {
      try {
        if (activeTab === "Latest") {
          // Get products from last month using recentActivityLogs
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          const logsSnapshot = await getDocs(collection(db, "recentActivityLogs"));

          const productIdsSet = new Set();
          logsSnapshot.forEach(doc => {
            const data = doc.data();
            const timestamp = data.timestamp?.toDate?.();
            if (data.productId && timestamp && timestamp >= oneMonthAgo) {
              productIdsSet.add(data.productId);
            }
          });

          const productIds = Array.from(productIdsSet);
          const latestProducts = [];

          for (const productId of productIds) {
            const productDoc = await getDocs(collection(db, "products"));
            const product = productDoc.docs.find(d => d.id === productId);
            if (product) latestProducts.push({ id: product.id, ...product.data() });
          }

          setCategoryProducts(latestProducts);

        } else if (activeTab === "Popular") {
          const snapshot = await getDocs(collection(db, "products"));
          const popularProducts = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => (p.sold ?? 0) >= 1000);
          setCategoryProducts(popularProducts);

        } else {
          // Category tab
          const filtered = allProducts.filter(p => p.categorySub === activeCategory);
          setCategoryProducts(filtered);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setCategoryProducts([]);
      }
    };

    fetchProductsByTab();
  }, [activeTab, activeCategory, allProducts]);


  useEffect(() => {
    fetchProducts();
  }, []);

  const products = categoryProducts;

  return (
    <div className="categories-page">
      <div className="categories-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3 className="sidebar-title">Categories</h3>

          <div className="category-group">
            <h4>Tops</h4>
            <ul>
              {["T-Shirts", "Longsleeves"].map((cat) => (
                <li
                  key={cat}
                  className={activeCategory === cat ? "active" : ""}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveTab("Category");
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className="category-group">
            <h4>Bottoms</h4>
            <ul>
              {["Pants", "Shorts"].map((cat) => (
                <li
                  key={cat}
                  className={activeCategory === cat ? "active" : ""}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveTab("Category");
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="categories-content">
          <div className="section-header">
            <h2>
              {activeTab === "Latest"
                ? "Shop the Latest"
                : activeTab === "Popular"
                ? "Popular"
                : activeCategory}
            </h2>
            <div className="tabs">
              <button
                className={`tab ${activeTab === "Latest" ? "active" : ""}`}
                onClick={() => setActiveTab("Latest")}
              >
                Latest
              </button>
              <button
                className={`tab ${activeTab === "Popular" ? "active" : ""}`}
                onClick={() => setActiveTab("Popular")}
              >
                Popular
              </button>
            </div>
          </div>

          <div className="content-wrapper">
            {products.map((item) => (
              <div
                key={item.id}
                className="product-card"
                onClick={() => navigate(`/product/${item.id}`, { state: { product: item } })}
                style={{ cursor: "pointer" }}
              >
                <div className="image-placeholder">
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/220x220?text=No+Image"}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="product-info">
                  <h3>{item.name}</h3>
                  <p className="price">₱{item.price}</p>
                  <div className="meta">
                    <span>⭐ {item.rating}</span>
                    <span>{item.sold} sold</span>
                  </div>
                  <p className="delivery">🚚 {item.delivery}</p>
                </div>
              </div>
            ))}

          </div>
        </main>
      </div>

      <style>{`
        .categories-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-family: Arial, sans-serif;
          background: linear-gradient(to right, #e5dcff, #f3f0ff);
          min-height: 100vh;
          padding-top: 160px;
          padding-bottom: 60px;
          overflow-x: hidden;
          overflow-y: auto;
          margin: 0 auto;
          align-items: center;
        }

        .categories-container {
          display: flex;
          background: #fff;
          border: 2px solid #6a5acd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        /* Sidebar */
        .sidebar {
          flex: 0 0 270px;
          background: #f3f0ff;
          padding: 20px;
          box-sizing: border-box;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 15px;
          color: #222;
          padding-bottom: 10px;
          border-bottom: 1px solid #ccc;
        }

        .category-group {
          margin-bottom: 20px;
        }

        .category-group h4 {
          font-size: 1rem;
          font-weight: bold;
          color: #6a5acd;
          margin-bottom: 10px;
        }

        .category-group ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .category-group li {
          padding: 10px 12px;
          cursor: pointer;
          color: #555;
          transition: 0.3s;
        }

        .category-group li:hover {
          background: #e5dcff;
          width: 100%;
          color: #000;
        }

        .category-group li.active {
          font-weight: bold;
          color: #000;
          background: #fff;
          border-left: 4px solid #d220ff;
          width: 100%;
        }

        /* Main Content */
        .categories-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        /* Section Header */
        .section-header {
          width: 100%;
          padding: 28px 40px 20px;
          border-bottom: 2px solid #6a5acd;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          box-sizing: border-box;
        }

        .section-header h2 {
          font-size: 1.6rem;
          font-weight: bold;
          color: #222;
          margin: 0;
        }

        .tabs {
          display: flex;
          gap: 20px;
          margin-bottom: 2px;
        }

        .tab {
          border: none;
          background: none;
          font-weight: 600;
          padding: 6px 10px;
          color: #6a5acd;
          cursor: pointer;
          transition: 0.2s;
        }

        .tab:hover {
          text-decoration: underline;
        }

        .tab.active {
          text-decoration: underline;
        }

        /* Product Area */
        .content-wrapper {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          padding: 40px;
          box-sizing: border-box;
          min-height: 700px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .product-card {
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          transition: 0.3s;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 360px;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }

        .image-placeholder {
          background: #d9d9d9;
          height: 60%;
          width: 100%;
        }

        .product-info {
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 40%;
        }

        .product-info h3 {
          font-size: 1rem;
          margin: 0 0 6px;
          color: #222;
        }

        .price {
          color: #6a5acd;
          font-weight: bold;
          margin: 4px 0;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          color: #666;
          font-size: 0.9rem;
        }

        .delivery {
          color: #1b9e4b;
          font-size: 0.9rem;
          margin-top: 6px;
        }

        .placeholder {
          font-style: italic;
          color: #777;
          padding: 40px;
        }

    @media (max-width: 480px) {
      .categories-container {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
        flex-direction: row;
        align-items: stretch;
        border: none;
        box-shadow: none;
        overflow: hidden;
      }

      .sidebar {
        flex: 0 0 140px !important; 
        padding: 8px;
        background: #f8f6ff;
        border-right: 1px solid #ddd;
      }

      .sidebar-title {
        font-size: 0.9rem;
        margin-bottom: 8px;
      }

      .category-group {
        margin-bottom: 12px;
      }

      .categories-page {
          padding-top: 120px !important; 
      }

      .category-group h4 {
        font-size: 0.8rem;
        margin-bottom: 4px;
      }

      .category-group li {
        font-size: 0.8rem;
        padding: 5px 6px;
        margin-bottom: 3px;
        border-radius: 4px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .categories-content {
        flex: 1;
        background: #fff;
        padding: 0;
        overflow-y: auto;
      }

      .section-header {
        padding: 10px 12px;
        border-bottom: 1px solid #6a5acd;
      }

      .section-header h2 {
        font-size: 1rem;
      }

      .tabs {
        gap: 8px;
      }

      .tab {
        font-size: 0.8rem;
        padding: 3px 6px;
      }

      .content-wrapper {
        padding: 10px;
        gap: 10px;
        grid-template-columns: 1fr; 
      }

      .product-card {
        height: auto;
        padding: 8px;
      }

      .product-info {
        padding: 8px;
      }

      .product-info h3 {
        font-size: 0.85rem;
      }

      .price {
        font-size: 0.85rem;
      }

      .meta,
      .delivery {
        font-size: 0.75rem;
      }

      .categories-page {
        padding-top: 100px;
        padding-bottom: 30px;
        overflow-x: hidden;
      }
    }
      `}</style>
    </div>
  );
}