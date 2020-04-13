const mongoose = require('mongoose');

const Id = mongoose.Schema.Types.ObjectId;
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
