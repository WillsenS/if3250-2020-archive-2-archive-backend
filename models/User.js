const mongoose = require('mongoose');
const { normalizeEmail } = require('validator');

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
    }
  },
  { timestamps: true }
);

userSchema.pre('save', function removeDotGmail(next) {
  const user = this;
  if (!user.email) {
    return next();
  }

  user.email = normalizeEmail(user.email);
  return next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
