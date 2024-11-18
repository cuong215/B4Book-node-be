const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/auth");


router.get("/showAllRegisterForm",isAdmin, adminController.showAllRegisterForm);
router.put("/:id", isAdmin, adminController.approvedShop);


module.exports = router;
