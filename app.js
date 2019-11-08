var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var util = require('util')
var favicon = require('serve-favicon');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const CosmosClient = require('@azure/cosmos').CosmosClient;

const config = require('./config');

const endpoint = config.endpoint;
const key = config.key;

const client = new CosmosClient({ endpoint, key });

const HttpStatusCodes = { NOTFOUND: 404 };

const databaseId = config.database.id;
const containerId = config.container.id;
const partitionKey = { kind: "Hash", paths: ["/id"] };

async function createDatabase() {
  await client.databases.createIfNotExists({ id: databaseId });
}

async function readDatabase() {
  const { resource: databaseDefinition } = await client.database(databaseId).read();
  console.log(`Reading database:\n${databaseDefinition.id}\n`);
}

async function createContainer() {
  await client.database(databaseId).containers.createIfNotExists({ id: containerId, partitionKey }, { offerThroughput: 400 });
}

async function readContainer() {
  const { resource: containerDefinition } = await client.database(databaseId).container(containerId).read();
  console.log(`Reading container:\n${containerDefinition.id}\n`);
}

async function createFamilyItem(itemBody) {
  await client.database(databaseId).container(containerId).items.upsert(itemBody);
};

async function queryContainer(queryvalue) {
  console.log(`Querying container:\n${queryvalue}`)


  const querySpec = {
    query: "SELECT * FROM c WHERE c.id = @query",
    parameters: [
      {
        name: '@query',
        value: queryvalue
      }
    ]
  }

  const { resources } = await client.database(databaseId).container(containerId).items.query(querySpec, { enableCrossPartitionQuery: true }).fetchAll();
  for (var queryResult of resources) {
    var resultString = JSON.stringify(queryResult);
    app.set('resultString', resultString);
    console.log(`\tQuery returned ${resultString}\n`);
  }
};

async function replaceFamilyItem(itemBody) {
  console.log(`Replacing item:\n${itemBody.id}\n`);
 const { item } = await client.database(databaseId).container(containerId).item(itemBody.id).replace(itemBody);
};

createDatabase()
  .then(() => readDatabase())
  .then(() => createContainer())
  .then(() => readContainer())
  .then(() => createFamilyItem(config.items.BasicDeck))
  .catch((error) => { exit(error) });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.dbquery = async (req) => {
  const query = queryContainer(req)
  await query
}

app.dbupdate = async (req) => {
  const replace = replaceFamilyItem(req.body)
  await replace
}

module.exports = app;