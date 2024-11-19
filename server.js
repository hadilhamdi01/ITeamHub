const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const User = require('./models/User');
const CentreInteret = require('./models/CentreInteret');

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
app.post('/register', async (req, res) => {
    const { email, password, pseudo, sexe, avatar, centresInteret } = req.body;

    try {
        // Enregistre un nouvel utilisateur avec les centres d'intérêt sélectionnés
        const newUser = new User({
            email,
            password, 
            pseudo,
            sexe,
            avatar,
            centresInteret,
            roles: ['user'],
        });

        await newUser.save();
        res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'utilisateur' });
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
// Route de connexion
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email, roles: user.roles }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ message: 'Connexion réussie', token });
        } else {
            res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});





// Route pour demander la réinitialisation de mot de passe
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Générer un token de réinitialisation de mot de passe
        const resetToken = jwt.sign({ email: user.email }, RESET_PASSWORD_SECRET, { expiresIn: '1h' });

        // Configurer Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'essaiedwali51@gmail.com',
                pass: 'Walid12*#',
            },
        });

        const resetLink = `http://192.168.1.15:3000/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: '"Votre Application" essaiedwali51@gmail.com',
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email de réinitialisation envoyé' });
    } catch (err) {
        console.error('Erreur lors de l\'envoi de l\'email:', err);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }
});

// Route pour réinitialiser le mot de passe
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, RESET_PASSWORD_SECRET);
        const email = decoded.email;

        // Trouver l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Hacher le nouveau mot de passe et l'enregistrer
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', err);
        res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
    }
});
// Route pour réinitialiser le mot de passe
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, RESET_PASSWORD_SECRET);
        const email = decoded.email;

        // Trouver l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Hacher le nouveau mot de passe et l'enregistrer
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', err);
        res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
    }
});

const centresInteretRoutes = require('./routes/centresInteret');
app.use(centresInteretRoutes); // Utilise les routes des centres d'intérêt

// Lancer le serveur
app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});