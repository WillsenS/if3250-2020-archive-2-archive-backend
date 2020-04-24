const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Archive = require('../models/Archive');
const Photo = require('../models/Photo');
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
        originalname: '1.jpg',
        filename: '1.jpg',
        mimetype: 'image/jpg',
        url: '/upload/1.jpg',
        size: '15775',
        path: '/upload/1.jpg'
      },
      {
        originalname: '.jpg',
        filename: '2.jpg',
        mimetype: 'image/jpg',
        url: '/upload/2.jpg',
        size: '15775',
        path: '/upload/2.jpg'
      },
      {
        originalname: '3.jpg',
        filename: '3.jpg',
        mimetype: 'image/jpg',
        url: '/upload/3.jpg',
        size: '15775',
        path: '/upload/3.jpg'
      },
      {
        originalname: '4.jpg',
        filename: '4.jpg',
        mimetype: 'image/jpg',
        url: '/upload/4.jpg',
        size: '15775',
        path: '/upload/4.jpg'
      },
      {
        originalname: '5.jpg',
        filename: '5.jpg',
        mimetype: 'image/jpg',
        url: '/upload/5.jpg',
        size: '15775',
        path: '/upload/5.jpg'
      },
      {
        originalname: '6.jpg',
        filename: '6.jpg',
        mimetype: 'image/jpg',
        url: '/upload/6.jpg',
        size: '15775',
        path: '/upload/6.jpg'
      },
      {
        originalname: '7.jpg',
        filename: '7.jpg',
        mimetype: 'image/jpg',
        url: '/upload/7.jpg',
        size: '15775',
        path: '/upload/7.jpg'
      }
    ];

    await seeder(connect, File, data);

    const dataPhoto = [
      {
        photographer: '-',
        photo_type: 'cetak (c)',
        photo_size: '3R, HP',
        photo_condition: 'Baik',
        activity_description: 'Deskripsi aktivitas foto 1'
      },
      {
        photographer: '-',
        photo_type: 'cetak (c)',
        photo_size: '3R, HP',
        photo_condition: 'Baik',
        activity_description: 'Deskripsi aktivitas foto 2'
      },
      {
        photographer: '-',
        photo_type: 'cetak (c)',
        photo_size: '3R, HP',
        photo_condition: 'Baik',
        activity_description: 'Deskripsi aktivitas foto 3'
      },
      {
        photographer: '-',
        photo_type: 'cetak (c)',
        photo_size: '3R, HP',
        photo_condition: 'Baik',
        activity_description: 'Deskripsi aktivitas foto 4'
      },
      {
        photographer: '-',
        photo_type: 'cetak (c)',
        photo_size: '3R, HP',
        photo_condition: 'Baik',
        activity_description: 'Deskripsi aktivitas foto 5'
      },
      {
        photographer: '-',
        photo_type: 'cetak (c)',
        photo_size: '3R, HP',
        photo_condition: 'Baik',
        activity_description: 'Deskripsi aktivitas foto 6'
      },
      {
        photographer: '-',
        photo_type: 'cetak (c)',
        photo_size: '3R, HP',
        photo_condition: 'Baik',
        activity_description: 'Deskripsi aktivitas foto 7'
      }
    ];

    const resultPhoto = await seeder(connect, Photo, dataPhoto);
    console.info(resultPhoto);

    const foundFile = await File.find().sort('originalname');
    const foundPhoto = await Photo.find();

    const dataArchive = [
      {
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 1',
        tipe: 'Photo',
        nomor: 'AF1/IP.IG/1959-1B',
        pola: 'PB.03',
        lokasi_kegiatan: 'Institut Teknologi Bandung',
        keterangan:
          'Barisan mahasiswa siap-siap menyambut kedatangan Presiden Soekarno. Mahasiswa berdiri di jalan utama kampus (depan lorong menuju LFM).',
        waktu_kegiatan: new Date(1959, 7, 17),
        keamanan_terbuka: true,
        lokasi_simpan_arsip: '-',
        mime: 'jpg'
      },
      {
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 2',
        tipe: 'Photo',
        nomor: 'AF2/IP.IG/1959-1B',
        pola: 'PB.03',
        lokasi_kegiatan: 'Institut Teknologi Bandung',
        keterangan:
          'Presiden Soekarno datang dengan mobil sedan. Bung Karno memakai payung sendiri dan duduk agak tinggi.',
        waktu_kegiatan: new Date(1959, 7, 17),
        keamanan_terbuka: true,
        lokasi_simpan_arsip: '-',
        mime: 'jpg'
      },
      {
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 3',
        tipe: 'Photo',
        nomor: 'AF3/IP.IG/1959-1B',
        pola: 'PB.03',
        lokasi_kegiatan: 'Institut Teknologi Bandung',
        keterangan:
          'Presiden Soekarno dan Rektor ITB saat itu berjalan dari pintu gerbang menuju lapangan bola.',
        waktu_kegiatan: new Date(1959, 7, 17),
        keamanan_terbuka: true,
        lokasi_simpan_arsip: '-',
        mime: 'jpg'
      },
      {
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 4',
        tipe: 'Photo',
        nomor: 'AF4/IP.IG/1959-1B',
        pola: 'PB.03',
        lokasi_kegiatan: 'Institut Teknologi Bandung',
        keterangan:
          'Mahasiswa berbagai Departemen dan Fakultas berbaris rapih di pinggir lapangan bola. Di tengah-tengah tampak prasasti yang akan ditandatangani Soerkarno masih ditutup kain putih.',
        waktu_kegiatan: new Date(1959, 7, 17),
        keamanan_terbuka: true,
        lokasi_simpan_arsip: '-',
        mime: 'jpg'
      },
      {
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 5',
        tipe: 'Photo',
        nomor: 'AF5/IP.IG/1959-1B',
        pola: 'PB.03',
        lokasi_kegiatan: 'Institut Teknologi Bandung',
        keterangan: 'Para dosen dan istri dosen duduk rapih di pinggir lapangan.',
        waktu_kegiatan: new Date(1959, 7, 17),
        keamanan_terbuka: true,
        lokasi_simpan_arsip: '-',
        mime: 'jpg'
      },
      {
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 6',
        tipe: 'Photo',
        nomor: 'AF6/IP.IG/1959-1B',
        pola: 'PB.03',
        lokasi_kegiatan: 'Institut Teknologi Bandung',
        keterangan: 'Tampak juga para guru besar duduk dengan takzim.',
        waktu_kegiatan: new Date(1959, 7, 17),
        keamanan_terbuka: true,
        lokasi_simpan_arsip: '-',
        mime: 'jpg'
      },
      {
        judul: 'Foto-foto Peresmian ITB Tahun 1959 oleh Bung Karno 7',
        tipe: 'Photo',
        nomor: 'AF7/IP.IG/1959-1B',
        pola: 'PB.03',
        lokasi_kegiatan: 'Institut Teknologi Bandung',
        keterangan: 'Rektor dan Bung Karno membuka prasasti.',
        waktu_kegiatan: new Date(1959, 7, 17),
        keamanan_terbuka: true,
        lokasi_simpan_arsip: '-',
        mime: 'jpg'
      }
    ];

    for (let i = 0; i < dataArchive.length; i += 1) {
      dataArchive[i].file = foundFile[i]._id;
      dataArchive[i].photo = foundPhoto[i]._id;
    }

    const resultArchive = await seeder(connect, Archive, dataArchive);
    console.info(resultArchive);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

execute();
