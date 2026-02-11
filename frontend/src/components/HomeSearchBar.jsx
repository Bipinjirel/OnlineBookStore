import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeSearchBar.css";

const API_URL = "http://localhost:5000/books";

function HomeSearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Fetch book suggestions from backend
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

    // Debounce the search
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
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
    }
  };

  const handleSuggestionClick = (book) => {
    navigate(`/book/${book.id}`);
    setSearchTerm(book.title || book.name || "");
    setShowSuggestions(false);
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index}>{part}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="home-search-container" ref={wrapperRef}>
      <form className="home-search-form" onSubmit={handleSearchSubmit}>
        <div className="home-search-input-wrapper">
          <i className="bi bi-search home-search-icon"></i>
          <input
            type="text"
            className="home-search-input"
            placeholder="Search for books, authors, or genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            autoComplete="off"
          />
          {loading && <div className="home-search-spinner"></div>}
        </div>
        <button type="submit" className="home-search-btn">
          Search
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="home-search-suggestions">
          {suggestions.map((book) => (
            <div
              key={book.id}
              className="home-search-suggestion-item"
              onClick={() => handleSuggestionClick(book)}
            >
              <div className="home-search-suggestion-icon">
                <i className="bi bi-book"></i>
              </div>
              <div className="home-search-suggestion-info">
                <div className="home-search-suggestion-title">
                  {highlightMatch(book.title || book.name || "Unknown", searchTerm)}
                </div>
                {book.author && (
                  <div className="home-search-suggestion-author">
                    by {book.author}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div
            className="home-search-suggestion-all"
            onClick={handleSearchSubmit}
          >
            <i className="bi bi-arrow-right"></i>
            Search for "{searchTerm}" in all books
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeSearchBar;
