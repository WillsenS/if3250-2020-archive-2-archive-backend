/* eslint-disable no-await-in-loop */
const formidable = require('formidable');
const mv = require('mv');
const Archive = require('../models/Archive');
const { translateFiltersMongoose, saveModel, sendResponse } = require('../helpers');
const File = require('../models/File');
const Audio = require('../models/Audio');
const Video = require('../models/Video');
const Text = require('../models/Text');
const Photo = require('../models/Photo');

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

    if (filters) {
      options = translateFiltersMongoose(filters);
      where = { $and: [where, options] };
    }

    const countArchive = await Archive.countDocuments(where);
    const findArchive = await Archive.find(where)
      .populate('file')
      .populate('audio')
      .populate('photo')
      .populate('video')
      .populate('text')
      .limit(limit)
      .skip((page - 1) * limit);

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

    const filterAttr = ['lokasi', 'kode'];
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

const saveMetadata = async fields => {
  let result;
  let data;
  switch (fields.tipe) {
    case 'Audio':
      data = [
        {
          narrator: fields.narrator,
          reporter: fields.reporter,
          activity_description: fields.activity_description
        }
      ];
      result = await saveModel(Audio, data);
      break;
    case 'Photo':
      data = [
        {
          photographer: fields.photographer,
          photo_type: fields.photo_type,
          photo_size: fields.photo_size,
          photo_condition: fields.photo_condition,
          activity_description: fields.activity_description
        }
      ];
      result = await saveModel(Photo, data);
      break;
    case 'Text':
      data = [
        {
          textual_archive_number: fields.textual_archive_number,
          author: fields.author
        }
      ];
      result = await saveModel(Text, data);
      break;
    case 'Video':
      data = [
        {
          narrator: fields.narrator,
          reporter: fields.reporter,
          activity_description: fields.activity_description
        }
      ];
      result = await saveModel(Video, data);
      break;
    default:
      throw new Error('Invalid archive type');
  }
  return result;
};

const buildArchive = async (file, fields) => {
  if (!file.filetoupload) {
    throw new Error('Uploaded file not found');
  }

  const dataArchive = [
    {
      judul: fields.judul,
      tipe: fields.tipe,
      nomor: fields.nomor,
      pola: fields.pola,
      lokasi_kegiatan: fields.lokasi_kegiatan,
      keterangan: fields.keterangan,
      waktu_kegiatan: fields.waktu_kegiatan,
      keamanan_terbuka: fields.keamanan_terbuka !== 0,
      lokasi_simpan_arsip: fields.lokasi_simpan_arsip,
      mime: fields.mime
    }
  ];

  // Create new file object
  const dataFile = [
    {
      originalname: file.filetoupload.name,
      filename: file.filetoupload.name,
      mimetype: file.filetoupload.type,
      size: file.filetoupload.size,
      path: process.env.UPLOAD_DIR + file.filetoupload.name
    }
  ];

  const result = await saveModel(File, dataFile);

  // eslint-disable-next-line
  dataArchive[0].file = result[0]._id;

  const metadata = await saveMetadata(fields);

  /* eslint-disable */
  switch (fields.tipe) {
    case 'Audio':
      dataArchive[0].audio = metadata[0]._id;
      break;
    case 'Photo':
      dataArchive[0].photo = metadata[0]._id;
      break;
    case 'Text':
      dataArchive[0].text = metadata[0]._id;
      break;
    case 'Video':
      dataArchive[0].video = metadata[0]._id;
      break;
    default:
      throw new Error('Invalid archive type');
  }
  /* eslint-enable */

  // Create new archive
  // Attr 'file' referenced to the newly uploaded file
  // Metadata attr referenced to object with metadata of file
  const resultArchive = await saveModel(Archive, dataArchive);
  console.info(resultArchive);
};

exports.getArchiveDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const foundArchive = await Archive.find({ _id: id })
      .populate('file')
      .populate('audio')
      .populate('photo')
      .populate('video')
      .populate('text');

    return sendResponse(res, 200, 'Successfully retrieved archive', {
      data: {
        foundArchive
      }
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

const buildArchiveFromForm = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async function(err, fields, file) {
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
      mv(oldpath, newpath, function() {
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

  form.parse(req, async function(err, fields) {
    try {
      const foundArchive = await Archive.find({ _id: id });

      const dataArchive = [
        {
          judul: fields.judul,
          tipe: fields.tipe,
          nomor: fields.nomor,
          pola: fields.pola,
          lokasi_kegiatan: fields.lokasi_kegiatan,
          keterangan: fields.description,
          waktu_kegiatan: fields.waktu_kegiatan,
          keamanan_terbuka: fields.keamanan_terbuka !== 0,
          lokasi_simpan_arsip: fields.lokasi_simpan_arsip,
          mime: fields.mime,
          file: foundArchive[0].file
        }
      ];

      switch (dataArchive[0].tipe) {
        case 'Audio':
          dataArchive[0].audio = foundArchive[0].audio;
          break;
        case 'Photo':
          dataArchive[0].photo = foundArchive[0].photo;
          break;
        case 'Text':
          dataArchive[0].text = foundArchive[0].text;
          break;
        case 'Video':
          dataArchive[0].video = foundArchive[0].video;
          break;
        default:
          throw new Error('Invalid archive type');
      }

      await Archive.findOneAndUpdate({ _id: id }, dataArchive, {
        upsert: false,
        useFindAndModify: false
      });

      return sendResponse(res, 200, 'Successfully edited archive');
    } catch (e) {
      console.error(e);
      return sendResponse(res, 400, 'Error. Bad request');
    }
  });
};

const deleteArchiveById = async id => {
  const foundArchive = await Archive.find({ _id: id });

  console.log(foundArchive[0]);
  console.log(foundArchive[0].file);

  // eslint-disable-next-line
  let result = await File.deleteOne({ _id: foundArchive[0].file });

  switch (foundArchive[0].tipe) {
    case 'Audio':
      result = await Audio.deleteOne({ _id: foundArchive[0].audio });
      break;
    case 'Photo':
      result = await Photo.deleteOne({ _id: foundArchive[0].photo });
      break;
    case 'Text':
      result = await Text.deleteOne({ _id: foundArchive[0].text });
      break;
    case 'Video':
      result = await Video.deleteOne({ _id: foundArchive[0].video });
      break;
    default:
      throw new Error('Invalid archive type');
  }
  // eslint-disable-next-line
  result = Archive.deleteOne({ _id: id });

  return result;
};

exports.putEditArchive = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteArchiveById(id);
    await buildArchiveFromForm(req, res);

    return sendResponse(res, 200, 'Successfully replace archive');
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
  res.write(`<form action="upload" method="post" enctype="multipart/form-data">`);
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
  res.write('<input type="submit">');

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
  res.write('<input type="submit">');

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
  res.write('<input type="submit">');

  uploadLowerLayout(res);
  return res.end();
};
