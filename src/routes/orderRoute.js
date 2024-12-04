const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { isShop, isAuth, isCustomer } = require("../middlewares/auth");
const bodyParser = require('body-parser');


router.get("/by-status", isAuth, OrderController.getAllOrdersByStatus);
router.get("/getAllOrderByShop/:id", isShop, OrderController.getAllOrderByShop);
router.get('/cart-data', isAuth, OrderController.getCartForOrder);
router.get("/vnpay-return", OrderController.vnpayReturn);
router.get("/customer/:id", isAuth, OrderController.getCustomerOrders);
router.get("/:orderId", isShop, OrderController.getOrderById);

// router.post("/summary", isAuth, OrderController.createOrder);
router.post("/place-order-stp", isAuth, OrderController.placeOrderSTP);
router.post('/stripe/webhook', isAuth, bodyParser.raw({ type: 'application/json' }), OrderController.stripeWebhook)

router.post('/place-order-vn', isAuth,  OrderController.createVNpay);


router.patch("/:orderId/cancel", OrderController.cancelOrder);
router.patch('/:orderId/status', isShop, OrderController.updateOrderStatus);

module.exports = router;