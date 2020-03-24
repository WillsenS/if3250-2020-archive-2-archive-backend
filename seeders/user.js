/* eslint-disable */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

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

const seeder = (connector, resource, data) =>
  new Promise(async (resolve, reject) => {
    try {
      const connection = await connector;
      if (connection) {
        const promiseArray = data.map(item => {
          const newItem = new resource(item);
          return newItem.save();
        });

        const result = await Promise.all(promiseArray);
        resolve(result);
      }
      throw new Error('Connection could not be established');
    } catch (e) {
      reject(e);
    }
  });

const execute = async () => {
  try {
    const data = [
      {
        username: 'hendry',
        fullname: 'hendryfull',
        mail: 'hendry@students.itb.ac.id',
        mainNonITB: 'hendry@gmail.com',
        ou: 'undefined',
        status: 'undefined'
      },
      {
        username: 'abda',
        fullname: 'abdafull',
        mail: 'abda@students.itb.ac.id',
        mainNonITB: 'abda@gmail.com',
        ou: 'undefined',
        status: 'undefined'
      },
      {
        username: 'willsen',
        fullname: 'willsenfull',
        mail: 'willsen@students.itb.ac.id',
        mainNonITB: 'willsen@gmail.com',
        ou: 'undefined',
        status: 'undefined'
      },
      {
        username: 'harry',
        fullname: 'harryfull',
        mail: 'harry@students.itb.ac.id',
        mainNonITB: 'harry@gmail.com',
        ou: 'undefined',
        status: 'undefined'
      },
      {
        username: 'ijun',
        fullname: 'ijunfull',
        mail: 'ijun@students.itb.ac.id',
        mainNonITB: 'juniardi@gmail.com',
        ou: 'undefined',
        status: 'undefined'
      },
      {
        username: 'alterhendry',
        fullname: 'hendryfull2',
        mail: 'hendry2@students.itb.ac.id',
        mainNonITB: 'hendry2@gmail.com',
        ou: 'undefined',
        status: 'undefined'
      },
      {
        username: 'alternhendry2',
        fullname: 'hendryfull3',
        mail: 'hendry3@students.itb.ac.id',
        mainNonITB: 'hendry3@gmail.com',
        ou: 'undefined',
        status: 'undefined'
      }
    ];

    const result = await seeder(connect, User, data);
    console.info(result);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

/* eslint-enable */
execute();
