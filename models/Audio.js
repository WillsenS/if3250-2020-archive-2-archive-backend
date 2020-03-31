const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const File = require('../models/File');

/**
 * Document Interface
 * @typedef {Object} Document
 * @property {String} kode Kode dari arsip
 * @property {String} judul Judul dari arsip
 * @property {String} keterangan Keterangan dari arsip
 * @property {String} lokasi Lokasi arsip
 * @property {String} file File arsip
 */
const Id = mongoose.Types.ObjectId;
const documentSchema = new mongoose.Schema(
  {
    archive: {
      type: Id,
      ref: 'Archive'
    },
    narrator: {
      type: String,
      required: true
    },
    reporter: {
      type: String,
      required: true
    },
    activityDescription: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Document = mongoose.model('Audio', documentSchema);

module.exports = Document;
