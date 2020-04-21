const mongoose = require('mongoose');

/**
 * Search Interface
 * @typedef {Object} Search
 * @property {String} keywoard Kata kunci dari query yang dicari
 * @property {String} count Berapa banyak kata kunci tersebut dicari
 */
const documentSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

const Search = mongoose.model('Search', documentSchema);

module.exports = Search;
