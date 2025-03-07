const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/auth");

router.get("/allWithdrawals", isAdmin, adminController.getAllWithdraws);
router.get("/withdrawReq/:id", isAdmin, adminController.getWithdrawById);
router.patch("/withdrawals/update", isAdmin, adminController.updateWithdrawRequest);
router.put("/activeorDeactive",isAdmin, adminController.activeOrDeactive);
router.get("/showAllRegisterForm",isAdmin, adminController.showAllRegisterForm);
router.get("/search",isAdmin, adminController.searchAccount);
router.put("/approveShop/:id", isAdmin, adminController.approvedShop);
router.get("/showAllUser",isAdmin, adminController.showAllUser);
router.get("/showAllProductRegister",isAdmin, adminController.getAllProductRegister);
router.put("/approvedProduct/:id", isAdmin, adminController.approvedProduct);
module.exports = router;
