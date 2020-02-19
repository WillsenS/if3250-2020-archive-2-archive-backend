const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const File = require('../models/File');

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
        originalname: '1.jpg',
        encoding: '7bit',
        filename: '1.jpg',
        mimetype: 'image/jpg',
        size: '15775',
        path: '/upload/1.jpg'
      },
      {
        originalname: '.jpg',
        encoding: '7bit',
        filename: '2.jpg',
        mimetype: 'image/jpg',
        size: '15775',
        path: '/upload/2.jpg'
      },
      {
        originalname: '3.jpg',
        encoding: '7bit',
        filename: '3.jpg',
        mimetype: 'image/jpg',
        size: '15775',
        path: '/upload/3.jpg'
      },
      {
        originalname: '4.jpg',
        encoding: '7bit',
        filename: '4.jpg',
        mimetype: 'image/jpg',
        size: '15775',
        path: '/upload/4.jpg'
      },
      {
        originalname: '5.jpg',
        encoding: '7bit',
        filename: '5.jpg',
        mimetype: 'image/jpg',
        size: '15775',
        path: '/upload/5.jpg'
      },
      {
        originalname: '6.jpg',
        encoding: '7bit',
        filename: '6.jpg',
        mimetype: 'image/jpg',
        size: '15775',
        path: '/upload/6.jpg'
      },
      {
        originalname: '7.jpg',
        encoding: '7bit',
        filename: '7.jpg',
        mimetype: 'image/jpg',
        size: '15775',
        path: '/upload/7.jpg'
      }
    ];

    const result = await seeder(connect, File, data);
    console.info(result);

    const foundFile = await File.find().sort('originalname');

    const dataDocument = [
      {
        kode: 'IMG1',
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 1',
        keterangan:
          'Barisan mahasiswa siap-siap menyambut kedatangan Presiden Soekarno. Mahasiswa berdiri di jalan utama kampus (depan lorong menuju LFM).',
        lokasi: 'Institut Teknologi Bandung'
      },
      {
        kode: 'IMG2',
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 2',
        keterangan:
          'Presiden Soekarno datang dengan mobil sedan. Bung Karno memakai payung sendiri dan duduk agak tinggi.',
        lokasi: 'Institut Teknologi Bandung'
      },
      {
        kode: 'IMG3',
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 3',
        keterangan:
          'Presiden Soekarno dan Rektor ITB saat itu berjalan dari pintu gerbang menuju lapangan bola.',
        lokasi: 'Institut Teknologi Bandung'
      },
      {
        kode: 'IMG4',
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 4',
        keterangan:
          'Mahasiswa berbagai Departemen dan Fakultas berbaris rapih di pinggir lapangan bola. Di tengah-tengah tampak prasasti yang akan ditandatangani Soerkarno masih ditutup kain putih.',
        lokasi: 'Institut Teknologi Bandung'
      },
      {
        kode: 'IMG5',
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 5',
        keterangan: 'Para dosen dan istri dosen duduk rapih di pinggir lapangan.',
        lokasi: 'Institut Teknologi Bandung'
      },
      {
        kode: 'IMG6',
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 6',
        keterangan: 'Tampak juga para guru besar duduk dengan takzim.',
        lokasi: 'Institut Teknologi Bandung'
      },
      {
        kode: 'IMG7',
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 7',
        keterangan: 'Rektor dan Bung Karno membuka prasasti.',
        lokasi: 'Institut Teknologi Bandung'
      }
    ];

    for (let i = 0; i < dataDocument.length; i++) {
      dataDocument[i].file = foundFile[i]._id;
    }

    const resultDocument = await seeder(connect, Document, dataDocument);
    console.info(resultDocument);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

execute();
