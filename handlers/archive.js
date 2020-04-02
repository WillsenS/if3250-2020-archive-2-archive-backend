/* eslint-disable no-await-in-loop */
const formidable = require('formidable');
const mv = require('mv');
const Document = require('../models/Document');
const { translateFiltersMongoose, saveModel, sendResponse } = require('../helpers');
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

    return sendResponse(res, 200, 'OK', {
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
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

const NEW_ARCHIVE = 'new';
const EDIT_ARCHIVE_NEW_FILE = 'edit-upload';

const buildArchive = async (file, fields, saveOption) => {
  if (!file.filetoupload) {
    throw new Error('Uploaded file not found');
  }

  const dataDocument = [
    {
      kode: fields.code,
      judul: fields.title,
      keterangan: fields.description,
      lokasi: fields.location
    }
  ];

  if (saveOption === NEW_ARCHIVE || saveOption === EDIT_ARCHIVE_NEW_FILE) {
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
    dataDocument[0].file = result[0]._id;

    if (saveOption === NEW_ARCHIVE) {
      // Create new document, with attr 'file' referenced to the newly file
      const resultDocument = await saveModel(Document, dataDocument);
      console.info(resultDocument);
    } else if (saveOption === EDIT_ARCHIVE_NEW_FILE) {
      // Update existing document, with attr 'file' referenced to the newly upload file
    }
  }
};

exports.getArchiveDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const findDocument = await Document.find({ _id: id });
    return sendResponse(res, 200, 'Successfully retrieved archive', { data: findDocument });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

exports.postUploadArchive = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async function(err, fields, file) {
    try {
      await buildArchive(file, fields, NEW_ARCHIVE);

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

exports.patchEditArchive = async (req, res) => {
  const { id } = req.params;
  const form = new formidable.IncomingForm();

  form.parse(req, async function(err, fields) {
    try {
      const foundDocument = await Document.find({ _id: id });

      const dataDocument = {
        kode: fields.code,
        judul: fields.title,
        keterangan: fields.description,
        lokasi: fields.location,
        file: foundDocument[0].file
      };

      Document.findOneAndUpdate({ _id: id }, dataDocument, {
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

exports.deleteArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const foundDocument = await Document.find({ _id: id });

    // eslint-disable-next-line
    let result = File.deleteOne({ _id: foundDocument[0].file });
    // eslint-disable-next-line
    result = Document.deleteOne({ _id: id });

    return sendResponse(res, 200, 'Successfully deleted archive data. Archive file still exist');
  } catch (err) {
    console.error(err);
    return sendResponse(res, 400, 'Error. Bad request');
  }
};

// Pages for testing

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
