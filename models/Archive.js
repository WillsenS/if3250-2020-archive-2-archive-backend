const mongoose = require('mongoose');
/* eslint-disable */
const Audio = require('../models/Audio');
const Video = require('../models/Video');
const Text = require('../models/Text');
const Photo = require('../models/Photo');
const File = require('../models/File');
/* eslint-enable */
/**
 * Document Interface
 * @typedef {Object} Document
 * @property {String} judul Judul arsip
 * @property {String} tipe Tipe arsip Audio/Video/Text/Photo
 * @property {String} nomor Nomor arsip
 * @property {String} pola Pola klasifikasi arsip
 * @property {String} lokasi_kegiatan Lokasi kegiatan atau lokasi pembuatan arsip
 * @property {String} keterangan Keterangan arsip
 * @property {Date} waktu_kegiatan Waktu kegiatan atau waktu pembuatan arsip
 * @property {Boolean} keamanan_terbuka Terbuka atau tidaknya keamanan arisp
 * @property {String} lokasi_simpan_arsip Lokasi di mana arsip disimpan
 * @property {String} mime Tipe mime berkas arsip
 * @property {String} audio Metadata berkas audio arsip
 * @property {String} video Metadata berkas video arsip
 * @property {String} photo Metadata berkas foto arsip
 * @property {String} text Metadata berkas text arsip
 * @property {String} file Informasi file secara general
 */
const Id = mongoose.Schema.Types.ObjectId;
const documentSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: true
    },
    tipe: {
      type: String,
      required: true
    },
    nomor: {
      type: String,
      required: true
    },
    pola: {
      type: String,
      required: true
    },
    lokasi_kegiatan: {
      type: String,
      required: true
    },
    keterangan: {
      type: String,
      required: true
    },
    waktu_kegiatan: {
      type: Date,
      required: true
    },
    keamanan_terbuka: {
      type: Boolean,
      required: true
    },
    lokasi_simpan_arsip: {
      type: String,
      required: true
    },
    mime: {
      type: String,
      required: true
    },
    audio: {
      type: Id,
      ref: 'Audio'
    },
    video: {
      type: Id,
      ref: 'Video'
    },
    photo: {
      type: Id,
      ref: 'Photo'
    },
    text: {
      type: Id,
      ref: 'Text'
    },
    file: {
      type: Id,
      ref: 'File',
      required: true
    }
  },
  { timestamps: true }
);

documentSchema.index({ judul: 'text', keterangan: 'text' });
const Archive = mongoose.model('Archive', documentSchema);

module.exports = Archive;
