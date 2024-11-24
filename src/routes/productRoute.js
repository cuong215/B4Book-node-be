const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { isShop, isAuth } = require("../middlewares/auth");
const upload = require("../utils/multer");

router.post("/upload", upload.array("images", 10), productController.uploadImages);
router.get("/search", productController.searchProduct);
router.get("/filter", productController.filterProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/create", upload.array("images", 10),  productController.createProduct);
router.put("/:id", upload.array("images", 10), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.delete("/:id/remove-image", productController.removeImage);
router.get("/showRating/:id", productController.showRating);
router.put("/feedback/:id", isAuth, productController.feebackProduct);

module.exports = router;
