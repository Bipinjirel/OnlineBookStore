import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc, getDoc, addDoc, collection, query, where, getDocs,
  updateDoc, increment, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(storedUser || { uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        setUser(null);
      }
    });

    fetchBookData();
    return () => unsubscribe();
  }, [id]);

  const fetchBookData = async () => {
    try {
      // Fetch book from Firestore
      const bookDoc = await getDoc(doc(db, "books", id));
      if (bookDoc.exists()) {
        setBook({ id: bookDoc.id, ...bookDoc.data() });
      }

      // Fetch reviews from Firestore
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("bookId", "==", id),
        where("approved", "==", true)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching book data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      alert("Please login to add items to cart!");
      navigate("/login");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === book.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        cover_image: book.cover_image,
        quantity: quantity,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${book.title} added to cart!`);
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      alert("Please login to add to wishlist!");
      navigate("/login");
      return;
    }

    try {
      // Check if already in wishlist
      const existingQuery = query(
        collection(db, "wishlists"),
        where("userId", "==", user.uid),
        where("bookId", "==", book.id)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        alert("This book is already in your wishlist!");
        return;
      }

      // Add to wishlists collection in Firestore
      await addDoc(collection(db, "wishlists"), {
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        cover_image: book.cover_image,
        addedAt: serverTimestamp(),
      });

      alert(`${book.title} added to wishlist!`);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Failed to add to wishlist.");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a review!");
      navigate("/login");
      return;
    }

    if (!newReview.comment.trim()) {
      alert("Please write a review comment.");
      return;
    }

    setSubmittingReview(true);

    try {
      // Add review to reviews collection in Firestore
      await addDoc(collection(db, "reviews"), {
        bookId: book.id,
        userId: user.uid,
        userName: user.username || user.email?.split("@")[0] || "Anonymous",
        rating: newReview.rating,
        comment: newReview.comment,
        approved: true,
        createdAt: serverTimestamp(),
      });

      // Update book rating
      const avgRating = calculateAverageRating(newReview.rating);
      await updateDoc(doc(db, "books", book.id), {
        rating: avgRating,
        reviewCount: increment(1),
      });

      // Refresh reviews
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("bookId", "==", id),
        where("approved", "==", true)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsData);

      setNewReview({ rating: 5, comment: "" });
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const calculateAverageRating = (newRating) => {
    if (reviews.length === 0) return newRating;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0) + newRating;
    return total / (reviews.length + 1);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= rating ? "bi-star-fill" : "bi-star"} text-warning`}
        ></i>
      );
    }
    return stars;
  };

  // Placeholder image
  const getPlaceholderImage = () => {
    return "https://via.placeholder.com/300x400/e63946/ffffff?text=No+Image";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-5">
        <h3>Book not found</h3>
        <Link to="/books" className="btn btn-primary">
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/books">Books</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {book.title}
          </li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Book Image */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body text-center p-4">
              <img
                src={book.cover_image || getPlaceholderImage()}
                alt={book.title}
                className="img-fluid rounded shadow"
                style={{ maxHeight: "450px", objectFit: "contain" }}
                onError={(e) => {
                  e.target.src = getPlaceholderImage();
                }}
              />
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h1 className="card-title fw-bold mb-2">{book.title}</h1>
                  <h4 className="text-muted mb-3">by {book.author}</h4>
                </div>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleAddToWishlist}
                >
                  <i className="bi bi-heart-fill"></i> Wishlist
                </button>
              </div>

              <div className="d-flex align-items-center mb-3">
                {book.rating && (
                  <div className="me-3">
                    {renderStars(Math.round(book.rating))}
                    <span className="ms-2 text-muted">
                      ({book.rating?.toFixed(1) || "0"}/5)
                    </span>
                  </div>
                )}
                <span className="badge bg-success me-2">In Stock</span>
                <span className="text-muted">{book.stock} available</span>
              </div>

              {book.category && (
                <span className="badge bg-secondary mb-3">{book.category}</span>
              )}

              <hr />

              <div className="mb-4">
                <span className="display-5 fw-bold text-primary">
                  Rs. {book.price?.toLocaleString()}
                </span>
              </div>

              {book.description && (
                <div className="mb-4">
                  <h5 className="fw-bold">Description</h5>
                  <p className="card-text text-muted">{book.description}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="card bg-light mb-4">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <label className="fw-bold me-3 mb-0">Quantity:</label>
                    <div className="input-group" style={{ width: "140px" }}>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() =>
                          setQuantity(Math.max(1, quantity - 1))
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        min="1"
                        max={book.stock}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() =>
                          setQuantity(Math.min(book.stock, quantity + 1))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">
                      Subtotal:{" "}
                      <span className="fw-bold">
                        Rs. {(book.price * quantity).toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3">
                <button
                  className="btn btn-primary btn-lg flex-grow-1"
                  onClick={handleAddToCart}
                  disabled={book.stock <= 0}
                >
                  {book.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
                <Link to="/books" className="btn btn-outline-secondary btn-lg">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Reviews ({reviews.length})</h5>
            </div>
            <div className="card-body">
              {/* Review Form */}
              <div className="mb-4 border-bottom pb-4">
                <h6>Write a Review</h6>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="btn btn-sm"
                          onClick={() =>
                            setNewReview({ ...newReview, rating: star })
                          }
                        >
                          <i
                            className={`bi ${
                              star <= newReview.rating
                                ? "bi-star-fill text-warning"
                                : "bi-star"
                            }`}
                            style={{ fontSize: "1.5rem" }}
                          ></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Review</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          comment: e.target.value,
                        })
                      }
                      placeholder="Share your thoughts about this book..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No reviews yet. Be the first to review this book!
                </p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-bottom pb-3 mb-3"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{review.userName}</strong>
                          <div className="mt-1">{renderStars(review.rating)}</div>
                        </div>
                        <small className="text-muted">
                          {review.createdAt
                            ? new Date(
                                review.createdAt.toDate()
                              ).toLocaleDateString()
                            : "Recently"}
                        </small>
                      </div>
                      <p className="mt-2 mb-0">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
