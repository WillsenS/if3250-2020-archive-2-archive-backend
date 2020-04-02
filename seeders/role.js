/* eslint-disable */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Role = require('../models/Role');

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
        kode: 1,
        nama: "Admin Pusat",
        deskripsi: "Admin Terpusat ITB"
      },
      {
        kode: 2,
        nama: "Internal ITB",
        deskripsi: "Pemilik akun INA yang telah mendaftar ADIC"
      }
    ];

    const result = await seeder(connect, Role, data);
    console.info(result);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

/* eslint-enable */
execute();
