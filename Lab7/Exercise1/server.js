const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "student_notes_db";

let db;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB then start server
MongoClient.connect(MONGO_URI)
  .then((client) => {
    db = client.db(DB_NAME);
    console.log(`Connected to MongoDB — database: ${DB_NAME}`);
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

// ─── GET all notes ────────────────────────────────────────────────────────────
app.get("/notes", async (req, res) => {
  try {
    const notes = await db.collection("notes").find().sort({ created_date: -1 }).toArray();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST add a note ──────────────────────────────────────────────────────────
app.post("/notes", async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    if (!title || !subject || !description) {
      return res.status(400).json({ error: "title, subject, and description are required" });
    }
    const note = { title, subject, description, created_date: new Date() };
    const result = await db.collection("notes").insertOne(note);
    res.status(201).json({ _id: result.insertedId, ...note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT update a note ────────────────────────────────────────────────────────
app.put("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    delete update._id; // don't allow _id override
    const result = await db.collection("notes").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE a note ────────────────────────────────────────────────────────────
app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection("notes").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
