const MongoClient = require('./node_modules/mongodb').MongoClient;
const assert = require('assert');
 
// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'blogs';
 
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  const db = client.db(dbName);
  insertDocuments(db, function() {
    client.close();
  });
});


const insertArticle = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('articles');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}



function addArticle(file) {
  MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    insertDocuments(db, function() {
      client.close();
    });
  });
}