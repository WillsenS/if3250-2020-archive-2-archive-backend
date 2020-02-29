/* eslint-disable no-await-in-loop */
const formidable = require('formidable');
const mv = require('mv');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { translateFiltersMongoose } = require('../helpers');
const File = require('../models/File');

exports.searchDocument = async (req, res) => {
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

    const countDocument = await Document.countDocuments(where);
    const findDocument = await Document.find(where)
      .populate('file')
      .limit(limit)
      .skip((page - 1) * limit);

    let qs = '?';
    const qsNameList = ['q', 'filters'];

    [q, filters].forEach((val, index) => {
      if (qs === '?') {
        if (val) qs += `${qsNameList[index]}=${val}`;
      } else if (val) qs += `&${qsNameList[index]}=${val}`;
    });

    const totalPages = Math.ceil(countDocument / limit);
    const baseLink = `${process.env.BASE_URL}/api/v1/search`;
    const nextLink = totalPages > page ? `${baseLink}${qs}&page=${page + 1}` : '#';
    const prevLink = page > 1 ? `${baseLink}${qs}&page=${page - 1}` : '#';

    const filterAttr = ['lokasi', 'kode'];
    const filtersCandidate = {};

    for (let i = 0; i < filterAttr.length; i += 1) {
      const val = filterAttr[i];
      const findDistictAttribute = await Document.find(where).distinct(val);
      filtersCandidate[val] = findDistictAttribute.sort();
    }

    res.json({
      data: findDocument,
      count: countDocument,
      currentPage: page,
      totalPages,
      filtersCandidate,
      nextLink,
      prevLink
    });
  } catch (err) {
    console.error(err);
  }
};

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

/* eslint-disable */
const saveModel = (connector, Resource, data) =>
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
    } catch (e) {
      reject(e);
    }
  });

/* eslint-enable */

exports.uploadArchive = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<form action="upload" method="post" enctype="multipart/form-data">');
  res.write('<div>Judul: <input type="text" name="title"></div><br>');
  res.write('<div>File: <input type="file" name="filetoupload"></div><br>');
  res.write('<div>Kode: <input type="text" name="code"></div><br>');
  res.write('<div>Description: <input type="text" name="description"></div><br>');
  res.write('<div>Location: <input type="text" name="location"></div><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
};

exports.postUploadArchive = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async function(err, fields, files) {
    const oldpath = files.filetoupload.path;
    const newpath =
      process.env.NODE_PATH +
      process.env.PUBLIC_DIR +
      process.env.UPLOAD_DIR +
      files.filetoupload.name;

    const data = [
      {
        originalname: files.filetoupload.name,
        encoding: 'undefined-encoding',
        filename: files.filetoupload.name,
        mimetype: files.filetoupload.type,
        size: files.filetoupload.size,
        path: process.env.UPLOAD_DIR + files.filetoupload.name
      }
    ];

    console.log(data);

    const result = await saveModel(connect, File, data);
    console.info(result);

    /* eslint-disable */
    const dataDocument = [
      {
        kode: fields.code,
        judul: fields.title,
        keterangan: fields.description,
        lokasi: fields.location,
        file: result[0]._id
      }
    ];
    /* eslint-enable */

    console.log(dataDocument);

    const resultDocument = await saveModel(connect, Document, dataDocument);
    console.info(resultDocument);

    mv(oldpath, newpath, function() {
      res.json({
        apiVersion: res.locals.apiVersion,
        message: 'Successfully added and uploaded archive'
      });
    });
  });
};
