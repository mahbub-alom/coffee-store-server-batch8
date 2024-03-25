const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//mongodb uri

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qud1tkv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const usersCollection = client.db("coffeeDB").collection("user");

    app.get("/coffees", async (req, res) => {
      const result = await coffeeCollection.find().toArray();
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const coffeesData = req.body;
      const result = await coffeeCollection.insertOne(coffeesData);
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(filter);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const coffeeData = req.body;

      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const coffeesUpdatedData = {
        $set: {
          name: coffeeData.name,
          quantity: coffeeData.quantity,
          supplier: coffeeData.supplier,
          taste: coffeeData.taste,
          category: coffeeData.category,
          details: coffeeData.details,
          photo: coffeeData.photo,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        coffeesUpdatedData,
        options
      );
      res.send(result);
    });

    //user collection implement is here
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updatedDoc = {
        $set: {
          lastLoginTime: user.lastLoggedAt,
        },
      };
      const result=await usersCollection.updateOne(filter,updatedDoc)
      res.send(result)
    });

    // Send a ping to confirm a successful connection
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
  res.send("coffee server is coming");
});

app.listen(port, () => {
  console.log(`coffee server running on port ${port}`);
});
