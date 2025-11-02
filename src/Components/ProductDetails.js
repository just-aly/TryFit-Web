import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, setDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth"; 
const auth = getAuth(); 

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x400.png?text=No+Image";

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prodRef = doc(db, "products", productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          setProduct({ id: prodSnap.id, ...prodSnap.data() });
        } else {
          console.warn("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading product...</p>;
  if (!product) return <p style={{ textAlign: "center", marginTop: "50px" }}>Product not found.</p>;

  const safeStock = product.stock || {};
  const getSizeStock = (size) => Number(safeStock[size]) || 0;

  const incrementQuantity = () => {
    if (selectedSize && quantity < getSizeStock(selectedSize)) setQuantity(quantity + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  

  const saveCartItem = async () => {
    if (!selectedSize) {
        alert("Please select a size.");
        return;
    }

    const stockAvailable = getSizeStock(selectedSize);
    if (quantity > stockAvailable) {
        alert(`Only ${stockAvailable} item(s) available for this size.`);
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) {
        alert("You need to be logged in to add items to the cart.");
        return;
        }

        // 🔹 Fetch your Firestore user document to get custom userId
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
        alert("User data not found in Firestore.");
        return;
        }
        const customUserId = userDocSnap.data().userId; 

        const cartItemCode = doc(collection(db, "cartItems")).id;

        await setDoc(doc(db, "cartItems", cartItemCode), {
        cartItemCode,
        userId: customUserId,   // ✅ use your custom userId
        productId: product.id,
        productID: product.productID,
        productName: product.name,
        productImage: product.imageUrl,
        size: selectedSize,
        quantity,
        price: product.price,
        timestamp: serverTimestamp(),
        });

       // ✅ Create a notifications reference
      const notificationsRef = collection(db, "notifications");

      // ✅ Add notification document
      await addDoc(notificationsRef, {
        notifID: `CRT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: customUserId, // use the actual user's ID
        title: "Add to Cart",
        message: `${product.name} (${selectedSize}) added to cart`,
        productID: product.productID, // optional, but useful for reference
        timestamp: serverTimestamp(),
        read: false,
      });


        setModalVisible(false);
        setQuantity(1);
        setSelectedSize(null);
    } catch (err) {
        console.error("Error adding to cart:", err);
        alert("Failed to add item to cart");
    }
    };

  return (
    <div className="product-details-container">
      <button className="back-button" onClick={() => window.history.back()}>← Back to Shop</button>

      <div className="product-card">
        <img src={product.imageUrl || PLACEHOLDER_IMAGE} alt={product.name} className="product-image" />
        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="price">₱{Number(product.price).toLocaleString()}</p>
          <p className="rating">⭐ {product.rating || "N/A"}</p>
          <p className="sold">{product.sold || 0} Sold</p>

          <div className="note">
          Size recommendations and AR experience are available only on the mobile app.
          </div>

          
        </div>
         <div className="button-group">
            <button className="add-to-cart-btn" onClick={() => setModalVisible(true)}>Add to Cart</button>
            <button className="checkout-btn" onClick={() => alert("Proceed to checkout")}>Checkout</button>
        </div>
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Size & Quantity</h3>
            <div className="sizes">
              {product.sizes?.map(size => (
                <button
                  key={size}
                  disabled={getSizeStock(size) === 0}
                  className={selectedSize === size ? "size-btn selected" : "size-btn"}
                  onClick={() => { setSelectedSize(size); setQuantity(1); }}
                >
                  {size} ({getSizeStock(size)} pcs)
                </button>
              ))}
            </div>

            <div className="quantity">
              <button onClick={decrementQuantity} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button onClick={incrementQuantity} disabled={selectedSize && quantity >= getSizeStock(selectedSize)}>＋</button>
            </div>

            <button className="confirm-btn" onClick={saveCartItem}>Add to Cart</button>
          </div>
        </div>
      )}

      <style>{`
        .product-details-container { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; font-family: Arial, sans-serif; }
        .back-button { margin-bottom: 20px; padding: 8px 16px; background: #7B5CD6; color: white; border: none; border-radius: 6px; cursor: pointer; }
        .product-card { max-width: 400px; width: 100%; background: #fff; border-radius: 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); text-align: center; padding-bottom: 20px; }
        .product-image { width: 100%; height: 400px; object-fit: cover; border-top-left-radius: 20px; border-top-right-radius: 20px; }
        .product-info { padding: 20px; text-align: left; }
        .price { font-weight: bold; color: #7B5CD6; }
        .rating, .sold { color: #555; margin-bottom: 5px; }
        .note { margin: 10px 0; color: #9747FF; font-weight: bold; }
         .button-group {
                display: flex;
                gap: 15px; /* space between buttons */
                justify-content: center;
                margin-top: 15px;
            }

            .add-to-cart-btn, .checkout-btn {
                flex: 1; /* equal width buttons */
                padding: 10px 16px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-weight: bold;
            }

            .add-to-cart-btn { background-color: #9747FF; color: white; }
            .checkout-btn { background-color: #FF6B6B; color: white; }
        .modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
        .modal-content { background: #fff; padding: 20px; border-radius: 12px; width: 90%; max-width: 400px; }
        .sizes { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
        .size-btn { padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; }
        .size-btn.selected { border-color: #9747FF; background: #F3E5F5; }
        .quantity { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
        .quantity button { padding: 5px 12px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; }
        .confirm-btn { background: #9747FF; color: white; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; width: 100%; }
      `}</style>
    </div>
  );
}
