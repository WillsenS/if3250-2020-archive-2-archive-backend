const mongoose = require('mongoose');

/**
 * Document Interface
 * @typedef {Object} Document
 * @property {String} narrator Narrator dari berkas arsip
 * @property {String} reporter Reporter dari berkas arsip
 * @property {String} activity_description Deskripsi kegiatan / topik dari berkas audio
 */
const documentSchema = new mongoose.Schema(
  {
    narrator: {
      type: String,
      required: true
    },
    reporter: {
      type: String,
      required: true
    },
    activity_description: {
      type: String
    }
  },
  { timestamps: true }
);

const Audio = mongoose.model('Audio', documentSchema);

module.exports = Audio;
