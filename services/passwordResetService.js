const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Importez le modèle utilisateur

// Fonction de génération de mot de passe temporaire
function generateTemporaryPassword() {
    return crypto.randomBytes(8).toString('hex'); // génère un mot de passe de 16 caractères
}

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // utilisez votre service de messagerie
    auth: {
        user: 'Essaiedwalid51@gmail.com', // remplacez par votre adresse email
        pass: 'Walid12*#' // remplacez par le mot de passe de votre email
    }
});

// Fonction de réinitialisation de mot de passe
async function resetPassword(email) {
    try {
        // Vérifiez si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return { success: false, message: "L'utilisateur n'existe pas." };
        }

        // Générez un nouveau mot de passe temporaire
        const tempPassword = generateTemporaryPassword();

        // Hash du mot de passe temporaire
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Mise à jour du mot de passe dans la base de données
        user.password = hashedPassword;
        await user.save();

        // Envoyez un email avec le nouveau mot de passe
        const mailOptions = {
            from: 'Essaiedwalid51@gmail.com',
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            text: `Bonjour,\n\nVotre nouveau mot de passe est : ${tempPassword}\n\nMerci de le changer après connexion.`
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Email de réinitialisation de mot de passe envoyé.' };
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe :', error);
        return { success: false, message: 'Une erreur est survenue.' };
    }
}

module.exports = { resetPassword };
