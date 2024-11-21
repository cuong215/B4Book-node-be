const express = require("express");
const router = express();
const passport = require("passport");
require("../passport");
const userController = require("../controllers/userController");
const { isAuth } = require("../middlewares/auth");

router.get("/", userController.loadAuth);
// router.post("/createRole", userController.createRole);

router.get("/auth/google", passport.authenticate("google", ["email", "profile"]));

router.get("/auth/google/callback", passport.authenticate('google', { failureRedirect: '/failed' }), async (req, res) => {
  try {
    // Kiểm tra xem đã có user chưa
    console.log('User info:', req.user);  // Kiểm tra thông tin người dùng từ Google
    // Nếu người dùng đã được xác thực, gọi hàm GoogleLogin trong controller
    if (req.user) {
      await userController.GoogleLogin(req, res); 
    }
   
  } catch (error) {
    res.redirect("/failed");
  }
  
});



router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

// facebook root
router.get("/auth/facebook",passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

// facebook callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: '/failed' }), async (req, res) => {
    try {
      // Kiểm tra xem đã có user chưa
      console.log('User info:', req.user);  // Kiểm tra thông tin người dùng từ Google

      if (req.user) {
        await userController.FacebookLogin(req, res);  // Chắc chắn rằng GoogleLogin được gọi sau khi xác thực thành công
      }
    } catch (error) {
      res.redirect("/failed");
    }
  }
);


router.get("/Userprofile", isAuth, userController.showProfile);
router.get("/successLoginFacebook", userController.FacebookLogin);
router.get("/homepage", userController.renderHomePage);
router.post("/registerShop",isAuth, userController.registerShop);
router.post("/loginWithPassword", userController.loginWithPassword);
router.put("/addPassword",isAuth, userController.addPassword);
router.get("/failed", (req, res) => {
  res.send("U are not valid user");
});


// Success
router.get("/successLoginGoogle", userController.GoogleLogin);

// failure
router.get("/failure", userController.failureGoogleLogin);

module.exports = router;
