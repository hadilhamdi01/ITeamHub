const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pseudo: { type: String, required: true },
  sexe: { type: String, required: true },
  avatar: { type: String, required: true }, 
  centresInteret: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CentreInteret' }],
  role: { type: [String], default: ['user'] },
});

module.exports = mongoose.model('User', userSchema);
