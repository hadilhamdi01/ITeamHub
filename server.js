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
      const user = new User({ email, password: hashedPassword, role: ['user'],pseudo,
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
  







  // Route pour réinitialiser le mot de passe
  app.post('/reset-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Vérifiez si l'utilisateur existe dans la base de données
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      // Générer un nouveau mot de passe (exemple simple)
      const newPassword = Math.random().toString(36).slice(-8);
  
      // Mettre à jour le mot de passe dans la base de données
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      // Configurer Nodemailer pour envoyer l'email
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Vous pouvez utiliser un autre service SMTP
        auth: {
          user: 'essaiedwalid51@gmail.com', // Votre adresse email
          pass: 'goqt ndvi vlja jaoz', // Mot de passe ou App Password (Gmail)
        },
      });
  
      // Contenu de l'email
      const mailOptions = {
        from: 'essaiedwalid51@gmail.com', // Adresse de l'expéditeur
        to: email, // Adresse de destination
        subject: 'Réinitialisation de votre mot de passe',
        text: `Bonjour,\n\nVoici votre nouveau mot de passe : ${newPassword}\n\nMerci de vous connecter avec ce nouveau mot de passe et de le changer dès que possible.`,
      };
  
      // Envoyer l'email
      await transporter.sendMail(mailOptions);
  
      console.log(`Email envoyé à ${email} avec le mot de passe : ${newPassword}`);
      res.status(200).json({ message: 'Un email avec un nouveau mot de passe a été envoyé.' });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe :', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  });
  




















const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  upvotes: Number,
  downvotes: Number,
  commentsCount: Number,
});

const communitySchema = new mongoose.Schema(
  {
    name: String,
    posts: [postSchema],
  },
  { collection: "communityDB" } // Explicitly set the collection name
);

const Community = mongoose.model("Community", communitySchema); // Mongoose model

// API Route to fetch communities
app.get("/api/communities", async (req, res) => {
  try {
    const communities = await Community.find();
    if (communities.length === 0) {
      console.log("No communities found.");
      return res.status(404).json({ error: "No communities found" });
    }
    console.log("Fetched communities:", communities);
    res.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});









































  

const centresInteretRoutes = require('./routes/centresInteret');
app.use(centresInteretRoutes); // Utilise les routes des centres d'intérêt

// Lancer le serveur
app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});