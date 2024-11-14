const mongoose = require('mongoose');


const CentreInteretSchema = new mongoose.Schema({
  nom: { type: String, unique: true }
});
const CentreInteret = mongoose.model('CentreInteret', CentreInteretSchema);
module.exports = CentreInteret;  
