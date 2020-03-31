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
    photographer: {
      type: String,
      required: true
    },
    photoSize: {
      type: String,
      required: true
    },
    photoCondition: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

documentSchema.index({ judul: 'photo', keterangan: 'photo' });
const Document = mongoose.model('Photo', documentSchema);

module.exports = Document;
