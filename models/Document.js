const mongoose = require('mongoose');

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
