const formidable = require('formidable');
const mv = require('mv');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const Archive = require('../models/Archive');
const File = require('../models/File');
const Audio = require('../models/Audio');
const Video = require('../models/Video');
const Text = require('../models/Text');
const Photo = require('../models/Photo');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const { translateFiltersMongoose, sendResponse } = require('../helpers');

const secret = 'mysecretsshhh';

const isValid = async user => {
  const { _id } = user;
  const foundUser = await User.findById(_id);

  return (
    user.username === foundUser.username &&
    user.fullname === foundUser.fullname &&
    user.mail === foundUser.mail &&
    user.mailNonITB === foundUser.mailNonITB &&
    user.ou === foundUser.ou &&
    user.status === foundUser.status
  );
};

exports.isAuthArchive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const foundArchive = await Archive.findById(id);

    if (!foundArchive.keamanan_terbuka) {
      const bearerHeader = req.headers.authorization;

      if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        const decode = jwt.verify(bearerToken, secret);
        const valid = await isValid(decode.user);

        if (decode.user && valid) {
          req.session.user = decode.user;
        }
      }

      const foundBorrow = await Borrow.find({
        borrower: req.session.user._id,
        archive: id,
        createdAt: { $gte: moment().subtract(7, 'days') },
        status: 2
      });

      if (foundBorrow.length > 0) {
        return next();
      }

      return sendResponse(res, 401, "You're not allowed to acces this archive");
    }

    return next();
  } catch (e) {
    console.error(e);
    return sendResponse(res, 500, 'Error: Bad Request');
  }
};

