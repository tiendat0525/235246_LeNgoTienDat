import { useEffect, useState } from 'react';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

const STATUSES = [
  'Đang sử dụng',
  'Hư hỏng',
  'Đang sửa chữa',
  'Ngừng sử dụng'
];

const FIELDS = [
  ['deviceId', 'Mã thiết bị', 'text', true],
  ['name', 'Tên thiết bị', 'text', true],
  ['deviceType', 'Loại thiết bị', 'text', true],
  ['room', 'Phòng học', 'text', true],
  ['brand', 'Hãng sản xuất', 'text', false],
  ['model', 'Model', 'text', false],
  ['quantity', 'Số lượng', 'number', true],
  ['status', 'Tình trạng', 'select', true],
  ['purchaseDate', 'Ngày mua hoặc tiếp nhận', 'date', true],
  ['description', 'Mô tả', 'textarea', false]
];

function emptyForm() {
  return {
    deviceId: '',
    name: '',
    deviceType: '',
    room: '',
    brand: '',
    model: '',
    quantity: 1,
    status: 'Đang sử dụng',
    purchaseDate: '',
    description: ''
  };
}

async function requestApi(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error('Không thể kết nối backend. Vui lòng kiểm tra server.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      [data.message, ...(data.errors || [])]
        .filter(Boolean)
        .join(' — ') || 'Thao tác không thành công'
    );
  }

  return data;
}

export default function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [busy, setBusy] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  async function loadDevices(keyword = '') {
    setLoading(true);
    setError('');

    try {
      const data = await requestApi(
        `/api/devices?search=${encodeURIComponent(keyword.trim())}`
      );
      setDevices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    requestApi('/api/devices')
      .then((data) => {
        if (!ignore) setDevices(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function openForm(device = null) {
    setEditingId(device?._id || null);

    setForm(
      device
        ? {
            deviceId: device.deviceId || '',
            name: device.name || '',
            deviceType: device.deviceType || '',
            room: device.room || '',
            brand: device.brand || '',
            model: device.model || '',
            quantity: device.quantity ?? 0,
            status: device.status || STATUSES[0],
            purchaseDate: device.purchaseDate?.slice(0, 10) || '',
            description: device.description || ''
          }
        : emptyForm()
    );

    setFormError('');
    setError('');
    setSuccess('');
    setSelectedDevice(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function saveDevice(event) {
    event.preventDefault();
    setFormError('');
    setSuccess('');

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
      !data.room ||
      !data.purchaseDate
    ) {
      setFormError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    if (
      form.quantity === '' ||
      !Number.isInteger(data.quantity) ||
      data.quantity < 0
    ) {
      setFormError('Số lượng phải là số nguyên không âm.');
      return;
    }

    setBusy(true);

    try {
      await requestApi(
        editingId ? `/api/devices/${editingId}` : '/api/devices',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );

      setSuccess(
        editingId
          ? 'Cập nhật thiết bị thành công.'
          : 'Thêm thiết bị thành công.'
      );
      setShowForm(false);
      setSelectedDevice(null);
      setSearch('');
      await loadDevices();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function viewDetail(id) {
    setBusy(true);
    setError('');
    setSuccess('');
    setSelectedDevice(null);

    try {
      const data = await requestApi(`/api/devices/${id}`);
      setSelectedDevice(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteDevice(device) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa thiết bị ${device.deviceId} — ${device.name}?`
    );

    if (!confirmed) return;

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await requestApi(`/api/devices/${device._id}`, {
        method: 'DELETE'
      });

      setSuccess(`Đã xóa thiết bị ${device.deviceId}.`);
      setSelectedDevice(null);

      if (editingId === device._id) setShowForm(false);

      await loadDevices(search);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function detailValue(field) {
    const value = selectedDevice[field];

    if (field === 'purchaseDate' && value) {
      return new Date(value).toLocaleDateString('vi-VN');
    }

    return value === '' || value === null || value === undefined
      ? 'Chưa có thông tin'
      : value;
  }

  return (
    <main>
      <h1>Quản lý thiết bị phòng học</h1>
      <p>Lê Ngô Tiến Đạt — MSSV: 235246</p>

      <button
        type="button"
        disabled={busy || loading}
        onClick={() => openForm()}
      >
        Thêm thiết bị
      </button>

      {success && <p className="success" role="status">{success}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {busy && <p role="status">Đang xử lý...</p>}

      {showForm && (
        <section>
          <h2>{editingId ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}</h2>
          <p>Các trường có dấu * là bắt buộc.</p>

          <form className="device-form" onSubmit={saveDevice}>
            <fieldset disabled={busy}>
              {FIELDS.map(([name, label, type, required]) => {
                const props = {
                  name,
                  value: form[name],
                  onChange: handleChange,
                  required
                };

                return (
                  <label key={name}>
                    <span>{label}{required ? ' *' : ''}</span>

                    {type === 'select' ? (
                      <select {...props}>
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : type === 'textarea' ? (
                      <textarea {...props} rows={3} />
                    ) : (
                      <input
                        {...props}
                        type={type}
                        min={type === 'number' ? 0 : undefined}
                        step={type === 'number' ? 1 : undefined}
                      />
                    )}
                  </label>
                );
              })}

              {formError && (
                <p className="error full-width" role="alert">
                  {formError}
                </p>
              )}

              <div className="actions full-width">
                <button type="submit">
                  {busy ? 'Đang lưu...' : 'Lưu thiết bị'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      )}

      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSelectedDevice(null);
          setSuccess('');
          loadDevices(search);
        }}
      >
        <input
          aria-label="Từ khóa tìm kiếm"
          placeholder="Nhập mã, tên, loại thiết bị hoặc phòng học"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          maxLength={100}
        />

        <button type="submit" disabled={loading || busy}>
          Tìm kiếm
        </button>

        <button
          type="button"
          className="secondary"
          disabled={loading || busy}
          onClick={() => {
            setSearch('');
            setSelectedDevice(null);
            setSuccess('');
            loadDevices();
          }}
        >
          Xem tất cả
        </button>
      </form>

      {loading && <p role="status">Đang tải dữ liệu...</p>}

      {!loading && !error && (
        <>
          <p>Tìm thấy {devices.length} thiết bị.</p>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã thiết bị</th>
                  <th>Tên thiết bị</th>
                  <th>Loại thiết bị</th>
                  <th>Phòng học</th>
                  <th>Số lượng</th>
                  <th>Tình trạng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {devices.map((device) => (
                  <tr key={device._id}>
                    <td>{device.deviceId}</td>
                    <td>{device.name}</td>
                    <td>{device.deviceType}</td>
                    <td>{device.room}</td>
                    <td>{device.quantity}</td>
                    <td>{device.status}</td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => viewDetail(device._id)}
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openForm(device)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="danger"
                          disabled={busy}
                          onClick={() => deleteDevice(device)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {devices.length === 0 && (
                  <tr>
                    <td colSpan={7}>Không tìm thấy thiết bị phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedDevice && (
        <section aria-labelledby="detail-title">
          <h2 id="detail-title">
            Chi tiết thiết bị: {selectedDevice.deviceId}
          </h2>

          <dl>
            {FIELDS.map(([name, label]) => (
              <div key={name}>
                <dt>{label}</dt>
                <dd>{detailValue(name)}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => setSelectedDevice(null)}
          >
            Đóng chi tiết
          </button>
        </section>
      )}
    </main>
  );
}