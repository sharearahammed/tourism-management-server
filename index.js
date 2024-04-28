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
    const countryNameCollection = database.collection("country");

    app.get("/country", async (req, res) => {
      const cursor = countryNameCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/country", async (req, res) => {
      const newCountry = req.body;
      console.log(newCountry);
      const result = await countryNameCollection.insertOne(newCountry);
      res.send(result);
    });



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

    // app.get("/alltouristsSpot/:country", async (req, res) => {
    //   const country = req.params.country;
    //   const query = {countryName : country};
    //   const cursor = myTouristsSpotCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

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
        projection = { email: 1 };
      } else if (isValidObjectId(identifier)) {
        query = { _id: new ObjectId(identifier) };
        projection = { _id: 1 };
      } else {
        query = { countryName: identifier };
        projection = { countryName: 1 };
      }
      const cursor = myTouristsSpotCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    function isValidObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id);
    }


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

    app.delete("/alltouristsSpot/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
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
  res.send("Roamazing Management Server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
