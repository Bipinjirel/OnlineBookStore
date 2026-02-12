import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../config/firebase";
import SearchBar from "../components/SearchBar";
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

  // Fetch all books from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "books"));
        const booksData = [];
        snapshot.forEach((doc) => {
          booksData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setBooks(booksData);
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Filter books based on search term
  const displayBooks = searchTerm.trim() 
    ? books.filter(book => {
        const searchLower = searchTerm.toLowerCase();
        return (book.title && book.title.toLowerCase().includes(searchLower)) ||
               (book.author && book.author.toLowerCase().includes(searchLower));
      })
    : books;

  const clearSearch = () => {
    setSearchTerm("");
    navigate("/books", { replace: true });
  };

  return (
    <div className="books-page">
      <h2 className="books-title">Books Catalog</h2>

      {/* Search Bar with Autocomplete */}
      <div className="books-search-container">
        <SearchBar />
      </div>

      {/* Update search term from URL for display */}
      <div style={{ display: 'none' }}>
        {searchTerm !== (searchParams.get("search") || "") && setSearchTerm(searchParams.get("search") || "")}
      </div>

      {/* Results count */}
      <p className="books-count">
        {loading ? (
          "Loading..."
        ) : (
          <>
            {displayBooks.length} book{displayBooks.length !== 1 ? 's' : ''} found
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
      ) : displayBooks.length > 0 ? (
        <div className="books-grid">
          {displayBooks.map((book) => (
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
