const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const CentreInteret = require('./models/CentreInteret');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const SECRET_KEY = 'abcd1234';
const RESET_PASSWORD_SECRET = 'resetSecret1234';

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/iteam', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((err) => console.error('Erreur de connexion à MongoDB :', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());





// POST /register
// Route d'inscription
app.post('/register', async (req, res) => {
    const { email, password, role, pseudo, sexe, avatar, centresInteret } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Cryptage du mot de passe
      const user = new User({ email, password: hashedPassword, role: ['admin'],pseudo,
        sexe,
        avatar,
        centresInteret, });
      await user.save();
      res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (err) {
      if (err.code === 11000) {
        res.status(400).json({ message: 'Email déjà utilisé.' });
      } else {
        res.status(500).json({ message: 'Erreur du serveur.' });
      }
    }
  });
  
 
app.get('/api/centres_interet', async (req, res) => { // Assure-toi que le chemin est correct ici
    try {
      const centresInteret = await CentreInteret.findAll();
      res.json(centresInteret);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des centres d\'intérêt' });
    }
  });


  


// Route de connexion
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Utilisateur non trouvé.' });
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: 'Mot de passe incorrect.' });
    }
  
    // Si tout va bien, envoyer une réponse réussie
    res.json({
      status: 'success',
      token: 'some-jwt-token', // Exemple de jeton à renvoyer
      role: user.role, // Exemple de rôle
    });
  });
  


// Route pour demander la réinitialisation de mot de passe
// Configurer le transporteur SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail', // Utilisez votre fournisseur de service de messagerie (ici Gmail)
    auth: {
      user: 'Essaiedwalid51@gmail.com',
      pass: 'Walid12*#', // Utilisez un mot de passe spécifique ou un mot de passe d'application si nécessaire
    },
  });

// Route pour envoyer un email de réinitialisation de mot de passe
app.post('/reset-password', async (req, res) => {
    const { email } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé.' });
    }
  
    // Générer un jeton de réinitialisation de mot de passe
    const token = crypto.randomBytes(20).toString('hex');
  
    // Mettre à jour l'utilisateur avec ce jeton (ajoutez un champ 'resetToken' et une date d'expiration)
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // Expiration dans 1 heure
    await user.save();
  
    // Créer le lien pour la réinitialisation
    const resetLink = `http://votre-domaine.com/reset-password/${token}`;
  
    // Configurer l'email
    const mailOptions = {
      from: 'Essaiedwalid51@gmail.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
    };
  
    // Envoyer l'email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ status: 'error', message: 'Erreur lors de l\'envoi de l\'email.' });
      }
      res.status(200).json({ status: 'success', message: 'Email envoyé.' });
    });
  });
  app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Le lien de réinitialisation est invalide ou a expiré.' });
    }
  
    // Hasher le nouveau mot de passe et mettre à jour l'utilisateur
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
  
    res.status(200).json({ status: 'success', message: 'Mot de passe réinitialisé avec succès.' });
  });
  
const centresInteretRoutes = require('./routes/centresInteret');
app.use(centresInteretRoutes); // Utilise les routes des centres d'intérêt

// Lancer le serveur
app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});