from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, FloatField, TextAreaField, IntegerField, SubmitField
from wtforms.validators import DataRequired, Email, Length, NumberRange
from flask_cors import CORS
from config import Config
from models import db, User, Book, Order, OrderItem

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ==================== JINJA2 ROUTES ====================

@app.route("/")
def home():
    featured_books = Book.query.limit(4).all()
    return render_template("base.html", featured_books=featured_books)

@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            next_page = request.args.get("next")
            flash("Login successful!", "success")
            return redirect(next_page) if next_page else redirect(url_for("dashboard"))
        flash("Invalid email or password", "danger")
    return render_template("login.html", form=form)

@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    form = RegisterForm()
    if form.validate_on_submit():
        if User.query.filter_by(email=form.email.data).first():
            flash("Email already registered", "danger")
            return render_template("register.html", form=form)
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash("Registration successful! Please login.", "success")
        return redirect(url_for("login"))
    return render_template("register.html", form=form)

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("home"))

@app.route("/dashboard")
@login_required
def dashboard():
    if current_user.is_admin:
        orders = Order.query.order_by(Order.date_ordered.desc()).all()
        return render_template("admin_dashboard.html", user=current_user, orders=orders)
    user_orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.date_ordered.desc()).all()
    return render_template("user_dashboard.html", user=current_user, orders=user_orders)

# ==================== API ENDPOINTS ====================

@app.route("/api/books")
def get_books():
    books = Book.query.all()
    return jsonify([{
        "id": b.id,
        "title": b.title,
        "author": b.author,
        "price": b.price,
        "description": b.description,
        "cover_image": b.cover_image,
        "stock": b.stock
    } for b in books])

@app.route("/api/books/<int:id>")
def get_book(id):
    book = Book.query.get_or_404(id)
    return jsonify({
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "price": book.price,
        "description": book.description,
        "cover_image": book.cover_image,
        "stock": book.stock
    })

@app.route("/api/search")
def search_books():
    query = request.args.get("query", "").strip().lower()
    if not query:
        return jsonify([])
    books = Book.query.filter(
        db.or_(
            Book.title.ilike(f"%{query}%"),
            Book.author.ilike(f"%{query}%"),
            Book.description.ilike(f"%{query}%")
        )
    ).all()
    return jsonify([{
        "id": b.id,
        "title": b.title,
        "author": b.author,
        "price": b.price,
        "cover_image": b.cover_image,
        "stock": b.stock
    } for b in books])

# ==================== FORMS ====================

class LoginForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Login")

class RegisterForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), Length(min=3, max=50)])
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=6)])
    submit = SubmitField("Register")

class BookForm(FlaskForm):
    title = StringField("Title", validators=[DataRequired(), Length(max=100)])
    author = StringField("Author", validators=[DataRequired(), Length(max=100)])
    price = FloatField("Price", validators=[DataRequired(), NumberRange(min=0)])
    description = TextAreaField("Description")
    cover_image = StringField("Cover Image URL", validators=[Length(max=200)])
    stock = IntegerField("Stock", validators=[NumberRange(min=0)])
    submit = SubmitField("Save Book")

# ==================== SEED DATA ====================

def seed_database():
    """Seed the database with example data if it's empty."""
    with app.app_context():
        db.create_all()

        # Only seed if empty
        if Book.query.count() > 0:
            print("Database already seeded, skipping...")
            return

        # Admin + demo users
        admin = User(username="admin", email="admin@bookstore.com", is_admin=True)
        admin.set_password("admin123")
        demo = User(username="demo", email="demo@bookstore.com")
        demo.set_password("demo123")
        db.session.add_all([admin, demo])

        # Add 30 sample books with unique cover images
        books = [
            Book(title="The Great Gatsby", author="F. Scott Fitzgerald", price=1200,
                 description="Classic Jazz Age novel.", cover_image="https://covers.openlibrary.org/b/id/7222246-L.jpg", stock=20),
            Book(title="To Kill a Mockingbird", author="Harper Lee", price=1400,
                 description="Novel about racial injustice.", cover_image="https://covers.openlibrary.org/b/id/8228691-L.jpg", stock=15),
            Book(title="1984", author="George Orwell", price=1100,
                 description="Dystopian novel about surveillance.", cover_image="https://covers.openlibrary.org/b/id/12624314-L.jpg", stock=25),
            # ... add the rest of your 30 books here ...
        ]

        db.session.add_all(books)
        db.session.commit()
        print("✅ Database seeded successfully with 30 books!")

if __name__ == "__main__":
    seed_database()
    app.run(debug=True)
