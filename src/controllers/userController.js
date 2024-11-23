const path = require("path");
const User = require("../models/user");
const Role = require("../models/role");
const Shop = require("../models/shop");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const WishlistProduct = require("../models/wishlistProduct");
const Product = require("../models/product");
dotenv.config();
const loadAuth = (req, res) => {
  res.render(path.join(__dirname, "../views/user.ejs"));
};

const GoogleLogin = async (req, res) => {
  if (!req.user || !req.user.email || !req.user.name) {
    return res.status(400).send("User data is missing.");
  }

  try {
    // Kiểm tra nếu người dùng đã tồn tại với Google login
    let user = await User.findOne({
      email: req.user.email,
      isActive: true,
      authProvider: "google",
    });

 
    const customerRole = await Role.findOne({ name: "Customer" });

    if (!user) {

      user = await User.create({
        email: req.user.email,
        userName: `${req.user.name.givenName} ${req.user.name.familyName}`,
        lastLogin: Date.now(),
        isActive: true,
        avatar: req.user.photos ? req.user.photos[0].value : '', 
        authProvider: "google",
        role: customerRole ? [customerRole._id] : [],
      });
      console.log("User created successfully:", user);
    }

    // Tạo JWT token cho người dùng
    const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
      expiresIn: "5m",
    });
    return res.json({
      message: "Login success",
      verifyToken,
    })
  } catch (error) {
    console.error("Error in Google login:", error);
    return res.status(500).send("An error occurred during Google login.");
  }
};

const addPassword = async (req, res) => {
  const { passWord } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user._id,{
      passWord:passWord},
      { new: true });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    console.log(user);
    return res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
  }
};

// function login by facebook
const FacebookLogin = async (req, res) => {
  if (!req.user) res.redirect("/failure");
  console.log(req.user);
  const email = req.user.emails
    ? req.user.emails[0].value
    : "Email not provided";

  if (!req.user || !email || !req.user.displayName) {
    return res.status(400).send("User data is missing.");
  }

  try {
    let user = await User.findOne({
      email: email,
      isActive: true,
      authProvider: "facebook",
    });
    const customerRole = await Role.findOne({
      name: "Admin",
    });
    if (!user) {
      user = await User.create({
        email: email,
        userName: req.user.displayName,
        lastLogin: Date.now(),
        isActive: true,
        avartar: req.user.photos[0].value,
        role: customerRole ? [customerRole._id] : [],
        authProvider: "facebook",
      });
      console.log("Create Success");
    }
    const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
      expiresIn: "5m",
    });
    return res.json({
      message: "Login success",
      verifyToken,
    })
  } catch (error) {
    console.error("Error in successFacebookLogin:", error);
    res.status(500).send("An error occurred during Facebook login.");
  }
};

const loginWithPassword = async(req,res) =>{
  const {email, passWord} = req.body;
  try {
    const user = await User.findOne({
     email:email,
     passWord:passWord  
    });
    if(!user){
      return res.status(404).send({message:"User not found"});
    }
    const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
      expiresIn: "5m",
    });
    res.json({
      success: true,
      message: "Login success",
      verifyToken,
    });
  }catch(error){
    Console.log(error)
  }
  
}

// render home page and verify token
const verifyToken = (req, res) => {
  try {
    const { verifyToken } = req.body;
    
    if (verifyToken) {

      const verify = jwt.verify(verifyToken, process.env.Activation_sec);
      if (!verify) {
        return res.status(404).send({ message: "Token not valid" });
      }
      const token = jwt.sign({ _id: verify.user._id }, process.env.Jwt_sec, {
        expiresIn: "5d",
      });
      
      return res.json({
        success: true,
        message: "verify success",
        token,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// show profile for user
const showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {}
};

// function register from normal user become a seller
const registerShop = async (req, res) => {
    try {
        const { shopName, shopEmail, shopAddress, phoneNumber, avartar } = req.body;
        const reg = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)*$/;
        const isCheckEmail = reg.test(shopEmail);
        if (!shopEmail || !shopName || !shopAddress || !phoneNumber || !avartar ) {
            return res.status(400).send({ message: "The input is required" });
        }
       else if(!isCheckEmail){
            return res.status(400).send({ message: "Email is not valid" });
        }
        const respone = await Shop.create({
            shopName: shopName, 
            shopEmail: shopEmail,
            shopAddress:shopAddress, 
            phoneNumber:phoneNumber,
            avartar:avartar,
            isActive: false,
            isApproved: false,
            user: req.user._id
        });
        res.status(200).json(respone);
    } catch (error) {
        
    }
};

// add product to wishlist
const addWishlistProduct = async (req, res) => {
  try {
    // find product by id
    const product = await Product.findById(req.params.id);
    // check if product not found
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    // find user by 
    const user = await User.findById(req.user._id);
    // check user if user not found
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // find wishlist product by product id and user id
    const wishlistProduct = await WishlistProduct.findOne({
      product: product._id,
      user: user._id,
    })
    // if wishlist product is existed return 
    if (wishlistProduct) {
      return res.status(400).send({ message: "Product already added to wishlist" });
    }

    // add wishlist product into database
    await WishlistProduct.create({
      product: product._id,
      user: user._id,
    })
    // respond with success message
    res.status(200).send({ message: "Product added to wishlist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// delete product from wishlist
const deleteWishlistProduct = async (req, res) => {
  try {
    // find wishlist product by id and delete it
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    const wishlistProduct = await WishlistProduct.findOneAndDelete({
      product: product._id,
      user: req.user._id,
    })
    
    // check if wishlist not found
    if (!wishlistProduct ) {
      return res.status(404).send({ message: "Product does not exist in wishlist" });
    }

    // respond status with success message
    res.status(200).send({ message: "Product deleted from wishlist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// const createRole = async (req, res) => {
//   try {
//     const { name } = req.body; // Lấy thuộc tính "name" từ body
//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }

//     const result = await Role.create({ name });
//     res.status(201).json(result); // Trả về JSON kèm mã 201 (Created)
//   } catch (error) {
//     console.error(error); // Ghi log lỗi để debug
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

module.exports = {
  loadAuth,
  GoogleLogin,
  FacebookLogin,
  verifyToken,
  showProfile,
  registerShop,
  loginWithPassword,
  addPassword,
  addWishlistProduct,
  deleteWishlistProduct
};
