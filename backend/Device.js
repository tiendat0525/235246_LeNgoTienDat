const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  deviceType: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  model: {
    type: String,
    trim: true,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Số lượng phải là số nguyên'
    }
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Đang sử dụng',
      'Hư hỏng',
      'Đang sửa chữa',
      'Ngừng sử dụng'
    ]
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  collection: 'devices'
});

module.exports = mongoose.model('Device', deviceSchema);