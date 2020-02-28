const mongoose = require('mongoose');
const fs = require('fs');

/**
 * File Interface
 * @typedef {Object} File
 * @property {String} originalname Original name from uploader's device
 * @property {String} encoding Type of encoding used in this file
 * @property {String} filename Name of file in server
 * @property {String} mimetype type of mime in this file
 * @property {String} url Location to file's resource
 * @property {String} size Size of file
 * @property {String} path path of file
 */
const fileSchema = new mongoose.Schema(
  {
    originalname: String,
    encoding: String,
    filename: {
      type: String,
      unique: true
    },
    mimetype: String,
    url: String,
    size: String,
    path: String
  },
  {
    timestamps: true
  }
);

fileSchema.pre('remove', function(next) {
  const file = this;
  fs.unlink(file.path, err => {
    if (err) {
      return next(err);
    }
    return next();
  });
});

const File = mongoose.model('File', fileSchema);
module.exports = File;