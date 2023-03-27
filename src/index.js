// Third-party
const { log } = require('node-wit');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require('dotenv').config();


// Internal
const movies = require('./movie-functions');
const WitService = require('./wit-service').default;
const DBConnection = require('./db').default;


const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

const sqlClient = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const conn = new DBConnection(sqlClient);

app.get('/', function (req, res) {
  res.render('index', {
    text: "", intents: [],
    entities: [], queryResults: []
  });
});

app.post('/ask-movies', async (req, res) => {
  try {
    let data = await WitService.query(req.body.question);
    console.log(data);
    let intents = data.intents || [];
    let entities = data.entities || [];
    let queryResults = [];
    let renderData = {
      text: "Sorry, I don't understand your question.",
      intents: intents,
      entities: entities,
      queryResults: queryResults,
    };

    if (intents.length > 0 && entities.length > 0) {
      renderData.text = data.text;
      // A question should only have one intent
      intentName = data.intents[0].name;
      // A question may contain multiple entities for a complex question
      let queryEntities = [];
      data.entities.forEach(item => {
        queryEntities.push(item.value);
      });
      result = await movies.mappingFunc[intentName](queryEntities, conn);
      console.log(`query result ${JSON.stringify(result)}`);
      renderData.queryResults = result;
    };

    res.render('index', renderData);
  } catch (e) {
    console.error(e);
    // res.render('error_page');
  };
}
);

app.listen(process.env.PORT, () => {
  console.log(`Movie Bot listening on port ${process.env.PORT}`)
})
