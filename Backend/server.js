const dotenv = require("dotenv");
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
dotenv.config({ path: "./config.env" });
const cors = require("cors");

const app = express();
// const mongoose = require("mongoose");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

let database;
app.use(cors()); // Library for testing
app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to database");
});

app.get("/projectI-api", (req, res) => {
  database
    .collection("constant")
    .find({})
    .toArray((err, result) => {
      if (err) throw err;
      res.status(200).json({
        status: "success",
        len: result.length,
        data: result,
      });
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server start at port ${port}`);
  MongoClient.connect(
    DB,
    {
      useNewUrlParser: true,
    },
    (err, result) => {
      if (err) throw err;
      database = result.db("dielectric");
      console.log("Database connect");
    }
  );
});
