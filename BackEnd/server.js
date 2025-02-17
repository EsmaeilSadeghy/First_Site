const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // آدرس دقیق کلاینت خود را وارد کنید
    credentials: true, // اجازه ارسال کوکی‌ها و احراز هویت
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// اتصال به دیتابیس MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://ess41380:l12BNoo1bb8ZlJyB@cluster0.wyyjq.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// مدل کاربر
const UserSchema = new mongoose.Schema({ phone: String });
const User = mongoose.model("User", UserSchema);

// ذخیره کدهای پیامکی (در محیط واقعی باید از سرویس پیامک استفاده کنید)
const verificationCodes = {};

// ارسال کد پیامکی
app.post("/api/send-code", async (req, res) => {
  const { phone } = req.body;

  console.log(phone) // p

  const code = Math.floor(1000 + Math.random() * 9000); // کد ۴ رقمی تصادفی

  verificationCodes[phone] = code;

  // ذخیره شماره در کوکی موقت (Session Cookie)
  res.cookie("tempPhone", phone, { httpOnly: true });

  console.log(`کد پیامکی برای ${phone}: ${code}`);
  res.json({ success: true, message: "کد ارسال شد" });
});

// تأیید کد و ورود
app.post("/api/verify-code", async (req, res) => {
  const { code } = req.body;
  const phone = req.cookies.tempPhone; // دریافت شماره از کوکی

  if (!phone || verificationCodes[phone] != code) {
    return res.status(401).json({ success: false, message: "کد نامعتبر است" });
  }

  // ایجاد یا دریافت کاربر از دیتابیس
  let user = await User.findOne({ phone });
  if (!user) {
    user = new User({ phone });
    await user.save();
  }

  // حذف کوکی موقت بعد از احراز هویت
  res.clearCookie("tempPhone");

  // ایجاد توکن و ذخیره در کوکی اصلی
  const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, token });
});

// بررسی وضعیت ورود
app.get("/api/check-auth", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ authenticated: false });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.json({ authenticated: false });
    res.json({ authenticated: true, phone: decoded.phone });
  });
});

app.listen(5000, () => console.log(`Server running on port ${5000}`));
