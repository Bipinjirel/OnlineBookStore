import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../config/firebase";

function NewReleases() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch latest books (first 12 books from collection)
        const booksQuery = query(collection(db, "books"), limit(12));
        const querySnapshot = await getDocs(booksQuery);
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="container py-5">
      <h1 className="mb-4 fw-bold">New Releases</h1>
      
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
              <div key={book.id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 book-card shadow-sm">
                  <img
                    src={book.cover_image || "https://via.placeholder.com/300x400?text=No+Image"}
                    className="card-img-top"
                    alt={book.title}
                    style={{ height: "250px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold text-truncate">{book.title}</h5>
                    <p className="card-text text-muted small">{book.author}</p>
                    <p className="card-text fw-bold price-rs fs-5 mt-auto">
                      Rs. {book.price?.toLocaleString() || "N/A"}
                    </p>
                    <Link to={`/book/${book.id}`} className="btn btn-outline-primary mt-2">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <Link to="/books" className="btn btn-primary btn-lg">
              Browse All Books
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default NewReleases;
