const Shop = require("../models/shop");
const Voucher = require("../models/voucher");

// Create voucher
const createVoucher = async (req, res) => {
  // create characters to generate random code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  // generate random code function
  const generateRandomCode = (length) => {
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };
  try {
    // find shop base on user._id
    const shop = await Shop.findOne({ user: req.user._id });
    // create current date to compare with valid date and expired date
    const currentDate = new Date().setHours(0, 0, 0, 0);
  
    if (!shop) throw new Error("Shop not found");

    // input voucher from user
    const { name, value, expired, valid } = req.body;
    let active = true;
    let code = generateRandomCode(20);

    // check conditions input
    if (!name || !code || !value || !expired || !valid)
      throw new Error("Missing required fields");

    if (new Date(expired).getTime() < currentDate || new Date(valid).getTime() < currentDate)
      throw new Error("Expired date must be in the future");

    if (value <= 0) throw new Error("Value must be greater than 0");

    // if valid date is in the future, set active to false
    if (new Date(valid).getTime() > Date.now()) {
      active = false;
    }

    // Create new voucher 
    const newVoucher = new Voucher({
      name,
      code: code,
      value,
      validDate: valid,
      expired: expired,
      shopId: shop._id, 
      isActive: active,
    });
    res.status(201).json(newVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get value voucher function
const getValueVoucher = async (req, res) => {
  try {
  
    // find voucherId
    const voucher = await Voucher.findById(req.params.id); 
    if (!voucher) throw new Error("Voucher not found");

    //return voucher's value 
    res.status(200).json({ value: voucher.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all voucher function
const getAllVoucher = async (req, res) => {
  try {
    const vouchers = await Voucher.find({isActive: true, isDeleted: false}).populate();
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// active or deactive vouchers
const activeOrDeactiveVoucher = async (req, res) => {
  try {
    // create current date to compare with valid date and expired date
    const currentDate = new Date().setHours(0, 0, 0, 0);

    // activate vouchers are valid
    await Voucher.updateMany(
      { validDate: { $lte: currentDate }, expired: { $gte: currentDate } },
      { isActive: true }
    );

    // Deactivate vouchers is expired
    await Voucher.updateMany(
      { expired: { $lt: currentDate } },
      { isActive: false }
    );

    // take all vouchers active
    const vouchersActive = await Voucher.find({
      isActive: true,
      expired: { $gte: currentDate },
    });

    // take all vouchers deactive
    const voucherUnActive = await Voucher.find({
      isActive: false,
      expired: { $lt: currentDate },
    });

    res.status(200).json({ vouchersActive, voucherUnActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete voucher
const deleteVoucher = async (req, res) => {
  try {
    // find voucher by id and update it, set isDeleted to true
    const voucher = await Voucher.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});
    if (!voucher) throw new Error("Voucher not found");
    res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update voucher 
const updateVoucher = async (req, res) => {
  try {
    // find voucher by id and update it
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!voucher) throw new Error("Voucher not found");
    res.status(200).json({ message: "Voucher updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// filter shop function
const filterShop = async (req, res) => {
  const { name, page = 1, limit = 10 } = req.query;

  try {
    // Chuyển page và limit về số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Tìm kiếm với pagination
    const shops = await Shop.find({ shopName: name })
      .skip((pageNumber - 1) * limitNumber) // Bỏ qua các phần tử của các trang trước
      .limit(limitNumber); // Giới hạn số lượng phần tử trong một trang

    // Đếm tổng số bản ghi
    const total = await Shop.countDocuments({ shopName: name });

    res.status(200).json({
      data: shops,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber), // Tính tổng số trang
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchShop = async (req, res) => {
  try {
    const { keyword } = req.query;

    // Kiểm tra nếu keyword không tồn tại hoặc không phải là chuỗi
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ message: "Keyword must be a non-empty string" });
    }

    // Tìm kiếm sản phẩm
    const products = await Shop.find({
      $or: [
        { shopName: { $regex: keyword, $options: "i" } },
      ],
    });

    // Trả về danh sách sản phẩm
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
   createVoucher,
  filterShop,
  getValueVoucher,
  getAllVoucher,
  activeOrDeactiveVoucher,
  deleteVoucher,
  updateVoucher
};