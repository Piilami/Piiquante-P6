require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const userRoutes = require("./routes/user");
const saucesRoutes = require("./routes/product");
const helmet = require("helmet");

// ajout de helmet pour corriger certaines failles
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));

// ajout de headers pour regler le problème des CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Ressource-Policy", "same-site");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
// connection à la BDD

mongoose
  .connect(process.env.BDD_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.log("Connexion à MongoDB échouée !" + err));
app.use(express.json());

// ------------------------------------------------------------------- création de routes ---------------------------------------------------------------------------------------
// SignUp login
app.use("/api/auth", userRoutes);

// affichage/création sauces
app.use("/api/sauces", saucesRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
module.exports = app;
