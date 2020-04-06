const mongoose = require('mongoose');

/**
 * Document Interface
 * @typedef {Object} Document
 * @property {String} photographer Fotografer dari foto
 * @property {String} photo_type Jenis foto
 * @property {String} photo_size Ukuran foto
 * @property {String} photo_condition Kondisi foto
 * @property {String} activity_description Deskripsi kegiatan pada foto
 */
const documentSchema = new mongoose.Schema(
  {
    photographer: {
      type: String,
      required: true
    },
    photo_type: {
      type: String,
      required: true
    },
    photo_size: {
      type: String,
      required: true
    },
    photo_condition: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Photo = mongoose.model('Photo', documentSchema);

module.exports = Photo;
