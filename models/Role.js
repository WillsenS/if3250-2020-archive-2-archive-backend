const mongoose = require('mongoose');

/**
 * Role Interface
 * @typedef {Object} Role
 * @property {Number} kode Kode role
 * @property {String} nama Nama role
 * @property {String} deskripsi Deskripsi role
 */
const documentSchema = new mongoose.Schema(
  {
    kode: {
      type: Number,
      required: true,
      unique: true
    },
    nama: {
      type: String,
      required: true
    },
    deskripsi: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

documentSchema.index({ judul: 'text', keterangan: 'text' });
const Role = mongoose.model('Role', documentSchema);

module.exports = Role;
