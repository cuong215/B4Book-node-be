const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    value: { type: Number, 
      required: true,
      validate: {
        validator: (v) => v >= 0 && v <= 100,
        message: "Discount value must be between 0 and 100"
      },
    },
    expired: { type: Date, required: true },
    validDate:{type:Date,required:true},
    isActive: { type: Boolean},
    image: [{ type: String}],
    isDeleted: { type: Boolean, default: false },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
  }
);

const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
