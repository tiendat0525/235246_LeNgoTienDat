import { useState } from 'react';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

const statuses = [
  'Đang sử dụng',
  'Hư hỏng',
  'Đang sửa chữa',
  'Ngừng sử dụng'
];

export default function DeviceForm({ device, onSaved, onCancel }) {
  const [form, setForm] = useState({
    deviceId: device?.deviceId || '',
    name: device?.name || '',
    deviceType: device?.deviceType || '',
    room: device?.room || '',
    brand: device?.brand || '',
    model: device?.model || '',
    quantity: device?.quantity ?? 1,
    status: device?.status || 'Đang sử dụng',
    purchaseDate: device?.purchaseDate?.slice(0, 10) || '',
    description: device?.description || ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const data = {
        ...form,
        deviceId: form.deviceId.trim(),
        name: form.name.trim(),
        deviceType: form.deviceType.trim(),
        room: form.room.trim(),
        quantity: Number(form.quantity)
      };

      if (
        !data.deviceId ||
        !data.name ||
        !data.deviceType ||
        !data.room
      ) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc.');
      }

      if (
        form.quantity === '' ||
        !Number.isInteger(data.quantity) ||
        data.quantity < 0
      ) {
        throw new Error('Số lượng phải là số nguyên không âm.');
      }

      const url = device
        ? `${API_URL}/api/devices/${device._id}`
        : `${API_URL}/api/devices`;

      const response = await fetch(url, {
        method: device ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          [result.message, ...(result.errors || [])]
            .filter(Boolean)
            .join(' — ') || 'Không thể lưu thiết bị'
        );
      }

      onSaved(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2>{device ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}</h2>
      <p>Các trường có dấu * là bắt buộc.</p>

      <form className="device-form" onSubmit={handleSubmit}>
        <fieldset disabled={saving}>
          <label>
            Mã thiết bị *
            <input
              name="deviceId"
              value={form.deviceId}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Tên thiết bị *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Loại thiết bị *
            <input
              name="deviceType"
              value={form.deviceType}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phòng học *
            <input
              name="room"
              value={form.room}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Hãng sản xuất
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
            />
          </label>

          <label>
            Model
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
            />
          </label>

          <label>
            Số lượng *
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
            />
          </label>

          <label>
            Tình trạng *
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ngày mua hoặc tiếp nhận *
            <input
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Mô tả
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
            />
          </label>

          {error && <p className="error" role="alert">{error}</p>}

          <div className="actions">
            <button type="submit">
              {saving ? 'Đang lưu...' : 'Lưu thiết bị'}
            </button>
            <button type="button" onClick={onCancel}>
              Hủy
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}