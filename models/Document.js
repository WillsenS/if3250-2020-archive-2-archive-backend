/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const File = require('./File');

/**
 * Document Interface
 * @typedef {Object} Document
 * @property {String} kode Kode dari arsip
 * @property {String} judul Judul dari arsip
 * @property {String} keterangan Keterangan dari arsip
 * @property {String} lokasi Lokasi arsip
 * @property {String} file File arsip
 */
const documentSchema = new mongoose.Schema(
  {
    kode: {
      type: String,
      required: true,
      unique: true
    },
    judul: {
      type: String,
      required: true
    },
    keterangan: {
      type: String,
      required: true
    },
    lokasi: {
      type: String,
      required: true
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    }
  },
  { timestamps: true }
);

documentSchema.index({ judul: 'text', keterangan: 'text' });
const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
