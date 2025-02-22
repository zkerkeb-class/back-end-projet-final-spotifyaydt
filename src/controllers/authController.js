import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

// Fonction pour générer le token
const login = (req, res) => {
  // Récupération des données du formulaire
  const { email, password } = req.body;

  // Pour l'instant, on crée un userData fictif sans vérification
  const userData = {
    id: 1,
    email: email,
    password: password,
    role: 'admin',
  };

  // Générer le JWT
  const token = jwt.sign(userData, SECRET_KEY, { expiresIn: '1h' });

  res.json({
    success: true,
    token,
    message: 'Connexion réussie',
  });
};

export default { login };
