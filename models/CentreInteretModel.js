const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the CentreInteret schema
const centreInteretSchema = new Schema({
  theme: {
    type: String,
    required: true,
  },
});

const CentreInteret = mongoose.model('CentreInteret', centreInteretSchema);
module.exports = CentreInteret;