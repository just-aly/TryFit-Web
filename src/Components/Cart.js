import React, { useState, useEffect } from "react";

export default function ShoppingCart() {
  const initialProducts = [
    { id: 1, name: "Men's Formal Longsleeves", price: 489, img: "mens_formal.jpg" },
    { id: 2, name: "Kween Yasmin Trending Orange Lorax Pants", price: 559, img: "lorax_pants.jpg" },
    { id: 3, name: "Men's Blue T-Shirt Short Sleeves", price: 199, img: "blue_tshirt.jpg" },
    { id: 4, name: "Black Off-Shoulder Top", price: 359, img: "off_shoulder.jpg" },
    { id: 5, name: "Fitted Dress Off Shoulder Brown", price: 699, img: "fitted_dress.jpg" },
    { id: 6, name: "Uwu Blouse Long Sleeves with Ribbon", price: 399, img: "uwu_blouse.jpg" },
  ];

  const [products, setProducts] = useState(
    initialProducts.map((p) => ({ ...p, selected: false, quantity: 1, color: "Black" }))
  );

  const [hideCheckout, setHideCheckout] = useState(false);

  const toggleSelect = (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const changeQuantity = (id, delta) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, quantity: Math.max(1, p.quantity + delta) }
          : p
      )
    );
  };

  const changeColor = (id, color) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, color } : p
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const selectedItems = products.filter((p) => p.selected);
  const total = selectedItems.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // Observe universal footer
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHideCheckout(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cart-container">
      {/* Product list */}
      <div className="cart-items">
        {products.map((product) => (
          <div key={product.id} className="cart-card">
            <input
              type="checkbox"
              checked={product.selected}
              onChange={() => toggleSelect(product.id)}
            />
            <img src={product.img} alt={product.name} className="cart-img" />
            <div className="cart-details">
              <h3>{product.name}</h3>
              <select
                value={product.color}
                onChange={(e) => changeColor(product.id, e.target.value)}
                className="color-dropdown"
              >
                <option>Black</option>
                <option>White</option>
                <option>Brown</option>
              </select>
              <p className="price">₱{product.price}</p>
            </div>
            <div className="quantity-actions">
              <div className="quantity">
                <button onClick={() => changeQuantity(product.id, -1)}>-</button>
                <span>{product.quantity}</span>
                <button onClick={() => changeQuantity(product.id, 1)}>+</button>
              </div>
              <span
                className="delete-btn"
                onClick={() => deleteProduct(product.id)}
              >
                Delete
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky checkout */}
      <div className={`checkout ${hideCheckout ? "hidden" : ""}`}>
        <div className="checkout-content">
          <div className="checkout-info">
            <p>Selected Item: {selectedItems.length}</p>
            <p>Total: ₱{total}</p>
          </div>
          <button className="checkout-btn">CHECK OUT</button>
        </div>
      </div>

      <style>{`
        .cart-container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #e9d5ff, #ddd6fe);
          padding: 100px 20px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: Arial, sans-serif;
        }

        .cart-items {
          margin: 20px 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 92%;    
          max-width: 880px;
        }

        .cart-card {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #fff;
          border-radius: 8px;
          padding: 12px;
          border-top: 6px solid #6a5acd;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .cart-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
        }

        .cart-details {
          flex: 1;
        }

        .cart-details h3 {
          font-size: 1rem;
          font-weight: 600;
        }

        .color-dropdown {
          margin: 5px 0;
          padding: 4px 6px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 0.9rem;
        }

        .price {
          font-size: 1rem;
          font-weight: bold;
          color: #6a5acd;
        }

        .quantity-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quantity button {
          background: #ddd6fe;
          border: none;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
        }

        .delete-btn {
          font-size: 0.9rem;
          color: #6a5acd;
          cursor: pointer;
          transition: color 0.2s ease-in-out;
          margin-top: 10px;
        }

        .delete-btn:hover {
          color: red;
        }

        /* Checkout bar */
        .checkout {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          background: transparent; 
          z-index: 999;
          transition: transform 0.3s ease-in-out;
        }

        .checkout.hidden {
          transform: translateY(120%);
        }

        .checkout-content {
          background: #fff;
          border-top: 4px solid #6a5acd;
          box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
          width: 92%;
          max-width: 880px;
          padding: 20px;
          border-radius: 0;
        }

        .checkout-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .checkout-btn {
          width: 100%;
          background: #6a5acd;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }

        .checkout-btn:hover {
          background: #5b4bcc;
        }
      `}</style>
    </div>
  );
}
