import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NewReleases from "./pages/NewReleases";
import Recommendations from "./pages/Recommendations";
import Audiobooks from "./pages/Audiobooks";
import Ebooks from "./pages/Ebooks";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* Navbar always visible */}
        <Navbar />

        {/* Main content */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/new-releases" element={<NewReleases />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/audiobooks" element={<Audiobooks />} />
            <Route path="/ebooks" element={<Ebooks />} />
            <Route path="/profile" element={<Profile />} />

            {/* Fallback route */}
            <Route
              path="*"
              element={<h2 className="text-center mt-5">Page Not Found</h2>}
            />
          </Routes>
        </main>

        {/* Footer always visible */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
