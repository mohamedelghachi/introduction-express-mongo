// middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Récupérer le token depuis l’en-tête Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  // 2. Extraire le token (format "Bearer <token>")
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token mal formaté' });
  }

  // 3. Vérifier et décoder
  jwt.verify(token, "abcefgh", (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
    // 4. Conserver les infos utiles (ex : userId) dans req pour la suite
    req.userId = payload.sub;
    next();
  });
};
