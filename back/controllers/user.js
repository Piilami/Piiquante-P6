const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwtoken = require("jsonwebtoken");
require("dotenv").config();

// création fonction signup --------------------------------------------------------
exports.signup = (req, res, next) => {
  // utilisation de la fonction pour hasher le mot de passe de bcrypt
  const validEmail = new RegExp(
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    "gm"
  );
  const validPassword = new RegExp(/^.*(?=.{8,}).*$/, "gm");
  if (
    validPassword.test(req.body.password) === true &&
    validEmail.test(req.body.email) === true
  ) {
    bcrypt
      .hash(req.body.password, 10)
      //création du nouvel utilisateur avec le mot de passe Hashé
      .then((result) => {
        const user = new User({
          email: req.body.email,
          password: result,
        });
        // sauvegarde de cet utilisateur dans la BDD
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    res.status(400).json({ message: "mot de passe non conforme" });
  }
};

// création de la fonction login --------------------------------------------------------
exports.login = (req, res, next) => {
  // utilisation de la fonction findOne de mongoDB pour rechercher l'email dans la BDD
  User.findOne({ email: req.body.email })
    .then((user) => {
      // si l'adresse est trouvée comparaison entre le Hash du mot de passe entré et celui du hash contenu dans la BDD
      if (user) {
        bcrypt.compare(req.body.password, user.password).then((pswd) => {
          // si comparaison valide renvoie un status 200 et création d'un token grace a la fonction sign de jsonwebtoken
          if (pswd) {
            res.status(200).json({
              userId: user._id,
              token: jwtoken.sign(
                {
                  userId: user._id,
                },
                process.env.RANDOM_TOKEN,
                { expiresIn: "1h" }
              ),
            });
          } else {
            // si comparaison entre le Hash et le mot de passe non valide renvoie status 401 accès non authorisé et une erreur
            return res.status(401).json({ error: "Mot de passe Incorrect" });
          }
        });
        //si l'adresse mail ne correspond pas a une adresse contenue dans la BDD renvoi status 401 et une erreur
      } else {
        return res.status(401).json({ error: "Utilisateur non trouvé" });
      }
    })
    // s'il y a un problème renvoie un status 500 "internal server Error"
    .catch((error) => res.status(500).json({ error }));
};
