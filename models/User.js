const mongoose = require('mongoose');
const { normalizeEmail } = require('validator');

/**
 * User Interface
 * @typedef {Object} User
 * @property {String} username User identifier for application.
 * @property {String} fullname The fullname of user obtained from SSO ITB
 * @property {String} mail User's ITB-email obtained from SSO ITB
 * @property {String} mailNonITB User's main email obtained from SSO ITB
 * @property {String} ou ?
 * @property {String} status The status of user from SSO ITB (mahasiswa, ?)
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    fullname: {
      type: String,
      required: true
    },
    mail: {
      type: String
    },
    mailNonITB: {
      type: String
    },
    ou: {
      type: String
    },
    status: {
      type: String
    },
    role: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Normalize user email
userSchema.pre('save', function removeDotGmail(next) {
  const user = this;
  if (!user.mail || !user.mailNonITB) {
    return next();
  }

  user.mail = normalizeEmail(user.mail);
  user.mailNonITB = normalizeEmail(user.mailNonITB);
  return next();
});

userSchema.index({ fullname: 'text', username: 'text', ou: 'text', mail: 'text' });
const User = mongoose.model('User', userSchema);

module.exports = User;