exports.searchArchive = async (req, res) => {
  try {
    let { q, page } = req.query;
    const { filters } = req.query;
    let options = null;

    q = q || '';
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

    const limit = 3;
    const searchQuery = {
      $text: {
        $search: q
          .split(' ')
          .map(str => `"${str}"`)
          .join(' ')
      }
    };

    let where = searchQuery;

    console.log(where);

    if (filters) {
      options = translateFiltersMongoose(filters);
      where = { $and: [where, options] };
    }

    if (q === '*') {
      where = undefined;
    }

    const countArchive = await Archive.countDocuments(where);
    const findArchive = await Archive.find(where)
      .populate('audio')
      .populate('photo')
      .populate('video')
      .populate('text')
      .limit(limit)
      .skip((page - 1) * limit);

    findArchive.forEach(async element => {
      if (element.keamanan_terbuka) {
        // eslint-disable-next-line
        element.file = await File.findById(element.file);
      }
    });

    let qs = '?';
    const qsNameList = ['q', 'filters'];

    [q, filters].forEach((val, index) => {
      if (qs === '?') {
        if (val) qs += `${qsNameList[index]}=${val}`;
      } else if (val) qs += `&${qsNameList[index]}=${val}`;
    });

    const totalPages = Math.ceil(countArchive / limit);
    const baseLink = `${process.env.BASE_URL}/api/v1/search`;
    const nextLink = totalPages > page ? `${baseLink}${qs}&page=${page + 1}` : '#';
    const prevLink = page > 1 ? `${baseLink}${qs}&page=${page - 1}` : '#';

    // NEW Filter
    const filterAttr = ['tipe', 'pola', 'lokasi_kegiatan', 'lokasi_simpan_arsip', 'mime'];

    // OLD Filter
    // const filterAttr = ['lokasi', 'kode'];

    const filtersCandidate = {};

    for (let i = 0; i < filterAttr.length; i += 1) {
      const val = filterAttr[i];
      const findDistictAttribute = await Archive.find(where).distinct(val);
      filtersCandidate[val] = findDistictAttribute.sort();
    }

    return sendResponse(res, 200, 'OK', {
      data: findArchive,
      count: countArchive,
      currentPage: page,
      totalPages,
      filtersCandidate,
      nextLink,
      prevLink
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.latestArchive = async (req, res) => {
  try {
    const limit = 5;
    const findArchive = await Archive.find({
      keamanan_terbuka: true
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return sendResponse(res, 200, 'OK', {
      data: findArchive
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

const saveMetadata = async fields => {
  let metadataDoc;
  let data;
  switch (fields.tipe) {
    case 'Audio':
      data = {
        narrator: fields.narrator,
        reporter: fields.reporter,
        activity_description: fields.activity_description
      };
      metadataDoc = await Audio.create(data);
      break;
    case 'Photo':
      data = {
        photographer: fields.photographer,
        photo_type: fields.photo_type,
        photo_size: fields.photo_size,
        photo_condition: fields.photo_condition,
        activity_description: fields.activity_description
      };
      metadataDoc = await Photo.create(data);
      break;
    case 'Text':
      data = {
        textual_archive_number: fields.textual_archive_number,
        author: fields.author
      };
      metadataDoc = await Text.create(data);
      break;
    case 'Video':
      data = {
        narrator: fields.narrator,
        reporter: fields.reporter,
        activity_description: fields.activity_description
      };
      metadataDoc = await Video.create(data);
      break;
    default:
      throw new Error('Invalid archive type');
  }
  return metadataDoc;
};

const buildArchive = async (file, fields) => {
  if (!file.filetoupload) {
    throw new Error('Uploaded file not found');
  }

  const dataArchive = {
    judul: fields.judul,
    tipe: fields.tipe,
    nomor: fields.nomor,
    pola: fields.pola,
    lokasi_kegiatan: fields.lokasi_kegiatan,
    keterangan: fields.keterangan,
    waktu_kegiatan: fields.waktu_kegiatan,
    keamanan_terbuka: fields.keamanan_terbuka > 0,
    lokasi_simpan_arsip: fields.lokasi_simpan_arsip,
    mime: fields.mime
  };

  // Create new file object
  const dataFile = {
    originalname: file.filetoupload.name,
    filename: file.filetoupload.name,
    mimetype: file.filetoupload.type,
    size: file.filetoupload.size,
    path: process.env.UPLOAD_DIR + file.filetoupload.name
  };

  const fileDoc = await File.create(dataFile);

  // eslint-disable-next-line
  dataArchive.file = fileDoc._id;

  const metadataDoc = await saveMetadata(fields);

  /* eslint-disable */
  switch (fields.tipe) {
    case 'Audio':
      dataArchive.audio = metadataDoc._id;
      break;
    case 'Photo':
      dataArchive.photo = metadataDoc._id;
      break;
    case 'Text':
      dataArchive.text = metadataDoc._id;
      break;
    case 'Video':
      dataArchive.video = metadataDoc._id;
      break;
    default:
      throw new Error('Invalid archive type');
  }
  /* eslint-enable */

  // Create new archive
  // Attr 'file' referenced to the newly uploaded file
  // Metadata attr referenced to object with metadata of file
  const archiveDoc = await Archive.create(dataArchive);
  console.info(archiveDoc);
};

exports.getArchiveTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const foundArchive = await Archive.findById(id);

    return sendResponse(res, 200, 'Successfully retrieved archive', {
      data: foundArchive.judul
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.getArchiveDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const foundArchive = await Archive.findById(id)
      .populate('file')
      .populate('audio')
      .populate('photo')
      .populate('video')
      .populate('text');

    return sendResponse(res, 200, 'Successfully retrieved archive', {
      data: foundArchive
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.downloadArchive = async (req, res) => {
  const { id } = req.params;
  try {
    const foundArchive = await Archive.findById(id).populate('file');

    const file =
      process.env.NODE_PATH +
      process.env.PUBLIC_DIR +
      process.env.UPLOAD_DIR +
      foundArchive.file.filename;

    return res.download(file, err => {
      if (err) {
        console.error(err);
        return sendResponse(res, 400, 'Error. Bad request');
      }
      return sendResponse(res, 200, 'Successfully downloaded');
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

const buildArchiveFromForm = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, file) => {
    try {
      await buildArchive(file, fields);

      if (!file.filetoupload) {
        throw new Error('Uploaded file not found');
      }
      const oldpath = file.filetoupload.path;
      const newpath =
        process.env.NODE_PATH +
        process.env.PUBLIC_DIR +
        process.env.UPLOAD_DIR +
        file.filetoupload.name;

      console.log(newpath);
      mv(oldpath, newpath, () => {
        return 1;
      });

      return sendResponse(res, 200, 'Successfully added and uploaded archive');
    } catch (e) {
      console.error(e);
      return sendResponse(res, 400, 'Error. Bad request');
    }
  });
};

exports.postUploadArchive = async (req, res) => {
  await buildArchiveFromForm(req, res);
};

exports.patchEditArchive = async (req, res) => {
  const { id } = req.params;
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields) => {
    try {
      const foundArchive = await Archive.findById(id);

      const dataArchive = {
        judul: fields.judul,
        tipe: fields.tipe,
        nomor: fields.nomor,
        pola: fields.pola,
        lokasi_kegiatan: fields.lokasi_kegiatan,
        keterangan: fields.description,
        waktu_kegiatan: fields.waktu_kegiatan,
        keamanan_terbuka: fields.keamanan_terbuka > 0,
        lokasi_simpan_arsip: fields.lokasi_simpan_arsip,
        mime: fields.mime,
        file: foundArchive.file
      };

      const options = {
        upsert: false,
        useFindAndModify: false
      };

      let data;
      switch (dataArchive.tipe) {
        case 'Audio':
          data = {
            narrator: fields.narrator,
            reporter: fields.reporter,
            activity_description: fields.activity_description
          };
          await Audio.findByIdAndUpdate(foundArchive.audio, data, options);

          dataArchive.audio = foundArchive.audio;
          break;
        case 'Photo':
          data = {
            photographer: fields.photographer,
            photo_type: fields.photo_type,
            photo_size: fields.photo_size,
            photo_condition: fields.photo_condition,
            activity_description: fields.activity_description
          };
          await Photo.findByIdAndUpdate(foundArchive.photo, data, options);

          dataArchive.photo = foundArchive.photo;
          break;
        case 'Text':
          data = {
            textual_archive_number: fields.textual_archive_number,
            author: fields.author
          };
          await Text.findByIdAndUpdate(foundArchive.text, data, options);

          dataArchive.text = foundArchive.text;
          break;
        case 'Video':
          data = {
            narrator: fields.narrator,
            reporter: fields.reporter,
            activity_description: fields.activity_description
          };
          await Video.findByIdAndUpdate(foundArchive.video, data, options);

          dataArchive.video = foundArchive.video;
          break;
        default:
          throw new Error('Invalid archive type');
      }

      await Archive.findByIdAndUpdate(id, dataArchive, options);

      return sendResponse(res, 200, 'Successfully edited archive');
    } catch (e) {
      console.error(e);
      return sendResponse(res, 400, 'Error. Bad request');
    }
  });
};

const deleteArchiveById = async id => {
  const foundArchive = await Archive.findById(id);

  let result = await File.findByIdAndDelete(foundArchive.file);

  switch (foundArchive.tipe) {
    case 'Audio':
      result = await Audio.findByIdAndDelete(foundArchive.audio);
      break;
    case 'Photo':
      result = await Photo.findByIdAndDelete(foundArchive.photo);
      break;
    case 'Text':
      result = await Text.findByIdAndDelete(foundArchive.text);
      break;
    case 'Video':
      result = await Video.findByIdAndDelete(foundArchive.video);
      break;
    default:
      throw new Error('Invalid archive type');
  }

  result = await Archive.findByIdAndDelete(id);

  return result;
};

exports.putEditArchive = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteArchiveById(id);
    await buildArchiveFromForm(req, res);

    return sendResponse(res, 200, 'Successfully replaced archive');
  } catch (e) {
    console.error(e);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.deleteArchive = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteArchiveById(id);

    return sendResponse(res, 200, 'Successfully deleted archive data. Archive file still exist');
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.getStatistic = async (req, res) => {
  try {
    const totalArchive = await Archive.countDocuments({});
    const audio = await Archive.countDocuments({ tipe: { $eq: 'Audio' } });
    const video = await Archive.countDocuments({ tipe: { $eq: 'Video' } });
    const text = await Archive.countDocuments({ tipe: { $eq: 'Text' } });
    const photo = await Archive.countDocuments({ tipe: { $eq: 'Photo' } });
    const totalUsers = await User.countDocuments({});
    const admin = await User.countDocuments({ role: { $eq: 1 } });
    const user = totalUsers - admin;
    return sendResponse(res, 200, 'OK', {
      archives: {
        total: totalArchive,
        audio,
        video,
        text,
        photo
      },
      users: {
        total: totalUsers,
        admin,
        user
      }
    });
  } catch (e) {
    console.error(e);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

// Pages for testing

const uploadUpperLayout = (res, type) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<meta charset="UTF-8">');
  res.write('<!DOCTYPE html>');
  res.write('<html>');
  res.write('<head>');
  res.write(
    '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">'
  );
  res.write('</head>');
  res.write('<body>');
  res.write('<div class="container">');
  res.write(`<form action="/api/v1/upload" method="post" enctype="multipart/form-data">`);
  res.write('<div>Judul: <input type="text" name="judul"></div><br>');
  res.write(`<div>Tipe: <input type="text" name="tipe" value=${type}></div><br>`);
  res.write('<div>Nomor: <input type="text" name="nomor"></div><br>');
  res.write('<div>Pola: <input type="text" name="pola"></div><br>');
  res.write('<div>Lokasi Kegiatan: <input type="text" name="lokasi_kegiatan"></div><br>');
  res.write('<div>Keterangan: <input type="text" name="keterangan"></div><br>');
  res.write('<div>Waktu Kegiatan: <input type="text" name="waktu_kegiatan"></div><br>');
  res.write('<div>Keamanan terbuka?: <input type="number" name="keamanan_terbuka"></div><br>');
  res.write('<div>Lokasi simpan arsip: <input type="text" name="lokasi_simpan_arsip"></div><br>');
  res.write('<div>Mime: <input type="text" name="mime"></div><br>');
  res.write('<div>File: <input type="file" name="filetoupload"></div><br>');
};

const uploadLowerLayout = res => {
  res.write('<input type="submit">');
  res.write('</form>');
  res.write('</div>');
  res.write('</body>');
  res.write('</html>');
};

exports.uploadAudio = (req, res) => {
  // Upload Photo Archive
  uploadUpperLayout(res, 'Audio');

  res.write('<div>Narrator: <input type="text" name="narrator"></div><br>');
  res.write('<div>Reporter: <input type="text" name="reporter"></div><br>');
  res.write('<div>Activity Description: <input type="text" name="activity_description"></div><br>');

  uploadLowerLayout(res);
  return res.end();
};

exports.uploadPhoto = (req, res) => {
  // Upload Photo Archive
  uploadUpperLayout(res, 'Photo');

  res.write('<div>Fotografer: <input type="text" name="photographer"></div><br>');
  res.write('<div>Photo Type: <input type="text" name="photo_type"></div><br>');
  res.write('<div>Photo Size: <input type="text" name="photo_size"></div><br>');
  res.write('<div>Photo Condition: <input type="text" name="photo_condition"></div><br>');
  res.write('<div>Activity Description: <input type="text" name="activity_description"></div><br>');

  uploadLowerLayout(res);
  return res.end();
};

exports.uploadText = (req, res) => {
  // Upload Photo Archive
  uploadUpperLayout(res, 'Text');

  res.write(
    '<div>Textual Archive Number: <input type="text" name="textual_archive_number"></div><br>'
  );
  res.write('<div>Author: <input type="text" name="author"></div><br>');

  uploadLowerLayout(res);
  return res.end();
};

exports.uploadVideo = (req, res) => {
  // Upload Photo Archive
  uploadUpperLayout(res, 'Video');

  res.write('<div>Narrator: <input type="text" name="narrator"></div><br>');
  res.write('<div>Reporter: <input type="text" name="reporter"></div><br>');
  res.write('<div>Activity Description: <input type="text" name="activity_description"></div><br>');

  uploadLowerLayout(res);
  return res.end();
};

exports.postNewBorrowRequest = async (req, res) => {
  try {
    const { user } = req.session;
    const { idArchive, phone, email, reason } = req.body;

    const data = {
      archive: idArchive,
      borrower: user._id,
      phone,
      email,
      reason,
      status: 0
    };

    const createBorrow = await Borrow.create(data);
    return sendResponse(res, 200, 'OK', createBorrow);
  } catch (e) {
    console.error(e);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};
