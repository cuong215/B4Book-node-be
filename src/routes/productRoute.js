const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");


router.get("/",  productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/title", productController.getAllProductsByTitle);
router.get("/category/:name", productController.getProductsByCategoryName);

router.post("/",  productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;