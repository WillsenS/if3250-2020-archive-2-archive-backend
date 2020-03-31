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
    name: {
      type: String,
      required: true,
      unique: false
    },
    type: {
      type: String,
      required: true,
      unique: false
    },
    judul: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    dateUploaded: {
      type: Date,
      required: true
    },
    archiveLocation: {
      type: String,
      required: true
    },
    mime: {
      type: String,
      required: true
    },
    hak_akses: {
      type: [String],
      required: true
    },
    unit_kerja_terkait: {
      type: [String],
      required: true
    },
    metadata: {
      type: Id,
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
const Document = mongoose.model('Archive', documentSchema);

module.exports = Document;
