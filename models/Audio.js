const mongoose = require('mongoose');

/**
 * Audio Interface
 * @typedef {Object} Audio
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
