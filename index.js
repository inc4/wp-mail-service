require('dotenv').config();
const express = require("express");
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const axios = require('axios');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sendgridKey = process.env.SENDGRID_KEY;

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const HTTP_PORT = 3000;

app.get("/health", (req, res, next) => res.send({status: "Ok!"}));
app.post("/send", cors(corsOptions), (req, res, next) => {
  const list_ids = [];
  const errors=[];

  if (!req.body.email){
    errors.push("No email specified");
  }

  const email = req.body.email || null;
  list_ids.push(req.body.listId)

  const data = JSON.stringify({
    list_ids,
    contacts: [
      {
        email: email
      }
    ]
  });

  console.log(data);

  const config = {
    method: 'put',
    url: 'https://sendgrid.com/v3/marketing/contacts',
    headers: { 
      'Authorization': `Bearer ${sendgridKey}`, 
      'Content-Type': 'application/json'
    },
    data : data
  };
  
  axios(config)
    .then(function (response) {
    res.send(response.data);
  })
    .catch(function (error) {
      console.log(error);
      res.send(error);
  });
});

// Start server
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT))
});

process.on('unhandledRejection', error => {
  console.log('Unhandled Rejection: ', error);
  process.exit(1);
});