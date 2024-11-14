const express = require('express');
const router = express.Router();
const CentreInteret = require('../models/CentreInteret');

// Route pour obtenir tous les centres d'intérêt
router.get('/api/centres_interet', async (req, res) => { // Assure-toi que le chemin est correct ici
    try {
      const centresInteret = await CentreInteret.findAll();
      res.json(centresInteret);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des centres d\'intérêt' });
    }
  });
  
  module.exports = router;
