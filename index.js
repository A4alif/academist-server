const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const submitAssignmentsCollection = database.collection('submitAssignments');

    // assignment api

    app.get('/api/v1/all-assignments', async(req, res) => {

      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
      if(req.query?.difficultyLevel){
        query = {difficultyLevel: req.query.difficultyLevel}
      }
      const cursor = assignmentsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/api/v1/all-assignments/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await assignmentsCollection.findOne(query);
      res.send(result);
    })

    app.post('/api/v1/create-assignment', async(req, res) => {
      const assignment = req.body;
      
      const result = await assignmentsCollection.insertOne(assignment);
      res.send(result);
    })

    app.put('/api/v1/update-assignment/:id', async(req, res) => {
      const id = req.params.id;
      const updateAssignment = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedAss = {
        $set: {
          title: updateAssignment.title,
          thumbnail: updateAssignment.thumbnail,
          marks: updateAssignment.marks,
          description: updateAssignment.description,
          dueDate: updateAssignment.dueDate,
          difficultyLevel: updateAssignment.difficultyLevel,
          author:updateAssignment.author,
          email:updateAssignment.email
          
        },
      };
      const result = await assignmentsCollection.updateOne(
        filter,
        updatedAss,
        options
      );
      res.send(result);
    })

    app.delete('/api/v1/all-assignments/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await assignmentsCollection.deleteOne(query);
      res.send(result);
    })

    // submit assignment api

    app.get('/api/v1/submit-assignments', async(req, res) => {
      let query = {}
      if(req.query?.submitUserEmail){
        query = {submitUserEmail: req.query.submitUserEmail}
      }
      
      const cursor = submitAssignmentsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/api/v1/submit-assignments/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await submitAssignmentsCollection.findOne(query);
      res.send(result);
    })

    app.post('/api/v1/submit-assignments', async(req, res) => {
      const submitAssignment = req.body;
      const result = await submitAssignmentsCollection.insertOne(submitAssignment);
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
