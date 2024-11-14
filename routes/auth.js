const express = require('express');
const router = express.Router();
const { resetPassword } = require('../services/passwordResetService');

router.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    const result = await resetPassword(email);
    if (result.success) {
        res.status(200).json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

module.exports = router;
