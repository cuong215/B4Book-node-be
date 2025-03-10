const express = require("express");
const router = express();
const passport = require('passport');
require("../passport");
const userController = require("../controllers/userController");
const { isAuth, isCustomer } = require("../middlewares/auth");
const upload = require("../utils/multer");

// router.post("/createRole", userController.createRole);

// router.get("/auth/google", passport.authenticate("google", ["email", "profile"]));

// router.get("/auth/google/callback", passport.authenticate('google', { failureRedirect: '/failed' }), async (req, res) => {
//   try {
//     // Kiểm tra xem đã có user chưa
//     console.log('User info:', req.user);  // Kiểm tra thông tin người dùng từ Google
//     // Nếu người dùng đã được xác thực, gọi hàm GoogleLogin trong controller
//     if (req.user) {
//       await userController.GoogleLogin(req, res); 
//     }
   
//   } catch (error) {
    
//   }
  
// });



// router.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect(process.env.CLIENT_URL);
// });

// // facebook root
// router.get("/auth/facebook",passport.authenticate("facebook", { scope: ["email", "public_profile"] })
// );

// // facebook callback
// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: '/failed' }), async (req, res) => {
//     try {
//       // Kiểm tra xem đã có user chưa
//       console.log('User info:', req.user);  // Kiểm tra thông tin người dùng từ Google

//       if (req.user) {
//         await userController.FacebookLogin(req, res);  // Chắc chắn rằng GoogleLogin được gọi sau khi xác thực thành công
//       }
//     } catch (error) {
//       res.redirect("/failed");
//     }
//   }
// );


router.get("/Userprofile", isAuth, userController.showProfile);
router.post("/registerShop",  upload.fields([
    { name: "images", maxCount: 1 },
    { name: "documents", maxCount: 1 }, // Cho phép tối đa 5 file tài liệu
  ]), isAuth, userController.registerShop);
router.post("/sendVerify", userController.sendVerifyCode);
router.put("/addPassword",isAuth, userController.addPassword);
router.post('/addWishlistProduct/:id',isAuth,userController.addWishlistProduct);
router.delete("/deleteWishlistProduct/:id",isAuth,userController.deleteWishlistProduct);
router.get("/showWishlist",isAuth,userController.getAllWishList);
router.put("/resetPassword", userController.resetPassword);
router.put("/updateProfile",isAuth, userController.updateProfileUser);
router.post("/address/add", isAuth, userController.addAddress);
router.put("/address/update/:id", isAuth, userController.updateAddress);
router.delete("/address/delete/:id", isAuth, userController.deleteAddress);
router.get("/switchShop",isAuth, userController.switchShop);
router.get("/showDetailShop/:id", userController.showDetailShop);

module.exports = router;
