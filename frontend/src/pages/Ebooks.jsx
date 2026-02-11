import { Link } from "react-router-dom";

function Ebooks() {
  return (
    <div className="container py-5">
      <h1 className="mb-4 fw-bold">Ebooks</h1>
      <div className="card shadow-sm">
        <div className="card-body text-center py-5">
          <div className="display-1 mb-4">📱</div>
          <h2 className="mb-3">This is the Ebooks page</h2>
          <p className="text-muted mb-4">
            Download and read ebooks instantly on your favorite devices.
          </p>
          <Link to="/books" className="btn btn-primary btn-lg">
            Browse Books
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Ebooks;
