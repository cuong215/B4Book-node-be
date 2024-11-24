const Product = require("../models/product");
// const Category = require("../models/category");
const cloudinary = require("../utils/cloudinary");

exports.uploadImages = async (req, res) => {
  try {
    const files = req.files; // Các file từ Multer
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }
    const imageUrls = files.map((file) => file.path); // URL trả về từ Cloudinary

    res.status(200).json({ message: "Images uploaded successfully", imageUrls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body; // URL của hình ảnh cần xóa

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    // Lấy public_id từ URL
    const publicId = imageUrl.split("/").pop().split(".")[0];

    // Xóa hình ảnh trên Cloudinary
    await cloudinary.uploader.destroy(`products/${publicId}`);

    // Xóa URL khỏi mảng images
    product.images = product.images.filter((url) => url !== imageUrl);
    await product.save();

    res.status(200).json({ message: "Image removed successfully", product });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    // Tìm và tăng countClick lên 1
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { countClick: 1 } }, // Sử dụng $inc để tăng giá trị trường countClick
      { new: true } // Tùy chọn này trả về bản ghi đã được cập nhật
    );

    console.log(product);

    if (product) {
      res.json(product);
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      author,
      publisher,
      description,
      ISBN,
      language,
      stock,
      isApproved,
      isDeleted,
      shopId,
    } = req.body;

    const images = req.files.map((file) => file.path); // Lấy URL từ Cloudinary

    const product = new Product({
      title,
      category,
      price,
      author,
      publisher,
      description,
      ISBN,
      language,
      stock,
      isApproved,
      isDeleted,
      shopId,
      images,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      author,
      publisher,
      description,
      ISBN,
      language,
      stock,
      isApproved,
      isDeleted,
    } = req.body;

    const images = req.files?.map((file) => file.path) || []; // Lấy URL nếu có file mới

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    // Cập nhật các trường
    product.title = title || product.title;
    product.category = category || product.category;
    product.price = price || product.price;
    product.author = author || product.author;
    product.publisher = publisher || product.publisher;
    product.description = description || product.description;
    product.ISBN = ISBN || product.ISBN;
    product.language = language || product.language;
    product.stock = stock || product.stock;
    product.isApproved = isApproved || product.isApproved;
    product.isDeleted = isDeleted || product.isDeleted;

    // Thêm hình ảnh mới nếu có
    if (images.length > 0) {
      product.images.push(...images);
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const id = req.body.id;
  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isDeleted = true;
    await product.save();

    req.flash("success", "Product deleted successfully");
    return res.redirect("/products"); // Đổi URL đến trang phù hợp
  } catch (error) {
    console.error("Error during soft delete:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.feebackProduct = async (req, res) => {
  try {
    const { rating, comment } = req.body; 
    const productId = req.params.id; 
    const user = req.user._id;
    const product = await Product.findByIdAndUpdate(productId, { $inc: { numberOfRating: 1} }, { new: true });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.feedBacks.push({ userId: user, rating: rating, comment: comment });
    await product.save();
    res.status(200).json({
      message: "Ratting updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating ratting",
      error: error.message,
    });
  }
};

exports.showRating = async (req, res) => {
  try {
    const productId = req.params.id; 
    const product = await Product.findById(productId);

    // check if product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // check if product has no feedback
    if (product.feedBacks.length === 0) {
      return res.status(200).json({
        message: "No ratings available yet for this product",
        averageRating: 0,
      });
    }

    // filter product feedback (rating not null)
    const validFeedbacks = product.feedBacks.filter((fb) => fb.rating !== null && fb.rating !== undefined);

    // if product has no valid feedback
    if (validFeedbacks.length === 0) {
      return res.status(200).json({
        message: "No valid ratings available for this product",
        averageRating: 0,
      });
    }

    // calculate average ratingResult
    const totalRating = validFeedbacks.reduce((acc, cur) => acc + cur.rating, 0);
    product.ratingResult = totalRating / validFeedbacks.length;

    res.status(200).json({
      message: "Rating calculated successfully",
      total: product.ratingResult,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving product rating",
      error: error.message,
    });
  }
};

exports.updateFeedbacks = async (req, res) => {
  try {
    const productId = req.params.id; 
    const product = await Product.findById(productId);

    // check if product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const feedbacks = product.feedBacks._id;
    
    }catch(error){
      res.status(500).json({
        message: "Error updating ratting",
        error: error.message,
      });
    }
}

exports.filterProduct = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, author, page = 1, limit = 10 } = req.query;

    // Tạo điều kiện lọc (query)
    const query = {};
    if (category) query.category = { $in: category.split(",") }; // Lọc nhiều category
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice); // Lớn hơn hoặc bằng minPrice
      if (maxPrice) query.price.$lte = parseFloat(maxPrice); // Nhỏ hơn hoặc bằng maxPrice
    }
    if (author) query.author = { $in: author.split(",") }; // Lọc nhiều author

    // Chuyển đổi page và limit thành số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Truy vấn danh sách sản phẩm dựa trên điều kiện
    const products = await Product.find(query)
      .skip((pageNumber - 1) * limitNumber) // Bỏ qua các sản phẩm của trang trước đó
      .limit(limitNumber); // Giới hạn số lượng sản phẩm trả về

    // Đếm tổng số sản phẩm phù hợp
    const total = await Product.countDocuments(query);

    // Trả về kết quả
    res.status(200).json({
      data: products,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber), // Tính tổng số trang
      totalItems: total, // Tổng số sản phẩm
    });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Xử lý lỗi
  }
};

exports.searchProduct = async (req, res) => {
  try {
    const { keyword } = req.query;

    // Kiểm tra nếu keyword không tồn tại hoặc không phải là chuỗi
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ message: "Keyword must be a non-empty string" });
    }

    // Tìm kiếm sản phẩm
    const products = await Product.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
      ],
    });

    // Trả về danh sách sản phẩm
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


