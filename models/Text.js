const mongoose = require('mongoose');

/**
 * Text Interface
 * @typedef {Object} Text
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

const Text = mongoose.model('Text', documentSchema);

module.exports = Text;
