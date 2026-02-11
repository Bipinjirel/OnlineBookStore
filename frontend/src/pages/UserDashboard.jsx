import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  collection, getDocs, query, where, orderBy, 
  doc, deleteDoc, updateDoc, addDoc, serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      
      if (storedUser && storedUser.isAdmin) {
        navigate("/admin-dashboard");
        return;
      }

      if (storedUser) {
        setUser(storedUser);
        await fetchUserData(firebaseUser.uid);
      } else {
        const newUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.email?.split('@')[0] || "User",
          isAdmin: false,
        };
        setUser(newUser);
        await fetchUserData(firebaseUser.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      // Fetch orders
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("dateOrdered", "desc")
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);

      // Fetch wishlist
      const wishlistQuery = query(
        collection(db, "wishlists"),
        where("userId", "==", userId)
      );
      const wishlistSnapshot = await getDocs(wishlistQuery);
      const wishlistData = wishlistSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlist(wishlistData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      await deleteDoc(doc(db, "wishlists", wishlistId));
      setWishlist(wishlist.filter((item) => item.id !== wishlistId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleMoveToCart = (book) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === book.bookId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: book.bookId,
        title: book.title,
        author: book.author,
        price: book.price,
        cover_image: book.cover_image,
        quantity: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    handleRemoveFromWishlist(book.id);
    alert("Moved to cart!");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">My Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {user.username}!</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3 className="mb-0">{orders.length}</h3>
              <p className="mb-0">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h3 className="mb-0">{wishlist.length}</h3>
              <p className="mb-0">Wishlist Items</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3 className="mb-0">
                {orders.filter((o) => o.status === "Delivered").length}
              </h3>
              <p className="mb-0">Completed Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Order History
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
            Wishlist
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            Saved for Later
          </button>
        </li>
      </ul>

      {/* Order History Tab */}
      {activeTab === "orders" && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Order History</h5>
          </div>
          <div className="card-body">
            {orders.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted mb-3">You haven't placed any orders yet.</p>
                <Link to="/books" className="btn btn-primary">
                  Browse Books
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.id.substring(0, 8)}</strong>
                        </td>
                        <td>
                          {order.dateOrdered
                            ? new Date(order.dateOrdered).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <ul className="mb-0 ps-3 small">
                            {order.items?.slice(0, 2).map((item, index) => (
                              <li key={index}>
                                {item.title} (x{item.quantity})
                              </li>
                            ))}
                            {order.items?.length > 2 && (
                              <li className="text-muted">
                                +{order.items.length - 2} more items
                              </li>
                            )}
                          </ul>
                        </td>
                        <td>
                          <strong>Rs. {order.totalAmount?.toLocaleString()}</strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.status === "Delivered"
                                ? "bg-success"
                                : order.status === "Processing"
                                ? "bg-warning"
                                : "bg-info"
                            }`}
                          >
                            {order.status || "Processing"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              alert(`Order Details:\n${JSON.stringify(order, null, 2)}`);
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === "wishlist" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">My Wishlist</h5>
            <span className="badge bg-secondary">{wishlist.length} items</span>
          </div>
          <div className="card-body">
            {wishlist.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted mb-3">Your wishlist is empty.</p>
                <Link to="/books" className="btn btn-primary">
                  Browse Books
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                {wishlist.map((item) => (
                  <div key={item.id} className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <div className="row g-0">
                        <div className="col-4">
                          <img
                            src={item.cover_image || "https://via.placeholder.com/100x150?text=No+Image"}
                            className="img-fluid rounded-start h-100"
                            alt={item.title}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="col-8">
                          <div className="card-body">
                            <h6 className="card-title text-truncate">{item.title}</h6>
                            <p className="card-text text-muted small text-truncate">
                              by {item.author}
                            </p>
                            <p className="card-text">
                              <strong>Rs. {item.price?.toLocaleString()}</strong>
                            </p>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-primary flex-grow-1"
                                onClick={() => handleMoveToCart(item)}
                              >
                                Add to Cart
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveFromWishlist(item.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved for Later Tab */}
      {activeTab === "saved" && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Saved for Later</h5>
          </div>
          <div className="card-body">
            <div className="text-center py-4">
              <p className="text-muted mb-3">
                Items you save for later will appear here.
              </p>
              <Link to="/books" className="btn btn-primary">
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
