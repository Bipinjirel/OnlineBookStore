import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../config/firebase";

function Home() {
  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch all books
        const booksQuery = query(collection(db, "books"), limit(30));
        const querySnapshot = await getDocs(booksQuery);
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksData);
        
        // Set first 6 books as featured
        setFeaturedBooks(booksData.slice(0, 6));
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="hero mb-5"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=500&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "400px",
        }}
      >
        <div className="container h-100 d-flex align-items-center">
          <div className="row w-100 align-items-center">
            <div className="col-md-6 text-white">
              <h1 className="display-4 fw-bold mb-3 text-shadow">Discover Your Next Great Read</h1>
              <p className="lead mb-4 opacity-90 text-shadow">
                Explore our extensive collection of books at great prices with fast delivery across Nepal.
              </p>
              <Link to="/books" className="btn btn-light btn-lg px-5 py-2 fw-semibold">
                VIEW MORE
              </Link>
            </div>
            <div className="col-md-6 d-none d-md-block text-center">
              {books.length > 0 && (
                <img
                  src={books[0].cover_image || "https://via.placeholder.com/300x400?text=Featured+Book"}
                  alt="Featured Book"
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "350px", objectFit: "cover" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Three Feature Cards */}
      <section className="mb-5">
        <div className="row g-4">
          <div className="col-md-4">
            <Link to="/books?sale=true" className="text-decoration-none">
              <div 
                className="card h-100 border-0 shadow-sm promo-card"
                style={{
                  background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
                  minHeight: "180px",
                }}
              >
                <div className="card-body d-flex flex-column justify-content-center align-items-center text-white text-center p-4">
                  <h3 className="fw-bold mb-2">SHOP SALE</h3>
                  <p className="mb-0 opacity-90">Up to 75% OFF on selected titles</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/new-releases" className="text-decoration-none">
              <div 
                className="card h-100 border-0 shadow-sm promo-card"
                style={{
                  background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  minHeight: "180px",
                }}
              >
                <div className="card-body d-flex flex-column justify-content-center align-items-center text-white text-center p-4">
                  <h3 className="fw-bold mb-2">LATEST PRODUCTS</h3>
                  <p className="mb-0 opacity-90">New Arrivals fresh off the press</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/blog" className="text-decoration-none">
              <div 
                className="card h-100 border-0 shadow-sm promo-card"
                style={{
                  background: "linear-gradient(135deg, #6c5ce7 0%, #a55eea 100%)",
                  minHeight: "180px",
                }}
              >
                <div className="card-body d-flex flex-column justify-content-center align-items-center text-white text-center p-4">
                  <h3 className="fw-bold mb-2">READ THE BLOG</h3>
                  <p className="mb-0 opacity-90">Latest news, reviews & recommendations</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold">Featured Books</h2>
          <Link to="/books" className="btn btn-outline-primary">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {featuredBooks.map((book) => (
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
                    <Link to={`/book/${book.id}`} className="btn btn-outline-primary btn-sm mt-2">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bestsellers Section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold">
            <span className="text-warning">★</span> Bestsellers
          </h2>
          <Link to="/books" className="btn btn-outline-primary">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {books.slice(0, 4).map((book) => (
              <div key={book.id} className="col-md-6 col-lg-3">
                <div className="card h-100 book-card shadow-sm">
                  <img
                    src={book.cover_image || "https://via.placeholder.com/300x400?text=No+Image"}
                    className="card-img-top"
                    alt={book.title}
                    style={{ height: "280px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold text-truncate">{book.title}</h5>
                    <p className="card-text text-muted small">{book.author}</p>
                    <p className="card-text fw-bold price-rs fs-5 mt-auto">
                      Rs. {book.price?.toLocaleString() || "N/A"}
                    </p>
                    <div className="d-flex gap-2 mt-2">
                      <Link to={`/book/${book.id}`} className="btn btn-outline-primary flex-grow-1">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Books Preview */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold">All Books</h2>
          <Link to="/books" className="btn btn-outline-primary">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {books.slice(4, 12).map((book) => (
              <div key={book.id} className="col-sm-6 col-md-3">
                <div className="card h-100 book-card shadow-sm">
                  <img
                    src={book.cover_image || "https://via.placeholder.com/200x280?text=No+Image"}
                    className="card-img-top"
                    alt={book.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column p-2">
                    <h6 className="card-title fw-bold text-truncate mb-1" style={{ fontSize: "0.9rem" }}>
                      {book.title}
                    </h6>
                    <p className="card-text text-muted small mb-1 text-truncate">
                      {book.author}
                    </p>
                    <p className="card-text fw-bold price-rs mt-auto">
                      Rs. {book.price?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="mb-5">
        <h2 className="mb-4 fw-bold text-center">Why Choose Bookie</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 text-center border-0 shadow-sm">
              <div className="card-body py-5">
                <div className="display-4 mb-3">📚</div>
                <h5 className="card-title fw-bold">Wide Selection</h5>
                <p className="card-text text-muted">
                  Choose from thousands of books across all genres, from classics to bestsellers.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center border-0 shadow-sm">
              <div className="card-body py-5">
                <div className="display-4 mb-3">🚀</div>
                <h5 className="card-title fw-bold">Fast Delivery</h5>
                <p className="card-text text-muted">
                  Get your books delivered to your doorstep quickly with our efficient shipping.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center border-0 shadow-sm">
              <div className="card-body py-5">
                <div className="display-4 mb-3">💰</div>
                <h5 className="card-title fw-bold">Great Prices</h5>
                <p className="card-text text-muted">
                  Enjoy competitive prices and regular discounts on your favorite books in NPR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-5">
        <div className="card text-white text-center border-0 shadow" style={{ background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)" }}>
          <div className="card-body py-5">
            <h3 className="card-title fw-bold mb-3">Ready to Start Reading?</h3>
            <p className="card-text mb-4 opacity-90">
              Create an account to explore our full collection, save your favorites, and place orders.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/register" className="btn btn-light btn-lg">
                Sign Up Now
              </Link>
              <Link to="/books" className="btn btn-outline-light btn-lg">
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
