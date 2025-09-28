require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const { Server } = require("socket.io");
const { createServer } = require("http");
const path = require("path");
const ChatRoom = require("./models/Chat");
const bcrypt = require("bcryptjs"); 
const {createClient} = require("redis");

const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const chatRoutes = require("./routes/chat");

const app = express();
const port = process.env.PORT || 8000;
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
app.use("/api/chat", chatRoutes);

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });


// ---------------- Redis Setup ----------------
const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();

async function connectRedis() {
  try {
    await pub.connect();
    await sub.connect();
    console.log(" Connected to Redis");

    // Subscribe to channel
    await sub.subscribe("chat_channel", (message) => {
      const msg = JSON.parse(message);
      io.to(msg.roomId).emit("newChatMessage", msg);
    });
  } catch (err) {
    console.error(" Redis connection error:", err);
  }
}
connectRedis();

// Socket.io connection
io.on("connection", (socket) => {
  console.log(" New client connected:", socket.id);

  // Retailer creates a chat room
  socket.on("createRoom", async ({ retailerId, wholesalerId }) => {
    let room = await ChatRoom.findOne({ retailerId, wholesalerId });

    if (!room) {
      room = await ChatRoom.create({ retailerId, wholesalerId, messages: [] });
    }

    socket.join(room._id.toString());
    socket.emit("roomCreated", room);
  });

  // Wholesaler joins retailer’s room
  socket.on("joinRoom", async ({ retailerId, wholesalerId }) => {
    let room = await ChatRoom.findOne({ retailerId, wholesalerId });

    if (!room) {
      return socket.emit("error", "Room not found");
    }

    socket.join(room._id.toString());
    socket.emit("roomJoined", room);

    // Send old messages (history)
    socket.emit("chatHistory", room.messages);
  });

  // Send + Save message
  socket.on(
    "sendMessage",
    async ({ retailerId, wholesalerId, senderId, text }) => {
      let room = await ChatRoom.findOne({ retailerId, wholesalerId });
      if (!room) return;

      const msg = {
        roomId: room._id.toString(), 
        senderId,
        text,
        createdAt: new Date(),
      };
      room.messages.push(msg);
      await room.save();

      // Publish to Redis channel
      pub.publish("chat_channel", JSON.stringify(msg));

      //io.to(room._id.toString()).emit("newChatMessage", msg);
    }
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ---------------- Test Publish ----------------
setTimeout(async () => {
  await pub.publish(
    "chat_channel",
    JSON.stringify({
      roomId: "testRoom",
      senderId: "system",
      text: "Redis PubSub Test",
    })
  );
}, 3000);

const jwt = require("jsonwebtoken");
server.listen(port, () => {
  console.log("Server is running on port 8000");
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tlsAllowInvalidCertificates: false,
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
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Compose the email message
  const mailOptions = {
    from: process.env.EMAIL_USER,
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

    if (user.verified)
      return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

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
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, {
    expiresIn: "7d",
  });
  res.json({
    token,
    userId: user._id,
    role: user.role,
    message: "Login successful",
  });
});
