import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import "./Books.css";

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize search term from URL params
  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchTerm(query);
  }, [searchParams]);

  // Fetch books from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        // Fetch all books first
        let booksQuery = query(collection(db, "books"));
        
        const snapshot = await getDocs(booksQuery);
        
        let booksData = [];
        snapshot.forEach((doc) => {
          booksData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sort by createdAt descending if available
        booksData.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });

        // Apply case-insensitive search filter on title and author
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          booksData = booksData.filter(book => 
            (book.title && book.title.toLowerCase().includes(searchLower)) ||
            (book.author && book.author.toLowerCase().includes(searchLower))
          );
        }

        setBooks(booksData);
      } catch (err) {
        console.error("Error fetching books:", err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search (300ms delay)
    const timeoutId = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Update URL without page reload
    if (value.trim()) {
      navigate(`/books?search=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate("/books", { replace: true });
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    navigate("/books", { replace: true });
  };

  return (
    <div className="books-page">
      <h2 className="books-title">Books Catalog</h2>

      {/* Search Input - Real-time */}
      <div className="books-search-container">
        <div className="books-search-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="#6c757d"
            className="books-search-icon"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          <input
            type="text"
            className="books-search-input"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          {searchTerm && (
            <button className="books-clear-search" onClick={clearSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="books-count">
        {loading ? (
          "Searching..."
        ) : (
          <>
            {books.length} book{books.length !== 1 ? 's' : ''} found
            {searchTerm && <span className="books-search-term"> for "{searchTerm}"</span>}
          </>
        )}
      </p>

      {loading ? (
        <div className="books-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : books.length > 0 ? (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <img
                src={
                  book.imageUrl ||
                  book.cover_image ||
                  "https://via.placeholder.com/300x400/e63946/ffffff?text=No+Image"
                }
                className="book-card-img"
                alt={book.title}
              />
              <div className="book-card-body">
                <h5 className="book-card-title">{book.title}</h5>
                <p className="book-card-author">by {book.author}</p>
                <p className="book-card-price">Rs. {book.price?.toLocaleString()}</p>
                <p className={`book-card-stock ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                </p>
                <div className="book-card-actions">
                  <Link
                    to={`/book/${book.id}`}
                    className="book-btn book-btn-outline"
                  >
                    View Details
                  </Link>
                  <button
                    className="book-btn book-btn-primary"
                    disabled={book.stock <= 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="books-no-results">
          <p className="books-no-results-text">
            {searchTerm 
              ? "No books found matching your search." 
              : "No books available in the catalog."}
          </p>
          {searchTerm && (
            <button className="books-clear-btn" onClick={clearSearch}>
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Books;
