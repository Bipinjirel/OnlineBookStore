import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL = "http://localhost:5000/books";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        const userData = JSON.parse(localStorage.getItem("user") || "null");
        if (userData) {
          setUser(userData);
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username: firebaseUser.email?.split("@")[0] || "User",
            isAdmin: false,
          });
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    });

    updateCartCount();
    return () => unsubscribe();
  }, []);

  // Fetch book suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_URL}?search=${encodeURIComponent(searchTerm)}&limit=5`);
        const data = await response.json();
        if (data.success && data.data) {
          setSuggestions(data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
      setLoading(false);
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate("/books?search=" + encodeURIComponent(searchTerm));
      setShowSuggestions(false);
      setSearchTerm("");
    }
  };

  const handleSuggestionClick = (book) => {
    navigate(`/book/${book.id}`);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Books", path: "/books" },
    { name: "New Releases", path: "/new-releases" },
    { name: "Recommendations", path: "/recommendations" },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-bookie sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="brand-icon">📚</span>
          <span className="brand-text">Bookie</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto align-items-center">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.name}>
                <Link className="nav-link-bookie" to={link.path}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="search-container-bookie mx-lg-4" ref={searchRef}>
            <form className="position-relative" onSubmit={handleSearchSubmit}>
              <div className="input-group-bookie">
                <span className="search-icon-bookie">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control-bookie"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                {loading && <div className="navbar-search-spinner"></div>}
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="navbar-search-suggestions">
                {suggestions.map((book) => (
                  <div
                    key={book.id}
                    className="navbar-search-suggestion-item"
                    onClick={() => handleSuggestionClick(book)}
                  >
                    <div className="navbar-search-suggestion-icon">
                      <i className="bi bi-book"></i>
                    </div>
                    <div className="navbar-search-suggestion-info">
                      <div className="navbar-search-suggestion-title">
                        {book.title || book.name || "Unknown"}
                      </div>
                      {book.author && (
                        <div className="navbar-search-suggestion-author">
                          by {book.author}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div
                  className="navbar-search-suggestion-all"
                  onClick={handleSearchSubmit}
                >
                  <i className="bi bi-arrow-right"></i>
                  Search for "{searchTerm}"
                </div>
              </div>
            )}
          </div>

          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <Link className="nav-link-icon-bookie position-relative" to="/cart">
                <i className="bi bi-cart3"></i>
                {cartCount > 0 && (
                  <span className="cart-badge-bookie position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            {!isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link-bookie" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-primary btn-sm ms-2"
                    to="/register"
                    style={{ borderRadius: "20px" }}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}

            {isLoggedIn && user && (
              <li className="nav-item dropdown ms-2">
                <Link
                  className="nav-link-icon-bookie dropdown-toggle"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                </Link>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <div className="px-3 py-2">
                      <strong>{user.username}</strong>
                      {user.isAdmin && (
                        <span className="badge bg-warning text-dark ms-2">Admin</span>
                      )}
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to={user.isAdmin ? "/admin-dashboard" : "/user-dashboard"}
                    >
                      <i className="bi bi-speedometer2 me-2"></i>
                      {user.isAdmin ? "Admin Dashboard" : "My Dashboard"}
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
