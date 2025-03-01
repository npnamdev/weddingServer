require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Kết nối MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ Kết nối MongoDB thành công!"))
    .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Tạo Schema và Model
const WishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
});

const Wish = mongoose.model("Wish", WishSchema);

// API lấy danh sách lời chúc
app.get("/wishes", async (req, res) => {
    try {
        const wishes = await Wish.find();
        res.json(wishes);
    } catch (error) {
        res.status(500).json({ error: "Lỗi server" });
    }
});

// API tạo lời chúc
app.post("/wishes", async (req, res) => {
    try {
        const { name, phone, message } = req.body;
        if (!name || !phone || !message) {
            return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
        }

        const newWish = new Wish({ name, phone, message });
        await newWish.save();

        res.status(201).json({ message: "Lời chúc đã được gửi!", wish: newWish });
    } catch (error) {
        res.status(500).json({ error: "Lỗi server" });
    }
});

// API xoá  lời chúc
app.delete("/wishes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedWish = await Wish.findByIdAndDelete(id);
        if (!deletedWish) {
            return res.status(404).json({ error: "Lời chúc không tồn tại" });
        }
        res.json({ message: "Lời chúc đã được xóa", wish: deletedWish });
    } catch (error) {
        res.status(500).json({ error: "Lỗi server" });
    }
});    


// Chạy server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
