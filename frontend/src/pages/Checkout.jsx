import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, addDoc, serverTimestamp, 
  doc, updateDoc, getDoc 
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

function Checkout() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (storedCart.length === 0) {
        navigate("/cart");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        setUser(storedUser);
        setShippingInfo({
          fullName: storedUser.username || "",
          email: storedUser.email || "",
          phone: "",
          address: "",
          city: "",
          zipCode: "",
        });
      }
      setCart(storedCart);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    return (
      shippingInfo.fullName &&
      shippingInfo.email &&
      shippingInfo.phone &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.zipCode
    );
  };

  const processPayment = async () => {
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create order in Firestore orders collection
      const orderData = {
        userId: user.uid,
        email: user.email,
        customerName: shippingInfo.fullName,
        items: cart.map((item) => ({
          bookId: item.id,
          title: item.title,
          author: item.author,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: calculateTotal(),
        shippingInfo: shippingInfo,
        paymentMethod: paymentMethod,
        status: "Processing",
        dateOrdered: serverTimestamp(),
        createdAt: new Date().toISOString(),
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);
      const newOrderId = orderRef.id;

      // Update book stock in Firestore
      for (const item of cart) {
        const bookRef = doc(db, "books", item.id);
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          const bookData = bookSnap.data();
          const newStock = (bookData.stock || 0) - item.quantity;
          await updateDoc(bookRef, { stock: Math.max(0, newStock) });
        }
      }

      // Clear cart and show success
      localStorage.removeItem("cart");
      setOrderId(newOrderId);
      setOrderComplete(true);
      setStep(3);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      await processPayment();
    }
  };

  // Placeholder image
  const getPlaceholderImage = () => {
    return "https://via.placeholder.com/40x60/e63946/ffffff?text=No+Image";
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

  if (orderComplete) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card text-center">
              <div className="card-body py-5">
                <div className="mb-4">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: "4rem" }}></i>
                </div>
                <h3 className="card-title mb-3">Order Placed Successfully!</h3>
                <p className="text-muted mb-4">
                  Thank you for your purchase. Your order has been confirmed.
                </p>
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <p className="mb-1"><strong>Order ID:</strong> #{orderId.substring(0, 8)}</p>
                    <p className="mb-1">
                      <strong>Total Paid:</strong> Rs. {calculateTotal().toLocaleString()}
                    </p>
                    <p className="mb-0">
                      <strong>Estimated Delivery:</strong> 3-5 business days
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/user-dashboard" className="btn btn-primary">
                    View Order
                  </Link>
                  <Link to="/books" className="btn btn-outline-secondary">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Checkout</h2>

      {/* Progress Steps */}
      <div className="mb-4">
        <div className="d-flex justify-content-between">
          <div className={`text-center ${step >= 1 ? "text-primary" : "text-muted"}`}>
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                step >= 1 ? "bg-primary text-white" : "bg-light"
              }`}
              style={{ width: "40px", height: "40px" }}
            >
              1
            </div>
            <p className="mt-2 mb-0 small">Shipping</p>
          </div>
          <div className="flex-grow-1 d-flex align-items-center">
            <div
              className={`w-100 ${step >= 2 ? "bg-primary" : "bg-light"}`}
              style={{ height: "2px" }}
            ></div>
          </div>
          <div className={`text-center ${step >= 2 ? "text-primary" : "text-muted"}`}>
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                step >= 2 ? "bg-primary text-white" : "bg-light"
              }`}
              style={{ width: "40px", height: "40px" }}
            >
              2
            </div>
            <p className="mt-2 mb-0 small">Payment</p>
          </div>
          <div className="flex-grow-1 d-flex align-items-center">
            <div
              className={`w-100 ${step >= 3 ? "bg-primary" : "bg-light"}`}
              style={{ height: "2px" }}
            ></div>
          </div>
          <div className={`text-center ${step >= 3 ? "text-primary" : "text-muted"}`}>
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                step >= 3 ? "bg-primary text-white" : "bg-light"
              }`}
              style={{ width: "40px", height: "40px" }}
            >
              3
            </div>
            <p className="mt-2 mb-0 small">Confirm</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Shipping Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        placeholder="977-XXXXXXXXXX"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4 d-flex gap-3">
                    <Link to="/cart" className="btn btn-outline-secondary">
                      Back to Cart
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!validateShipping()}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Payment Method</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">Select Payment Method</label>
                    <div className="row g-3">
                      <div className="col-4">
                        <div
                          className={`card cursor-pointer ${
                            paymentMethod === "khalti"
                              ? "border-primary bg-primary bg-opacity-10"
                              : ""
                          }`}
                          onClick={() => setPaymentMethod("khalti")}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="card-body text-center py-4">
                            <h5 className="mb-2">Khalti</h5>
                            <p className="text-muted mb-0 small">
                              Digital Wallet
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div
                          className={`card cursor-pointer ${
                            paymentMethod === "stripe"
                              ? "border-primary bg-primary bg-opacity-10"
                              : ""
                          }`}
                          onClick={() => setPaymentMethod("stripe")}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="card-body text-center py-4">
                            <h5 className="mb-2">Card</h5>
                            <p className="text-muted mb-0 small">Visa/Mastercard</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div
                          className={`card cursor-pointer ${
                            paymentMethod === "cod"
                              ? "border-primary bg-primary bg-opacity-10"
                              : ""
                          }`}
                          onClick={() => setPaymentMethod("cod")}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="card-body text-center py-4">
                            <h5 className="mb-2">COD</h5>
                            <p className="text-muted mb-0 small">
                              Cash on Delivery
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === "stripe" && (
                    <div className="card bg-light mb-4">
                      <div className="card-body">
                        <h6 className="mb-3">Card Details</h6>
                        <div className="mb-3">
                          <label className="form-label">Card Number</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="4242 4242 4242 4242"
                          />
                        </div>
                        <div className="row g-3">
                          <div className="col-6">
                            <label className="form-label">Expiry</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label">CVC</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="123"
                            />
                          </div>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-lock"></i> Secure payment
                        </small>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "khalti" && (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle"></i> You will be redirected
                      to Khalti to complete the payment securely.
                    </div>
                  )}

                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setStep(1)}
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-grow-1"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        `Pay Rs. ${calculateTotal().toLocaleString()}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          item.cover_image ||
                          getPlaceholderImage()
                        }
                        alt={item.title}
                        className="rounded me-2"
                        style={{
                          width: "40px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src = getPlaceholderImage();
                        }}
                      />
                      <div>
                        <p className="mb-0 small text-truncate" style={{ maxWidth: "150px" }}>
                          {item.title}
                        </p>
                        <p className="text-muted mb-0 small">x{item.quantity}</p>
                      </div>
                    </div>
                    <strong>Rs. {(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>Rs. {calculateTotal().toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong className="text-primary">
                  Rs. {calculateTotal().toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
