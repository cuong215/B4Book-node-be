const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/auth");

router.put("/activeorDeactive",isAdmin, adminController.activeOrDeactive);
router.get("/showAllRegisterForm",isAdmin, adminController.showAllRegisterForm);
router.get("/search",isAdmin, adminController.searchAccount);
router.put("/:id", isAdmin, adminController.approvedShop);
router.get("/showAllUser",isAdmin, adminController.showAllUser);

module.exports = router;
