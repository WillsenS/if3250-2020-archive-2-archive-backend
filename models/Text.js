const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars

/**
 * Document Interface
 * @typedef {Object} Document
 * @property {String} textual_archive_number Nomor arsip tekstual
 * @property {String} author penulis/pembuat arsip tekstual
 */
const documentSchema = new mongoose.Schema(
  {
    textual_archive_number: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Document = mongoose.model('Text', documentSchema);

module.exports = Document;
