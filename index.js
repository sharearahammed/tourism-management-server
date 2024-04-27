const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.netgysa.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

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

    const database = client.db("touristsSpotDB");
    const touristsSpotCollection = database.collection("touristsSpot");
    const myTouristsSpotCollection = database.collection("myTouristsSpot");

    app.get("/touristsSpot", async (req, res) => {
      const cursor = touristsSpotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/touristsSpot/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await touristsSpotCollection.findOne(query);
      res.send(result); 
    });

    app.get("/alltouristsSpot", async (req, res) => {
      const cursor = myTouristsSpotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/alltouristsSpot/:identifier", async (req, res) => {
      const identifier = req.params.identifier;
      let query;
      if (identifier.includes('@')) {
        query = { email: identifier };
      } else {
        query = { _id: new ObjectId(identifier) };
      }
      const cursor = myTouristsSpotCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // app.get("/alltouristsSpot/:email", async (req, res) => {
    //   const email = req.params.email;
    //   console.log("email: ",email);
    //   const query = { email: email };
    //   const cursor = myTouristsSpotCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.post("/alltouristsSpot", async (req, res) => {
      const newtouristsSpot = req.body;
      console.log(newtouristsSpot);
      const result = await myTouristsSpotCollection.insertOne(newtouristsSpot);
      res.send(result);
    });

    app.put("/alltouristsSpot/:id", async (req, res) => {
      const updateSpot = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const objects = { upsert : true};
      const spot = {
        $set: {
          touristsSpotName: updateSpot.touristsSpotName,
          countryName: updateSpot.countryName,
          location: updateSpot.location,
          shortDescription: updateSpot.shortDescription,
          averageCost: updateSpot.averageCost,
          seasonality: updateSpot.seasonality,
          travelTime: updateSpot.travelTime,
          totaVisitorsPerYear: updateSpot.totaVisitorsPerYear,
          photo: updateSpot.photo,
        },
      };
      const result = await myTouristsSpotCollection.updateOne(
        filter,
        spot,
        objects
      );
      res.send(result);
    });

    app.delete("/alltouristsSpot/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await myTouristsSpotCollection.deleteOne(query);
      res.send(result);
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
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
