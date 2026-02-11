import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
    setLoading(false);
  }, []);

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map((item) =>
      item.id === bookId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (bookId) => {
    const updatedCart = cart.filter((item) => item.id !== bookId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      alert("Please login to proceed with checkout!");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  // Placeholder image
  const getPlaceholderImage = () => {
    return "https://via.placeholder.com/80x120/e63946/ffffff?text=No+Image";
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

  return (
    <div className="container py-4">
      <h2 className="mb-4">Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h4 className="text-muted mb-4">Your cart is empty</h4>
            <p className="text-muted mb-4">
              Looks like you haven't added any books to your cart yet.
            </p>
            <Link to="/books" className="btn btn-primary btn-lg">
              Browse Books
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{cart.length} Items in Cart</h5>
                <button className="btn btn-sm btn-outline-danger" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Book</th>
                        <th>Price (Rs.)</th>
                        <th>Quantity</th>
                        <th>Subtotal (Rs.)</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center py-3">
                              <img
                                src={item.cover_image || getPlaceholderImage()}
                                alt={item.title}
                                className="rounded me-3"
                                style={{ width: "60px", height: "90px", objectFit: "cover" }}
                                onError={(e) => {
                                  e.target.src = getPlaceholderImage();
                                }}
                              />
                              <div>
                                <h6 className="mb-1">{item.title}</h6>
                                <p className="text-muted mb-0 small">by {item.author}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong>Rs. {item.price?.toLocaleString()}</strong>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="mx-3">{item.quantity}</span>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            <strong>Rs. {(item.price * item.quantity).toLocaleString()}</strong>
                          </td>
                          <td className="text-end pe-4">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <i className="bi bi-trash"></i> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link to="/books" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({cart.length} items)</span>
                  <strong>Rs. {calculateTotal().toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong>Total</strong>
                  <strong className="text-primary fs-4">
                    Rs. {calculateTotal().toLocaleString()}
                  </strong>
                </div>
                <button
                  className="btn btn-primary w-100 btn-lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                <p className="text-muted text-center mt-3 small">
                  <i className="bi bi-lock"></i> Secure checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
