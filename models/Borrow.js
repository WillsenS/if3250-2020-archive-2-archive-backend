const mongoose = require('mongoose');

const Id = mongoose.Schema.Types.ObjectId;

/**
 * Borrow Interface
 * @typedef {Object} Borrow
 * @property {String} archive Id archive yang ingin dipinjam
 * @property {String} borrower Id user yang ingin meminjam
 * @property {String} phone Boroower's phone number
 * @property {String} email Boroower's email
 * @property {String} reason Boroower's reason
 */
const documentSchema = new mongoose.Schema(
  {
    archive: {
      type: Id,
      ref: 'Archive',
      required: true
    },
    borrower: {
      type: Id,
      ref: 'User',
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

const Borrow = mongoose.model('Borrow', documentSchema);

module.exports = Borrow;
