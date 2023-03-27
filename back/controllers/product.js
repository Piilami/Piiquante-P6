const Sauce = require("../models/product");
const fs = require("fs");
//affichage des sauces -----------------------------------------------------
exports.displayArrayOfSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }));
};
//creer une sauce ----------------------------------------------------------
exports.createSauces = (req, res, next) => {
  // parse les éléments reçu dans la requete
  const sauceObject = JSON.parse(req.body.sauce);
  // créé un nouvel objet Sauce
  const sauces = new Sauce({
    // récupère les éléments inscrit dans le corp de la requete
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  //enregistrement dans la base de donnée --------------------------------
  sauces
    .save()
    .then(() => res.status(201).json({ message: "Sauces ajoutée avec succès" }))
    .catch((error) => res.status(400).json({ error }));
};
// page d'une sauce -----------------------------------------------------
exports.showOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

// modifier une sauce ---------------------------------------------------
exports.modifySauces = (req, res, next) => {
  let sauceObject = 0;
  if (req.file) {
    sauceObject = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    };
  } else {
    sauceObject = req.body;
  }
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // ajout d'une constante contenant les informations de la sauce qui ne devront pas être modifiée pendant la modification
      const constValue = {
        likes: sauce.like,
        dislikes: sauce.dislike,
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked,
        userId: sauce.userId,
      };
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        if (req.file) {
          const fileName = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${fileName}`, () => {});
        }
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, ...constValue, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(403).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
// supprimer une sauce ----------------------------------------------------------------------
exports.deleteSauces = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (req.auth.userId != sauce.userId) {
      res.status(403).json("unauthorized request");
    } else {
      const fileName = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${fileName}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() =>
            res.status(200).json({ message: "objet supprimé avec succès" })
          )
          .catch((error) => res.status(500).json({ error }));
      });
    }
  });
};

// liker une sauce --------------------------------------------------------------------------
exports.likesSauces = (req, res, next) => {
  let like = req.body.like;
  let userId = req.body.userId;
  let sauceId = req.params.id;
  if (like === 1) {
    Sauce.findOne({ _id: sauceId }).then((sauce) => {
      if (sauce.usersLiked.includes(userId)) {
        res.status(403).json({ message: "Like supplémentaire non autorisé" });
      } else if (sauce.usersDisliked.includes(userId)) {
        Sauce.updateOne(
          { _id: sauceId },
          { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
        ).then(() => res.status(201).json({ message: "Neutre" }));
      } else {
        Sauce.updateOne(
          { _id: sauceId },
          { $push: { usersLiked: userId }, $inc: { likes: +1 } }
        )
          .then(() => res.status(201).json({ message: "Sauce aimée" }))
          .catch((err) => res.status(500).json({ err }));
      }
    });
  } else if (like === -1) {
    Sauce.findOne({ _id: sauceId }).then((sauce) => {
      if (sauce.usersDisliked.includes(userId)) {
        res
          .status(403)
          .json({ message: "Dislike supplémentaire non autorisé" });
      } else if (sauce.usersLiked.includes(userId)) {
        Sauce.updateOne(
          { _id: sauceId },
          { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
        ).then(() => res.status(200).json({ message: "Neutre" }));
      } else {
        Sauce.updateOne(
          { _id: sauceId },
          { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
        )
          .then(() => res.status(201).json({ message: "Sauce Dislike" }))
          .catch((err) => res.status(500).json({ err }));
      }
    });
  } else if (like === 0) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then(() => res.status(200).json({ message: "Neutre" }))
            .catch((error) => res.status(500).json({ error }));
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
          )
            .then(() => res.status(200).json({ message: "Neutre" }))
            .catch((error) => res.status(500).json({ error }));
        }
      })
      .catch((error) => res.status(500).json({ error }));
  }
};
