const express = require("express");
const router = express.Router();
const prdctCtrl = require("../controllers/product");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get("/", auth, prdctCtrl.displayArrayOfSauces);
router.get("/:id", auth, multer, prdctCtrl.showOneSauce);
router.post("/", auth, multer, prdctCtrl.createSauces);
router.post("/:id/like", auth, prdctCtrl.likesSauces);
router.put("/:id", auth, multer, prdctCtrl.modifySauces);
router.delete("/:id", auth, multer, prdctCtrl.deleteSauces);

module.exports = router;
