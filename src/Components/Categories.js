import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Categories() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("T-Shirts");
  const [activeTab, setActiveTab] = useState("Category");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromURL = params.get("category");
    if (categoryFromURL) {
      setActiveCategory(categoryFromURL);
      setActiveTab("Category");
    }
  }, [location.search]);

  // Latest Products
  const latestProducts = [
    {
      id: 101,
      name: "Trendy Oversized Hoodie",
      price: "₱399",
      rating: 4.6,
      sold: "5.1K Sold",
      delivery: "3-5 Days",
    },
    {
      id: 102,
      name: "Casual Linen Polo Shirt",
      price: "₱349",
      rating: 4.4,
      sold: "2.3K Sold",
      delivery: "3-5 Days",
    },
  ];

  // Popular Products
  const popularProducts = [
    {
      id: 201,
      name: "Slim Fit Denim Jacket",
      price: "₱499",
      rating: 4.9,
      sold: "9.8K Sold",
      delivery: "4-6 Days",
    },
    {
      id: 202,
      name: "Classic White Shorts",
      price: "₱899",
      rating: 4.8,
      sold: "12.4K Sold",
      delivery: "3-5 Days",
    },
  ];

  // Regular Category Products
  const allProducts = {
    "T-Shirts": [
      {
        id: 1,
        name: "Shrek Meme Classic T-Shirt",
        price: "₱159",
        rating: 3.8,
        sold: "1.7K Sold",
        delivery: "3-5 Days",
      },
      {
        id: 2,
        name: "Blue Short Sleeve T-Shirt",
        price: "₱199",
        rating: 2.5,
        sold: "2.3K Sold",
        delivery: "3-5 Days",
      },
    ],
    "Long Sleeves": [
      {
        id: 3,
        name: "White Cotton Long Sleeves",
        price: "₱279",
        rating: 4.2,
        sold: "1.2K Sold",
        delivery: "4-6 Days",
      },
      {
        id: 4,
        name: "Black Formal Long Sleeves",
        price: "₱359",
        rating: 4.7,
        sold: "3.1K Sold",
        delivery: "4-6 Days",
      },
    ],
    Pants: [
      {
        id: 5,
        name: "Classic Denim Jeans",
        price: "₱499",
        rating: 4.4,
        sold: "2.9K Sold",
        delivery: "5-7 Days",
      },
      {
        id: 6,
        name: "Stretch Fit Black Pants",
        price: "₱459",
        rating: 4.6,
        sold: "1.8K Sold",
        delivery: "5-7 Days",
      },
    ],
    Shorts: [
      {
        id: 7,
        name: "Summer Casual Shorts",
        price: "₱299",
        rating: 4.3,
        sold: "2.4K Sold",
        delivery: "3-5 Days",
      },
      {
        id: 8,
        name: "Men’s Cargo Shorts",
        price: "₱329",
        rating: 4.5,
        sold: "2.1K Sold",
        delivery: "3-5 Days",
      },
    ],
  };

  const products =
    activeTab === "Latest"
      ? latestProducts
      : activeTab === "Popular"
      ? popularProducts
      : allProducts[activeCategory] || [];

  return (
    <div className="categories-page">
      <div className="categories-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3 className="sidebar-title">Categories</h3>

          <div className="category-group">
            <h4>Tops</h4>
            <ul>
              {["T-Shirts", "Long Sleeves"].map((cat) => (
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
            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((item) => (
                  <div key={item.id} className="product-card">
                    <div className="image-placeholder"></div>
                    <div className="product-info">
                      <h3>{item.name}</h3>
                      <p className="price">{item.price}</p>
                      <div className="meta">
                        <span>⭐ {item.rating}</span>
                        <span>{item.sold}</span>
                      </div>
                      <p className="delivery">🚚 {item.delivery}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="placeholder">
                No products yet in <b>{activeCategory}</b>.
              </p>
            )}
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
          margin: 0 auto;
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
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
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
      `}</style>
    </div>
  );
}
