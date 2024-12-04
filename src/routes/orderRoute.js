const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { isShop, isAuth, isCustomer } = require("../middlewares/auth");


router.get("/by-status", isAuth, OrderController.getAllOrdersByStatus);
router.get("/getAllOrderByShop/:id", isShop, OrderController.getAllOrderByShop);
router.get("/getAllOrderByCustomer/:id",isAuth, OrderController.getOrderByIdForCustomer);
router.get('/cart-data', isAuth, OrderController.getCartForOrder);
router.get("/search",isShop, OrderController.searchOrder);
router.get("/vnpay-return", OrderController.vnpayReturn);
router.get("/customer/:id", isAuth, OrderController.getCustomerOrders);
router.get("/:orderId", isShop, OrderController.getOrderByIdForShop);

// router.post("/summary", isAuth, OrderController.createOrder);
// router.post("/create_payment_url", OrderController.createVNpay);
// router.post('/stripe/webhook', isAuth, express.raw({ type: 'application/json' }), OrderController.stripeWebhook)

router.post('/place-order-vn', isAuth,  OrderController.createVNpay);



router.patch("/:orderId/cancel", OrderController.cancelOrder);
router.patch('/:orderId/status', isShop, OrderController.updateOrderStatus);

// router.patch("/:orderId/confirmed", OrderController.orderConfirmedStatus);
// router.patch("/:orderId/shipped", OrderController.orderShippedStatus);
// router.patch("/:orderId/delivered", OrderController.orderDeliveredStatus);
// router.patch("/:orderId/cancelled", OrderController.orderCancelledStatus);
// router.patch('/:orderId/status/:status', OrderController.updateOrderStatus);


module.exports = router;