const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const User = require('./models/User');

const app = express();
const SECRET_KEY = 'abcd1234';
const RESET_PASSWORD_SECRET = 'resetSecret1234'; // Clé secrète pour les tokens de réinitialisation

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

// Route d'inscription
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
    }
});

// Route de connexion
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
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

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
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

// Lancer le serveur
app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
