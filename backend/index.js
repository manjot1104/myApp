require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cart")
const orderRoutes = require("./routes/order")

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);


const jwt = require("jsonwebtoken");
app.listen(port, () => {
  console.log("Server is running on port 8000");
});

mongoose
  .connect("mongodb+srv://manjot1104:waheguru1@cluster0.bhn9dvf.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tlsAllowInvalidCertificates: false
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDb", err);
  });

  const User = require("./models/user");

  const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
  const sendOtpEmail = async (email, otp) => {
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    // Configure the email service or SMTP details here
    service: "gmail",
    auth: {
      user: "manjot1104@gmail.com",
      pass: "uxyirlzqcebunkht",
    },
  });

  // Compose the email message
  const mailOptions = {
    from: "manjot1104@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp} . It will expire in 10 minutes`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification otp sent successfully");
  } catch (error) {
    console.error("Error sending verification otp:", error);
  }
};
// Register a new user
// ... existing imports and setup ...

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Validate inputs...

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    const newUser = new User({
      name,
      email,
      phone,
      role,
      password_hash: hashedPassword,
      verified: false,
      otp,
      otpExpires,
    });

    await newUser.save();

    // Send OTP email instead of link
    await sendOtpEmail(newUser.email, otp);

    res.status(201).json({ message: "User registered, OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verified) return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    // Send success with role
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      role: user.role,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

const secretKey = process.env.JWT_SECRET;

//endpoint to login the user!
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, { expiresIn: '7d' });
  res.json({ token, userId: user._id, role: user.role, message: 'Login successful' });
});

