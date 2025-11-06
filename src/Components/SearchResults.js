import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLocation, useNavigate } from "react-router-dom";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/130x180.png?text=No+Image";
const KNOWN_LABELS = ["t-shirt", "tshirt", "shirt", "longsleeve", "pants", "shorts"];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const navigate = useNavigate();
  const queryParam = useQuery().get("query") || "";
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [displayTerm, setDisplayTerm] = useState(queryParam);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const query = queryParam.trim().toLowerCase();
        if (!query) {
          setResults([]);
          setMessage("Please enter a search term.");
          return;
        }

        // Normalize for variations like "Tshirt" or "t shirt"
        const normalizedQuery = query.replace(/[-\s]/g, "").replace(/s$/, "");

        // Match product name or category using fuzzy similarity
        const filtered = allProducts.filter((p) => {
          const name = p.productName?.toLowerCase().replace(/[-\s]/g, "") || "";
          const category = p.categorySub?.toLowerCase().replace(/[-\s]/g, "") || "";
          const keywords = `${name} ${category}`;

          return (
            keywords.includes(normalizedQuery) ||
            levenshteinDistance(normalizedQuery, name) <= 2 ||
            levenshteinDistance(normalizedQuery, category) <= 2
          );
        });

        if (filtered.length > 0) {
          // 🔹 If user types only 1–3 letters, show partial match message
          if (query.length <= 3) {
            setMessage(`No exact results for "${query}". Search results.`);
          } else {
            setMessage("");
          }
          setResults(filtered);
          setDisplayTerm(queryParam);
        } else {
          // Try to find similar known keywords (like "shirt" -> "t-shirt")
          const similar = getClosestMatch(normalizedQuery, KNOWN_LABELS);
          const related = allProducts.filter(
            (p) =>
              p.productName?.toLowerCase().includes(similar) ||
              p.categorySub?.toLowerCase().includes(similar)
          );

          if (related.length > 0) {
            setResults(related);
            setMessage(`No exact results for "${queryParam}". Showing results related to "${similar}".`);
          } else {
            setResults([]);
            setMessage(`No results found for "${queryParam}".`);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [queryParam]);

  // 🔹 Levenshtein distance for fuzzy comparison
  const levenshteinDistance = (a, b) => {
    const matrix = Array.from({ length: a.length + 1 }, () =>
      Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] =
          a[i - 1] === b[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
      }
    }

    return matrix[a.length][b.length];
  };

  // 🔹 Find the closest known keyword
  const getClosestMatch = (input, list) => {
    let closest = list[0];
    let minDist = levenshteinDistance(input, list[0]);
    for (let i = 1; i < list.length; i++) {
      const dist = levenshteinDistance(input, list[i]);
      if (dist < minDist) {
        closest = list[i];
        minDist = dist;
      }
    }
    return closest;
  };

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <h2 style={styles.headerTitle}>{displayTerm}</h2>
      </header>

      <div style={styles.resultsContainer}>
        <h3 style={styles.title}>Search Results for "{displayTerm}"</h3>
        {message && <p style={styles.message}>{message}</p>}

        {results.length > 0 ? (
          <div style={styles.grid}>
            {results.map((product) => (
              <div
                key={product.id}
                style={styles.card}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.imageUrl || PLACEHOLDER_IMAGE}
                  alt={product.productName}
                  style={styles.image}
                />
                <h4 style={styles.name}>{product.productName}</h4>
                <p style={styles.price}>{product.price}</p>
                <p style={styles.meta}>
                  ⭐ {product.rating} • {product.sold} Sold
                </p>
                <p style={styles.delivery}>🚚 {product.delivery}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.noResults}>No products found.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { 
    padding: "30px 50px", 
    backgroundColor: "#f7f7f7", 
    minHeight: "100vh",
    fontStyle: "Poppins",
  },

  header: { 
    display: "flex", 
    alignItems: "center", 
    marginBottom: "20px" 
  },

  headerTitle: { 
    fontSize: "20px", 
    fontWeight: "bold" 
  },

  resultsContainer: { 
    backgroundColor: "#fff", 
    padding: "20px", 
    borderRadius: "12px" 
  },
  
  title: { 
    fontSize: "18px", 
    fontWeight: "600", 
    marginBottom: "10px" 
  },

  message: { 
    color: "#666", 
    fontStyle: "italic", 
    marginBottom: "20px" 
  },
  
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
    gap: "20px" 
  },

  card: { 
    backgroundColor: "#fafafa", 
    borderRadius: "10px", 
    padding: "10px", 
    cursor: "pointer" 
  },

  image: { 
    width: "100%", 
    height: "200px", 
    objectFit: "cover", 
    borderRadius: "8px" 
  },

  name: { 
    fontSize: "14px", 
    fontWeight: "bold", 
    marginTop: "10px" 
  },

  price: { 
    color: "#9747FF", 
    fontWeight: "600", 
    marginTop: "4px" 
  },

  meta: { 
    fontSize: "12px", 
    color: "#555" 
  },
  
  delivery: { 
    fontSize: "12px",
    color: "green" 
  },

  noResults: { 
    textAlign: "center", 
    color: "#555", 
    marginTop: "50px" 
  },
};
