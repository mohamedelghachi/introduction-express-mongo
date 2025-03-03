const { MongoClient } = require("mongodb");

async function connectToDatabase() {
  const uri = "mongodb://127.0.0.1:27017/dbmonapi"; // Replace with your connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(); // Returns the database object
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err; // Rethrow the error to be handled elsewhere
  }
}

// Example of how to use it in your express route.
const express = require("express");
const app = express();

let db; // Declare the db variable

async function initializeDb() {
  db = await connectToDatabase();
}

initializeDb()
  .then(() => {
    console.log("server startup success");

    app.get("/equipes", async (req, res) => {
      console.log("GET /equipes");
      try {
        const results = await db.collection("equipe").find({}).toArray();
        console.log(results); // Log the actual results
        res.status(200).json(results);
      } catch (err) {
        console.error("Error retrieving equipes:", err);
        res
          .status(500)
          .json({ message: "Erreur lors de la récupération des équipes" });
      }
    });

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.log("server startup failed", error);
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});
