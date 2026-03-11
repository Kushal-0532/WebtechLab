const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3001;
const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "book_finder_db";
const PAGE_SIZE = 5;

let db;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Sample books to seed on first run
const SEED_BOOKS = [
  { title: "JavaScript Essentials", author: "John Smith", category: "Programming", price: 450, rating: 4.5, year: 2023 },
  { title: "Python for Beginners", author: "Alice Wang", category: "Programming", price: 380, rating: 4.2, year: 2022 },
  { title: "Data Structures & Algorithms", author: "Mark Lee", category: "Computer Science", price: 520, rating: 4.8, year: 2021 },
  { title: "MongoDB in Action", author: "Kyle Banker", category: "Database", price: 490, rating: 4.6, year: 2022 },
  { title: "Clean Code", author: "Robert C. Martin", category: "Programming", price: 410, rating: 4.7, year: 2020 },
  { title: "Design Patterns", author: "Gang of Four", category: "Computer Science", price: 560, rating: 4.5, year: 2019 },
  { title: "The Pragmatic Programmer", author: "David Thomas", category: "Programming", price: 395, rating: 4.4, year: 2021 },
  { title: "SQL Mastery", author: "Sarah Connor", category: "Database", price: 340, rating: 3.9, year: 2023 },
  { title: "Linear Algebra for ML", author: "James Brown", category: "Mathematics", price: 470, rating: 4.1, year: 2022 },
  { title: "Introduction to Calculus", author: "Maria Garcia", category: "Mathematics", price: 300, rating: 3.7, year: 2020 },
  { title: "Operating Systems Concepts", author: "Silberschatz", category: "Computer Science", price: 610, rating: 4.3, year: 2021 },
  { title: "Web Development with Node.js", author: "Tom Hardy", category: "Programming", price: 430, rating: 4.0, year: 2023 },
  { title: "React in Depth", author: "Emma Wilson", category: "Programming", price: 460, rating: 4.6, year: 2023 },
  { title: "Redis Cookbook", author: "Tiago Macedo", category: "Database", price: 360, rating: 3.8, year: 2022 },
  { title: "Statistics for Data Science", author: "Peter Blake", category: "Mathematics", price: 490, rating: 4.2, year: 2021 },
];

// Connect to MongoDB, seed if needed, then start
MongoClient.connect(MONGO_URI)
  .then(async (client) => {
    db = client.db(DB_NAME);
    console.log(`Connected to MongoDB — database: ${DB_NAME}`);

    const count = await db.collection("books").countDocuments();
    if (count === 0) {
      await db.collection("books").insertMany(SEED_BOOKS);
      console.log(`Seeded ${SEED_BOOKS.length} books into the collection.`);
    }

    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

// ─── GET all books (with pagination) ─────────────────────────────────────────
// GET /books?page=1
app.get("/books", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * PAGE_SIZE;
    const [books, total] = await Promise.all([
      db.collection("books").find().skip(skip).limit(PAGE_SIZE).toArray(),
      db.collection("books").countDocuments()
    ]);
    res.json({ books, total, page, pages: Math.ceil(total / PAGE_SIZE) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET search by title ──────────────────────────────────────────────────────
// GET /books/search?title=javascript
app.get("/books/search", async (req, res) => {
  try {
    const { title } = req.query;
    const books = await db.collection("books").find({
      title: { $regex: title || "", $options: "i" }
    }).toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET top rated books ──────────────────────────────────────────────────────
// GET /books/top
app.get("/books/top", async (req, res) => {
  try {
    const books = await db.collection("books")
      .find({ rating: { $gte: 4 } })
      .sort({ rating: -1 })
      .limit(5)
      .toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET sort books ───────────────────────────────────────────────────────────
// GET /books/sort/price  or  GET /books/sort/rating
app.get("/books/sort/:field", async (req, res) => {
  try {
    const { field } = req.params;
    if (!["price", "rating"].includes(field)) {
      return res.status(400).json({ error: "Sort field must be 'price' or 'rating'" });
    }
    const order = field === "price" ? 1 : -1; // price asc, rating desc
    const books = await db.collection("books").find().sort({ [field]: order }).toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET filter by category ───────────────────────────────────────────────────
// GET /books/category/programming
app.get("/books/category/:category", async (req, res) => {
  try {
    const books = await db.collection("books").find({
      category: { $regex: req.params.category, $options: "i" }
    }).toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET all categories (for dropdown) ───────────────────────────────────────
app.get("/categories", async (req, res) => {
  try {
    const cats = await db.collection("books").distinct("category");
    res.json(cats.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
