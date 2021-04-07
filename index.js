const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');


const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o08lr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());



var serviceAccount = require("./grocery-store-953f6-firebase-adminsdk-tbqdh-96e422d4ea.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const port = 5000



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

  const collection = client.db("groceryStore").collection("products");
  app.post('/addProduct', (req, res) => {
    const product = req.body;
    collection.insertOne(product)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })



  app.get('/products', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail, queryEmail)
          if (tokenEmail == req.query.email) {

            collection.find({ email: req.query.email })
              .toArray((err, documents) => {
                res.send(documents);
              })
          }
        })
        .catch((error) => {
          // Handle error
        });
    }
  })

});



app.listen(port)