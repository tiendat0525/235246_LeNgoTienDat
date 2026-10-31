const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Device = require('./Device');


require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? 'UP' : 'DOWN',
    database: connected ? 'connected' : 'disconnected'
  });
});

app.get('/api/devices', async (req, res) => {
  try {
    if (
      req.query.search !== undefined &&
      typeof req.query.search !== 'string'
    ) {
      return res.status(400).json({
        message: 'Từ khóa tìm kiếm không hợp lệ'
      });
    }

    const search = (req.query.search || '').trim();

    if (search.length > 100) {
      return res.status(400).json({
        message: 'Từ khóa tìm kiếm tối đa 100 ký tự'
      });
    }

    const filter = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const keyword = new RegExp(escaped, 'i');

      filter.$or = [
        { deviceId: keyword },
        { name: keyword },
        { deviceType: keyword },
        { room: keyword }
      ];
    }

    const devices = await Device.find(filter).sort({ deviceId: 1 });
    res.status(200).json(devices);
  } catch (error) {
    console.error('Lỗi lấy danh sách thiết bị:', error.name);

    res.status(503).json({
      message: 'Không thể lấy dữ liệu thiết bị, vui lòng thử lại'
    });
  }
});

app.get('/api/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: 'ID thiết bị không hợp lệ'
      });
    }

    const device = await Device.findById(id);

    if (!device) {
      return res.status(404).json({
        message: 'Không tìm thấy thiết bị'
      });
    }

    res.status(200).json(device);
  } catch (error) {
    console.error('Lỗi xem chi tiết thiết bị:', error.name);

    res.status(503).json({
      message: 'Không thể lấy dữ liệu thiết bị, vui lòng thử lại'
    });
  }
});

app.post('/api/devices', async (req, res) => {
  try {
    if (
      !req.body ||
      typeof req.body !== 'object' ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: 'Dữ liệu gửi lên phải là một đối tượng JSON'
      });
    }

    const fields = [
      'deviceId', 'name', 'deviceType', 'room', 'brand',
      'model', 'quantity', 'status', 'purchaseDate',
      'description'
    ];

    const data = {};

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        data[field] = req.body[field];
      }
    }

    const device = await Device.create(data);

    res.status(201).json(device);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Mã thiết bị đã tồn tại'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dữ liệu thiết bị không hợp lệ',
        errors: Object.values(error.errors).map(item => item.message)
      });
    }

    console.error('Lỗi thêm thiết bị:', error.name);

    res.status(503).json({
      message: 'Không thể lưu thiết bị, vui lòng thử lại'
    });
  }
});
app.put('/api/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: 'ID thiết bị không hợp lệ'
      });
    }

    if (
      !req.body ||
      typeof req.body !== 'object' ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: 'Dữ liệu gửi lên phải là một đối tượng JSON'
      });
    }

    const fields = [
      'deviceId', 'name', 'deviceType', 'room', 'brand',
      'model', 'quantity', 'status', 'purchaseDate',
      'description'
    ];

    const data = {};

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        data[field] = req.body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: 'Chưa cung cấp thông tin cần cập nhật'
      });
    }

    const device = await Device.findById(id);

    if (!device) {
      return res.status(404).json({
        message: 'Không tìm thấy thiết bị'
      });
    }

    device.set(data);
    await device.save();

    res.status(200).json(device);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Mã thiết bị đã tồn tại'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dữ liệu thiết bị không hợp lệ',
        errors: Object.values(error.errors).map(item => item.message)
      });
    }

    console.error('Lỗi cập nhật thiết bị:', error.name);

    res.status(503).json({
      message: 'Không thể cập nhật thiết bị, vui lòng thử lại'
    });
  }
});

app.delete('/api/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: 'ID thiết bị không hợp lệ'
      });
    }

    const device = await Device.findByIdAndDelete(id);

    if (!device) {
      return res.status(404).json({
        message: 'Không tìm thấy thiết bị'
      });
    }

    res.status(200).json({
      message: 'Xóa thiết bị thành công',
      deviceId: device.deviceId
    });
  } catch (error) {
    console.error('Lỗi xóa thiết bị:', error.name);

    res.status(503).json({
      message: 'Không thể xóa thiết bị, vui lòng thử lại'
    });
  }
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error('Chưa cấu hình MONGODB_URI trong file .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    await Device.init();
    console.log('Kết nối MongoDB Atlas thành công');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể kết nối MongoDB Atlas');
    console.error(`Loại lỗi: ${error.name}; mã lỗi: ${error.code || 'không có'}`);
    process.exit(1);
  }
}

startServer();