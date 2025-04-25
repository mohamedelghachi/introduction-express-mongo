const { MongoClient,ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middlewares/auth"); // Import the auth middleware

async function connectToDatabase() {
  const uri = "mongodb://127.0.0.1:27017/dbowfs202"; // Replace with your connection string
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

app.use(express.json()); // Middleware to parse JSON bodies

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
        const results = await db.collection("equipes").find({}).toArray();
        console.log(results); // Log the actual results
        res.status(200).json(results);
      } catch (err) {
        console.error("Error retrieving equipes:", err);
        res
          .status(500)
          .json({ message: "Erreur lors de la récupération des équipes" });
      }
    });

    app.post("/register", async (req, res) => {
      const { email, password } = req.body;
      console.log("POST /register", { email, password });
      
      const existingUser = await db.collection("users").find({ email }).toArray();
      if (existingUser.length > 0) {
        console.log("Email already exists:", existingUser.email);
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = { email, password: hashedPassword };
      await db.collection("users").insertOne(newUser);
      res.status(201).json({ message: "Utilisateur créé avec succès" });
    });


    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      console.log("POST /login", { email, password });
      const user = await db.collection("users").findOne({ email });
      console.log("user : ",user.email)
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe invalide" });
      }
      const payload = { sub: user._id.toString() };
      const token = jwt.sign(payload, "abcefgh", {
        expiresIn: "1h",
      });
      res.json({ token });
    });

    app.get("/profile", auth, async (req, res) => {
      try {
        const user = await db.collection("users").findOne({ _id: new ObjectId( ""+req.userId) });
        if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json({ email: user.email });
      } catch (err) {
        console.error("Token verification failed:", err);
        res.status(401).json({ message: "Token invalide" });
      }
    }
    );












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
