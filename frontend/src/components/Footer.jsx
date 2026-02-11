function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold mb-3">📚 Online Bookstore</h5>
            <p className="text-muted small mb-0">
              Your one-stop destination for discovering and purchasing books from a wide variety of genres. Happy reading!
            </p>
          </div>
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-muted text-decoration-none small">Home</a></li>
              <li><a href="/books" className="text-muted text-decoration-none small">Browse Books</a></li>
              <li><a href="/register" className="text-muted text-decoration-none small">Create Account</a></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold mb-3">Contact</h5>
            <p className="text-muted small mb-0">
              Questions? Reach out to us at<br />
              <a href="mailto:support@bookstore.com" className="text-primary">support@bookstore.com</a>
            </p>
          </div>
        </div>
        <hr className="border-secondary" />
        <div className="text-center">
          <p className="mb-0 small">© 2026 Online Bookstore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
