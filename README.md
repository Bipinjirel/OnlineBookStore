# Online Bookstore - Full-Stack Application

A full-stack online bookstore application built with React (frontend) and Flask (backend). Features a responsive design with Bootstrap, authentication, and a complete shopping cart experience.

## ✨ Features

### Frontend (React + Bootstrap)
- **Book Catalog** - Browse books with cover images in a responsive grid layout
- **Featured Books** - Highlighted books on the homepage
- **Book Details** - Detailed view with cover image, description, and add to cart
- **Authentication** - Login/Register with form validation (email format, password length)
- **Shopping Cart** - Add books to cart (requires login)
- **Responsive Design** - Optimized for desktop and mobile devices
- **Hero Section** - Gradient background with "Browse Books" CTA button
- **Feature Highlights** - Wide Selection, Fast Delivery, Great Prices sections

### Backend (Flask + Jinja2)
- **REST API** - Full CRUD operations for books
- **Authentication** - Flask-Login integration
- **Admin Panel** - Add, edit, delete books with images
- **Bootstrap Styling** - All templates enhanced with Bootstrap 5

### Database (SQLite + SQLAlchemy)
- **Users** - With admin/user roles
- **Books** - With title, author, price, description, cover_image, stock
- **Orders** - User orders with status tracking
- **OrderItems** - Many-to-many relationship between orders and books

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
```bash
cd online-bookstore
```

2. **Set up the backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# OR (macOS/Linux)
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

3. **Set up the frontend:**
```bash
cd ../frontend

# Install npm dependencies
npm install
```

## Running the Application

You need to run both the backend and frontend servers.

### Terminal 1 - Start Backend:
```bash
cd backend
python app.py
```

### Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend (React)**: http://localhost:5173
- **Backend (Flask)**: http://localhost:5000

## 🔐 Default Users

After running, the database is seeded with:

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Admin | admin | admin@bookstore.com | admin123 |
| User | demo | demo@bookstore.com | demo123 |

## 📚 Sample Books

12 classic books are seeded with realistic cover images:
1. The Great Gatsby - F. Scott Fitzgerald
2. To Kill a Mockingbird - Harper Lee
3. 1984 - George Orwell
4. Pride and Prejudice - Jane Austen
5. The Catcher in the Rye - J.D. Salinger
6. Brave New World - Aldous Huxley
7. The Hobbit - J.R.R. Tolkien
8. Fahrenheit 451 - Ray Bradbury
9. The Odyssey - Homer
10. Moby-Dick - Herman Melville
11. War and Peace - Leo Tolstoy
12. The Divine Comedy - Dante Alighieri

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List all books with images |
| GET | `/api/books/:id` | Get book details |
| POST | `/api/register` | User registration |
| POST | `/api/login` | User login |
| POST | `/api/orders` | Create order (requires auth) |
| GET | `/api/orders` | Get user orders |

## 📁 Project Structure

```
online-bookstore/
├── backend/
│   ├── app.py              # Flask app with API & Jinja2 routes
│   ├── config.py           # Configuration
│   ├── models.py           # SQLAlchemy models
│   ├── forms.py            # WTForms validation
│   ├── requirements.txt    # Python dependencies
│   ├── database.db         # SQLite database
│   ├── templates/          # Jinja2 templates
│   │   ├── base.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── admin_dashboard.html
│   │   ├── user_dashboard.html
│   │   ├── add_book.html
│   │   └── edit_book.html
│   └── static/
│       └── style.css
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Books.jsx
│       │   ├── BookDetails.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Dashboard.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
└── README.md
```

## 🛠️ Technologies

### Frontend
- React 18 with Vite
- React Router DOM
- Axios for API calls
- Bootstrap 5
- CSS3 with Flexbox/Grid

### Backend
- Flask 3.0
- Flask-SQLAlchemy
- Flask-Login
- Flask-WTF
- WTForms
- SQLite

## 📝 Form Validation

### Login Form
- Email: Required, valid email format
- Password: Required, minimum 6 characters

### Register Form
- Username: Required, 3-50 characters
- Email: Required, valid email format
- Password: Required, minimum 6 characters
- Confirm Password: Must match password field

## 🎨 UI Features

- **Responsive Navigation** - Collapsible navbar with proper links
- **Footer** - With quick links and contact info
- **Book Cards** - Display cover images, title, author, price
- **Stock Indicators** - Visual feedback for in-stock/out-of-stock
- **Loading States** - Spinner during data fetching
- **Form Feedback** - Error messages and success alerts

## 📄 Pages

1. **Home** (`/`) - Hero section, featured books, feature highlights
2. **Books** (`/books`) - Full catalog with search and filtering
3. **Book Details** (`/book/:id`) - Detailed view with add to cart
4. **Login** (`/login`) - User authentication with validation
5. **Register** (`/register`) - New user registration
6. **Dashboard** (`/dashboard`) - User orders or admin book management

---

MIT License
