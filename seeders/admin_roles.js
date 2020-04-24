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
        nama: 'FITB',
        kode: 3,
        deskripsi: 'FITB'
      },
      {
        nama: 'FMIPA',
        kode: 4,
        deskripsi: 'FMIPA'
      },
      {
        nama: 'FSRD',
        kode: 5,
        deskripsi: 'FSRD'
      },
      {
        nama: 'FTI',
        kode: 6,
        deskripsi: 'FTI'
      },
      {
        nama: 'FTMD',
        kode: 7,
        deskripsi: 'FTMD'
      },
      {
        nama: 'FTTM',
        kode: 8,
        deskripsi: 'FTTM'
      },
      {
        nama: 'FTSL',
        kode: 9,
        deskripsi: 'FTSL'
      },
      {
        nama: 'SAPPK',
        kode: 10,
        deskripsi: 'SAPPK'
      },
      {
        nama: 'SBM',
        kode: 11,
        deskripsi: 'SBM'
      },
      {
        nama: 'SF',
        kode: 12,
        deskripsi: 'SF'
      },
      {
        nama: 'SITH-S',
        kode: 13,
        deskripsi: 'SITH-S'
      },
      {
        nama: 'SITH-R',
        kode: 14,
        deskripsi: 'SITH-R'
      },
      {
        nama: 'STEI',
        kode: 15,
        deskripsi: 'STEI'
      },
      {
        nama: 'DITRENC',
        kode: 16,
        deskripsi: 'DITRENC'
      },
      {
        nama: 'DIERRENC',
        kode: 17,
        deskripsi: 'DIERRERNC'
      },
      {
        nama: 'LLH',
        kode: 18,
        deskripsi: 'LLH'
      },
      {
        nama: 'DIT AU',
        kode: 19,
        deskripsi: 'DIT AU'
      },
      {
        nama: 'DITPEG',
        kode: 20,
        deskripsi: 'DITPEG'
      },
      {
        nama: 'DITKHI',
        kode: 21,
        deskripsi: 'DITKHI'
      },
      {
        nama: 'DIT HUA',
        kode: 22,
        deskripsi: 'DIT HUA'
      },
      {
        nama: 'DIT BANG',
        kode: 23,
        deskripsi: 'DIT BANG'
      },
      {
        nama: 'DIT RENC',
        kode: 24,
        deskripsi: 'DIT RENC'
      },
      {
        nama: 'DITLOG',
        kode: 25,
        deskripsi: 'DITLOG'
      },
      {
        nama: 'DIT SP',
        kode: 26,
        deskripsi: 'DIT SP'
      },
      {
        nama: 'DITKEU',
        kode: 27,
        deskripsi: 'DITKEU'
      },
      {
        nama: 'DITSP',
        kode: 28,
        deskripsi: 'DITSP'
      },
      {
        nama: 'UPT K3L',
        kode: 29,
        deskripsi: 'UPT K3L'
      },
      {
        nama: 'DITSTI',
        kode: 30,
        deskripsi: 'DITSTI'
      },
      {
        nama: 'DIT STI/E-Learning',
        kode: 31,
        deskripsi: 'DIT STI/E-Learning'
      },
      {
        nama: 'UPT PMO',
        kode: 32,
        deskripsi: 'UPT PMO'
      },
      {
        nama: 'LPPM',
        kode: 33,
        deskripsi: 'LPPM'
      },
      {
        nama: 'SPI',
        kode: 34,
        deskripsi: 'SPI'
      },
      {
        nama: 'DITDIK',
        kode: 35,
        deskripsi: 'DITDIK'
      },
      {
        nama: 'BPUDL',
        kode: 36,
        deskripsi: 'BPUDL'
      },
      {
        nama: 'UUP Penerbit',
        kode: 37,
        deskripsi: 'UUP Penerbit'
      },
      {
        nama: 'UPT Perpustakaan',
        kode: 38,
        deskripsi: 'UPT Perpustakaan'
      },
      {
        nama: 'Lab/Studio',
        kode: 39,
        deskripsi: 'Lab/Studio'
      },
      {
        nama: 'DT HUA',
        kode: 40,
        deskripsi: 'DT HUA'
      },
      {
        nama: 'LPIK',
        kode: 41,
        deskripsi: 'LPIK'
      },
      {
        nama: 'MWA',
        kode: 42,
        deskripsi: 'MWA'
      },
      {
        nama: 'SA',
        kode: 43,
        deskripsi: 'SA'
      },
      {
        nama: 'FGB',
        kode: 44,
        deskripsi: 'FGB'
      },
      {
        nama: 'Komite Audit',
        kode: 45,
        deskripsi: 'Komite Audit'
      }
    ];

    const result = await seeder(connect, Role, data);
    console.info(result);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

execute();
