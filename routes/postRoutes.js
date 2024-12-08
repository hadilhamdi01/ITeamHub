const express = require('express');
const multer = require('multer');
const router = express.Router();
const Post = require('../models/Post');
const Community = require('../models/Community'); // Importez le modèle Community

// Configuration de multer pour gérer les fichiers
const upload = multer({ dest: 'uploads/' });

router.post('/posts', upload.single('file'), async (req, res) => {
  const { community, content } = req.body; // Récupération des données
  const file = req.file;

  // Vérifiez si les données nécessaires sont présentes
  if (!community || !content) {
    return res.status(400).json({ error: 'Champs community et content sont requis.' });
  }

  try {
    // Vérifiez si la communauté existe
    const existingCommunity = await Community.findById(community);
    if (!existingCommunity) {
      return res.status(404).json({ error: 'La communauté spécifiée est introuvable.' });
    }

    // Créez un nouveau post
    const newPost = new Post({
      content,
      media: file ? file.path : null, // Enregistrez le chemin du fichier si présent
      community, // Assurez-vous d'utiliser le champ correct pour référencer la communauté
    });

    await newPost.save(); // Sauvegarde dans la base de données
    res.status(201).json({ message: 'Post ajouté avec succès.', post: newPost });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du post:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
