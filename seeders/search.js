const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Search = require('../models/Search');

dotenv.config({ path: '../.env' });

const connect = new Promise((resolve, reject) => {
  mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
    useNewUrlParser: true
  });
  mongoose.connection.on('error', err => {
    reject(err);
  });
  resolve('Mongoose is connected');
});

const seeder = (connector, Resource, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const connection = await connector;
      if (connection) {
        const promiseArray = data.map(item => {
          const newItem = new Resource(item);
          return newItem.save();
        });

        const result = await Promise.all(promiseArray);
        resolve(result);
      }
      throw new Error('Connection could not be established');
    } catch (err) {
      reject(err);
    }
  });

const execute = async () => {
  try {
    const data = [
      {
        keyword: 'rektor',
        count: '2'
      },
      {
        keyword: 'ITB',
        count: '1'
      }
    ];

    const result = await seeder(connect, Search, data);
    console.info(result);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

execute();
