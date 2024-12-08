const express = require('express');
const router = express.Router();
const Community = require('../models/Community'); // Assurez-vous que le chemin est correct

// Route pour récupérer uniquement les noms des communautés
router.get('/communities', async (req, res) => {
  try {
    // Trouver toutes les communautés et ne récupérer que le champ "name"
    const communities = await Community.find().select('title');

    // Vérifier s'il y a des communautés
    if (communities.length === 0) {
      return res.status(404).json({ error: 'No communities found' });
    }

    // Retourner la liste des noms de communautés
    res.status(200).json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({
      error: 'Failed to fetch communities',
      details: error.message,
    });
  }
});

module.exports = router;
