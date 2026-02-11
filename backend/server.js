const express = require("express");
const cors = require("cors");
const { db } = require("./config/firebase");
const booksRouter = require("./routes/books");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const usersRouter = require("./routes/users");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes with prefixes
app.use("/books", booksRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);
app.use("/users", usersRouter);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Start server
app.listen(PORT, () => {
  console.log("Backend running on port 5000 and Firestore connected");
});
