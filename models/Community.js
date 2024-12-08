const mongoose = require('mongoose');

// Définir le schéma de la communauté
const communitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true, // Assurez-vous que les titres sont uniques
    },
  },
  { timestamps: true } // Ajoute automatiquement les champs createdAt et updatedAt
);

// Créer le modèle de la communauté
const Community = mongoose.model('Community', communitySchema);

module.exports = Community;
