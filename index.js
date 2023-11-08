const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cookieParser = require('cookie-parser')

const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ph-8.7tjeuwe.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // database and collection
    const database = client.db('assignmentsDB');
    const assignmentsCollection = database.collection('assignments');

    // assignment api
    app.post('/api/v1/create-assignment', async(req, res) => {
      const assignment = req.body;
      console.log(assignment);
      const result = await assignmentsCollection.insertOne(assignment);
      res.send(result);
    })
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assignment Server is running");
});

app.listen(port, () => {
  console.log(`Assignment Server is running on port ${port}`);
});
