// MODULE: mod04_logistics/ProductModal.js

function ProductModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (product) {
      return {
        id: product.id,
        category: product.category || window.PRODUCT_CATEGORIES[0],
        name: product.name || '',
        brand: product.brand || 'AERON MEDICAL',
        price: product.price || '',
        description: product.description || ''
      };
    }
    return {
      category: window.PRODUCT_CATEGORIES[0],
      name: '',
      brand: 'AERON MEDICAL',
      price: '',
      description: ''
    };
  });

  const [demoUnits, setDemoUnits] = useState(() => {
    if (product && product.demoUnits && product.demoUnits.length > 0) {
      return product.demoUnits.map(u => ({ ...u }));
    }
    if (product && product.demoSerialNumbers && product.demoSerialNumbers.length > 0) {
      return product.demoSerialNumbers.map(sn => ({ sn, status: 'พร้อมใช้งาน', location: '', accessories: '' }));
    }
    return [{ sn: '', status: 'พร้อมใช้งาน', location: '', accessories: '' }];
  });

  const handleAddUnit = () => {
    setDemoUnits([...demoUnits, { sn: '', status: 'พร้อมใช้งาน', location: '', accessories: '' }]);
  };

  const handleRemoveUnit = (idx) => {
    setDemoUnits(demoUnits.filter((_, i) => i !== idx));
  };

  const handleUnitChange = (idx, field, value) => {
    setDemoUnits(demoUnits.map((u, i) => i === idx ? { ...u, [field]: value } : u));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อรุ่นสินค้า');
      return;
    }
    const validUnits = demoUnits.filter(u => u.sn && u.sn.trim());
    onSave({
      ...formData,
      price: Number(formData.price) || 0,
      demoUnitsAvailable: validUnits.length || 1,
      demoSerialNumbers: validUnits.map(u => u.sn),
      demoUnits: validUnits
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>📦 {product ? 'แก้ไขข้อมูลสินค้า & เครื่องสาธิต' : 'เพิ่มชนิดสินค้าใหม่'} (Central Demo Catalog)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมวดหมู่/ประเภทสินค้า</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              {window.PRODUCT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ชื่อรุ่นสินค้า (Model) <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น AERON Cardio 12L-AI"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">แบรนด์/บริษัท</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500 font-semibold text-emerald-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ราคาประมาณการ (บาท THB)</label>
            <input
              type="number"
              placeholder="เช่น 900000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">รายละเอียดสินค้า</label>
            <textarea
              rows="2"
              placeholder="คำอธิบายจุดเด่นสินค้า สเปกคร่าวๆ..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            ></textarea>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                  <span>🧪 รายการเครื่องสาธิตเดโม่ ({demoUnits.length} เครื่อง)</span>
                </label>
                <p className="text-[10.5px] text-slate-400">กำหนดหมายเลข SN, สถานะเครื่อง, ที่อยู่ปัจจุบัน และอุปกรณ์ประกอบในชุด</p>
              </div>
              <button
                type="button"
                onClick={handleAddUnit}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 transition-all"
              >
                <span>➕ เพิ่มเครื่อง Demo</span>
              </button>
            </div>

            <div className="space-y-3">
              {demoUnits.map((unit, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 relative hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <span>📦</span> <span>เครื่องเดโม่ตัวที่ {idx + 1}</span>
                    </span>
                    {demoUnits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(idx)}
                        className="text-rose-400 text-xs hover:text-rose-300 px-2 py-0.5 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center gap-1"
                      >
                        <span>🗑️ ลบเครื่องนี้</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">หมายเลข SN เครื่อง <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น AERON-DEMO-ECG-01"
                        value={unit.sn}
                        onChange={(e) => handleUnitChange(idx, 'sn', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none font-mono text-xs focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">สถานะเครื่องเดโม่</label>
                      <select
                        value={unit.status || 'พร้อมใช้งาน'}
                        onChange={(e) => handleUnitChange(idx, 'status', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none font-semibold"
                      >
                        <option value="พร้อมใช้งาน">✅ พร้อมใช้งาน</option>
                        <option value="ส่งซ่อม">🔧 ส่งซ่อม</option>
                        <option value="เสีย">❌ เสีย</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">📍 ที่อยู่ / สถานที่ประจำการเครื่องขณะนี้</label>
                    <input
                      type="text"
                      placeholder="เช่น สำนักงาน AERON กรุงเทพฯ / โรงพยาบาลศิริราช (ยืมสาธิต)"
                      value={unit.location || ''}
                      onChange={(e) => handleUnitChange(idx, 'location', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">🧰 รายละเอียดสินค้า / อุปกรณ์ประกอบในชุด</label>
                    <textarea
                      rows="2"
                      placeholder="เช่น สาย Lead 10 เส้น, กระดาษบันทึก 5 ม้วน, คู่มือภาษาไทย, กระเป๋าหิ้ว..."
                      value={unit.accessories || ''}
                      onChange={(e) => handleUnitChange(idx, 'accessories', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30">
              บันทึกข้อมูลสินค้า & เครื่องเดโม่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
