import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../config/firebase";

function Recommendations() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch books for recommendations (first 6)
        const booksQuery = query(collection(db, "books"), limit(12));
        const querySnapshot = await getDocs(booksQuery);
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Shuffle and take 6 random books
        const shuffled = booksData.sort(() => 0.5 - Math.random());
        setBooks(shuffled.slice(0, 6));
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleAddToCart = (book) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      alert("Please login to add items to cart!");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === book.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        cover_image: book.cover_image || "https://via.placeholder.com/300x400?text=No+Image",
        quantity: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 fw-bold">Recommendations</h1>
      <p className="text-muted mb-4">Handpicked books just for you based on popular trends!</p>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {books.map((book) => (
              <div key={book.id} className="col-sm-6 col-md-4 col-lg-2">
                <div className="card h-100 book-card shadow-sm">
                  <img
                    src={book.cover_image || "https://via.placeholder.com/300x400?text=No+Image"}
                    className="card-img-top"
                    alt={book.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column p-2">
                    <h6 className="card-title fw-bold text-truncate mb-1" style={{ fontSize: "0.85rem" }}>
                      {book.title}
                    </h6>
                    <p className="card-text text-muted small mb-1 text-truncate">
                      {book.author}
                    </p>
                    <p className="card-text fw-bold price-rs mt-auto">
                      Rs. {book.price?.toLocaleString() || "N/A"}
                    </p>
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      onClick={() => handleAddToCart(book)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <Link to="/books" className="btn btn-primary btn-lg">
              Browse Books
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Recommendations;
