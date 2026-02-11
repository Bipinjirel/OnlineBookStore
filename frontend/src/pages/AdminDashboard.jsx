import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection, getDocs, query, where, orderBy,
  doc, deleteDoc, addDoc, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (!storedUser || !storedUser.isAdmin) {
        navigate("/dashboard");
        return;
      }

      setUser(storedUser);
      await fetchAllData();
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      // Fetch all books
      const booksQuery = query(collection(db, "books"), orderBy("title", "asc"));
      const booksSnapshot = await getDocs(booksQuery);
      const booksData = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(booksData);

      // Fetch all orders
      const ordersQuery = query(collection(db, "orders"), orderBy("dateOrdered", "desc"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteDoc(doc(db, "books", bookId));
        setBooks(books.filter((book) => book.id !== bookId));
        alert("Book deleted successfully!");
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book.");
      }
    }
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

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalBooksSold = orders.reduce(
    (sum, order) => sum + (order.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0),
    0
  );
  const totalOrders = orders.length;
  const lowStockBooks = books.filter((book) => (book.stock || 0) < 10);

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
          <h2 className="mb-0">Admin Dashboard</h2>
          <p className="text-muted mb-0">Manage your bookstore</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/add-book" className="btn btn-primary">
            Add New Book
          </Link>
          <button className="btn btn-outline-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3 className="mb-0">Rs. {totalRevenue.toLocaleString()}</h3>
              <p className="mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3 className="mb-0">{totalOrders}</h3>
              <p className="mb-0">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3 className="mb-0">{totalBooksSold}</h3>
              <p className="mb-0">Books Sold</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h3 className="mb-0">{books.length}</h3>
              <p className="mb-0">Total Books</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "books" ? "active" : ""}`}
            onClick={() => setActiveTab("books")}
          >
            Manage Books
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            All Orders
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Sales Reports
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="row g-4">
          {/* Recent Orders */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Orders</h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setActiveTab("orders")}
                >
                  View All
                </button>
              </div>
              <div className="card-body">
                {orders.length === 0 ? (
                  <p className="text-muted text-center py-3">No orders yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id.substring(0, 8)}</td>
                            <td>{order.customerName || "Customer"}</td>
                            <td>Rs. {order.totalAmount?.toLocaleString()}</td>
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
                              {order.dateOrdered
                                ? new Date(order.dateOrdered).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">Low Stock Alert</h5>
              </div>
              <div className="card-body">
                {lowStockBooks.length === 0 ? (
                  <p className="text-muted text-center py-3">
                    All books are well stocked!
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {lowStockBooks.slice(0, 5).map((book) => (
                      <li
                        key={book.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span className="text-truncate" style={{ maxWidth: "200px" }}>
                          {book.title}
                        </span>
                        <span className="badge bg-danger">{book.stock} left</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Books Tab */}
      {activeTab === "books" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Manage Books</h5>
            <Link to="/admin/add-book" className="btn btn-sm btn-primary">
              Add New Book
            </Link>
          </div>
          <div className="card-body">
            {books.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted mb-3">No books available.</p>
                <Link to="/admin/add-book" className="btn btn-primary">
                  Add First Book
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id}>
                        <td>
                          <img
                            src={book.cover_image || "https://via.placeholder.com/50x75?text=No+Image"}
                            alt={book.title}
                            className="rounded"
                            style={{ width: "50px", height: "75px", objectFit: "cover" }}
                          />
                        </td>
                        <td className="text-truncate" style={{ maxWidth: "200px" }}>
                          {book.title}
                        </td>
                        <td>{book.author}</td>
                        <td>
                          <span className="badge bg-secondary">{book.category}</span>
                        </td>
                        <td>Rs. {book.price?.toLocaleString()}</td>
                        <td>
                          <span className={book.stock < 10 ? "text-danger fw-bold" : ""}>
                            {book.stock}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/admin/edit-book/${book.id}`}
                            className="btn btn-sm btn-primary me-2"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            Delete
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

      {/* All Orders Tab */}
      {activeTab === "orders" && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">All Orders</h5>
          </div>
          <div className="card-body">
            {orders.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No orders placed yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
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
                          <div>
                            <strong>{order.customerName || "Customer"}</strong>
                            <br />
                            <small className="text-muted">{order.email}</small>
                          </div>
                        </td>
                        <td>{order.items?.length || 0} items</td>
                        <td>
                          <strong>Rs. {order.totalAmount?.toLocaleString()}</strong>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={order.status || "Processing"}
                            onChange={async (e) => {
                              await updateDoc(doc(db, "orders", order.id), {
                                status: e.target.value,
                              });
                              alert("Status updated!");
                            }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          {order.dateOrdered
                            ? new Date(order.dateOrdered).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              alert(`Order Details:\n${JSON.stringify(order, null, 2)}`);
                            }}
                          >
                            View
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

      {/* Sales Reports Tab */}
      {activeTab === "reports" && (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Sales Summary</h5>
              </div>
              <div className="card-body">
                <table className="table">
                  <tbody>
                    <tr>
                      <td>Total Revenue</td>
                      <td className="text-end">
                        <strong>Rs. {totalRevenue.toLocaleString()}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Total Orders</td>
                      <td className="text-end">{totalOrders}</td>
                    </tr>
                    <tr>
                      <td>Books Sold</td>
                      <td className="text-end">{totalBooksSold}</td>
                    </tr>
                    <tr>
                      <td>Average Order Value</td>
                      <td className="text-end">
                        <strong>
                          Rs.{" "}
                          {totalOrders > 0
                            ? (totalRevenue / totalOrders).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "0.00"}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Top Selling Books</h5>
              </div>
              <div className="card-body">
                {orders.length === 0 ? (
                  <p className="text-muted text-center py-3">
                    No sales data available yet.
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {Object.entries(
                      orders
                        .flatMap((order) => order.items || [])
                        .reduce((acc, item) => {
                          acc[item.title] = (acc[item.title] || 0) + item.quantity;
                          return acc;
                        }, {})
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([title, count], index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span className="text-truncate" style={{ maxWidth: "250px" }}>
                            {title}
                          </span>
                          <span className="badge bg-primary rounded-pill">
                            {count} sold
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Order Status Distribution</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {["Processing", "Shipped", "Delivered", "Cancelled"].map((status) => {
                    const count = orders.filter((o) => (o.status || "Processing") === status).length;
                    const percentage = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0;
                    return (
                      <div key={status} className="col-md-3">
                        <div className="card">
                          <div className="card-body text-center">
                            <h4 className="mb-0">{count}</h4>
                            <p className="mb-0 text-muted">{status}</p>
                            <small className="text-muted">{percentage}%</small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
