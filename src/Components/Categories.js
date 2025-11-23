import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";

export default function Categories() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("T-Shirt");
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

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllProducts(products);
  };

  useEffect(() => {
    const fetchProductsByTab = async () => {
      try {
        if (activeTab === "Latest") {
          try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const oneMonthAgo = new Date();
            oneMonthAgo.setDate(oneMonthAgo.getDate() - 31);

            const latestProducts = [];

            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (!data.createdAt) return;

              const createdAt = data.createdAt.toDate
                ? data.createdAt.toDate()
                : new Date(data.createdAt);

              if (createdAt >= oneMonthAgo) {
                latestProducts.push({
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

            setCategoryProducts(latestProducts);
          } catch (error) {
            console.error("Error fetching latest products:", error);
          }
        } else if (activeTab === "Popular") {
          const snapshot = await getDocs(collection(db, "products"));
          const popularProducts = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((p) => (p.sold ?? 0) >= 1000);
          setCategoryProducts(popularProducts);
        } else {
          const filtered = allProducts.filter(
            (p) => p.categorySub?.toLowerCase() === activeCategory.toLowerCase()
          );
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
        <aside className="sidebar">
          <h3 className="sidebar-title">Categories</h3>

          <div className="category-group">
            <h4>Tops</h4>
            <ul>
              {["T-Shirt", "Longsleeves"].map((cat) => (
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

        <main className="categories-content">
          <div className="section-header sticky-header">
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
                onClick={() =>
                  navigate(`/product/${item.id}`, { state: { product: item } })
                }
                style={{ cursor: "pointer" }}
              >
                <div className="image-placeholder">
                  <img
                    src={
                      item.imageUrl ||
                      "https://via.placeholder.com/220x220?text=No+Image"
                    }
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3>{item.productName}</h3>
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
          overflow-y: visible; 
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
 
       .sidebar {
          flex: 0 0 270px;
          background: #f3f0ff;
          padding: 20px;
          box-sizing: border-box;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .sticky-header {
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 20;
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
 
        .categories-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
           max-height: calc(100vh - 1px);
        }
 
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
    flex-direction: row;  
    width: 100%;
    border: none;
    box-shadow: none;
    overflow: hidden;
  }

  .sidebar {
    flex: 0 0 110px; 
    padding: 8px;
    background: #f8f6ff;
    border-right: 1px solid #ddd;
    height: auto;
  }

  .sidebar-title {
    font-size: 0.85rem;
    margin-bottom: 6px;
  }

  .category-group h4 {
    font-size: 0.75rem;
    margin-bottom: 4px;
  }

  .category-group li {
    font-size: 0.7rem;
    padding: 4px 6px;
  }

  .category-group li.active {
    width: 90%;
  }


  .categories-content {
    flex: 1;
    padding: 5px;
    overflow-y: auto;
  }

  .section-header {
    padding: 8px 10px;
    border-bottom: 1px solid #6a5acd;
    position: sticky;
    top: 0;
    background: #fff;
    height: auto;
  }

  .section-header h2 {
    font-size: 1rem;
  }

  .tabs .tab {
    font-size: 0.7rem;
    padding: 10px 5px;
  }
 
  .content-wrapper {
    padding: 0;
    gap: 13px;
    grid-template-columns: repeat(1, 1fr);
  }

  .product-card {
    height: 260px;  
    display: flex;
    flex-direction: column;
    padding: 6px;
  }

  .image-placeholder {
    height: 60%;  
    width: 100%;
  }

  .product-info {
    padding: 6px 0;
  }

  .product-info h3 {
    font-size: 0.85rem;
  }

  .price {
    font-size: 0.8rem;
  }

  .meta,
  .delivery {
    font-size: 0.7rem;
  }

  .categories-page {
    padding-top: 110px;
    padding-bottom: 40px;
  }
}
      `}</style>
    </div>
  );
}
