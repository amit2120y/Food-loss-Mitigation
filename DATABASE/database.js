// const url="mongodb+srv://narottampandey7781_db_user:np123456@cluster1.gsmvpsq.mongodb.net/"

// mongodb+srv://npadd:IaSoWZuuQy9F5aI9@learn.xcxhvoy.mongodb.net/

const { MongoClient } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb+srv://narottampandey7781_db_user:np123456@cluster1.gsmvpsq.mongodb.net/';
const client = new MongoClient(url);

// Database Name
const dbName = 'dummy';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName); 
//   here we didn't use await() as it doesn't check for this db 
  const collection = db.collection('ppl');

  // the following code examples can be pasted here...


  //find
  const findResult = await collection.find({}).toArray();
  console.log('Found documents =>', findResult);

// filter

const filteredDocs = await collection.find({ a: 3 }).toArray();
console.log('Found documents filtered by { a: 3 } =>', filteredDocs);


// insert
  const insertResult = await collection.insertOne({name:"Shyam",age:40});
console.log('Inserted documents =>', insertResult);


//update:
const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
console.log('Updated documents =>', updateResult);



//remove 
const deleteResult = await collection.deleteMany({ a: 3 });
console.log('Deleted documents =>', deleteResult);

// index a collection

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());


