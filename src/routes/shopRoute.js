const express = require('express');
const router = express.Router();
const shop = require("../controllers/shopController");
const upload = require("../utils/multer");
const { isShop } = require('../middlewares/auth');

router.get("/search", shop.searchShop);
router.post("/createVoucher",isShop,upload.array("image", 1), shop.createVoucher);
router.post("/withdraws",isShop, shop.createWithdrawRequest);
router.get("/withdraws", isShop, shop.getWithdrawsByShopId);
router.get("/getAllVoucher", shop.getAllVoucher);
router.get("/searchVoucher", shop.searchVoucherForShop);
router.put("/activeorDeactiveVoucher",isShop, shop.activeOrDeactiveVoucher);
router.post("/address/add", isShop, shop.addAddress);
router.put("/address/update/:id", isShop, shop.updateAddress);
router.delete("/address/delete/:id", isShop, shop.deleteAddress);
router.put("/deleteVoucher/:id",isShop, shop.deleteVoucher);
router.put("/updateVoucher/:id",isShop,upload.array("image", 1), shop.updateVoucher);
router.put("/updateShopInfo", upload.array("images", 1), isShop, shop.updateShopInfo);
router.get("/", shop.getAllShop);
router.get("/getAllVoucherForShop/:id", shop.getAllVoucherForShop);
router.get("/totalShop", shop.getTotalShop);
router.get("/totalRevenue", shop.getAllTotalRevenueForMonth);
router.get("/monthlyRevenue", shop.getMonthlyRevenue);
router.get("/:id", shop.getValueVoucher);

module.exports = router;
