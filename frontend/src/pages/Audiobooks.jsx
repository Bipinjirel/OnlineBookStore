import { Link } from "react-router-dom";

function Audiobooks() {
  return (
    <div className="container py-5">
      <h1 className="mb-4 fw-bold">Audiobooks</h1>
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-1 mb-4">🎧</div>
          <h2 className="mb-3">This is the Audiobooks page</h2>
          <p className="text-muted mb-4">
            Listen to your favorite books anytime, anywhere with our audiobooks collection.
          </p>
          <Link to="/books" className="btn btn-primary btn-lg">
            Browse Books
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Audiobooks;
