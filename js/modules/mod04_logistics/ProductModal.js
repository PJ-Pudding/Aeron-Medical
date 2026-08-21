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

  // 📊 Excel-style Product Components & Accessories Breakdown Table State
  const [componentsList, setComponentsList] = useState(() => {
    if (product && Array.isArray(product.masterChecklistItems) && product.masterChecklistItems.length > 0) {
      return product.masterChecklistItems.map(item => ({
        id: item.id || 'comp_' + Math.random().toString(36).substr(2, 6),
        name: item.name || '',
        itemNo: item.itemNo || item.partNo || '',
        serialNo: item.serialNo || '',
        qty: item.qty !== undefined ? item.qty : 1,
        unit: item.unit || 'ชิ้น',
        note: item.note || ''
      }));
    }
    if (product && Array.isArray(product.accessoriesList) && product.accessoriesList.length > 0) {
      return product.accessoriesList.map(item => ({
        id: item.id || 'comp_' + Math.random().toString(36).substr(2, 6),
        name: item.name || '',
        itemNo: item.itemNo || item.partNo || '',
        serialNo: item.serialNo || '',
        qty: item.qty !== undefined ? item.qty : 1,
        unit: item.unit || 'ชิ้น',
        note: item.note || ''
      }));
    }
    // Default starting rows
    return [
      { id: 'comp_1', name: 'ตัวเครื่องหลัก (Main Unit)', itemNo: 'MAIN-01', serialNo: '', qty: 1, unit: 'เครื่อง', note: 'ตรวจ QC พร้อมใช้งาน' },
      { id: 'comp_2', name: 'สายไฟหลัก Power Cord & AC Adapter', itemNo: 'PWR-01', serialNo: '', qty: 1, unit: 'ชุด', note: '' },
      { id: 'comp_3', name: 'คู่มือการใช้งานภาษาไทย', itemNo: 'MAN-TH', serialNo: '', qty: 1, unit: 'เล่ม', note: '' }
    ];
  });

  const handleAddComponent = () => {
    setComponentsList([
      ...componentsList,
      { id: 'comp_' + Date.now(), name: '', itemNo: '', serialNo: '', qty: 1, unit: 'ชิ้น', note: '' }
    ]);
  };

  const handleRemoveComponent = (idx) => {
    setComponentsList(componentsList.filter((_, i) => i !== idx));
  };

  const handleComponentChange = (idx, field, value) => {
    setComponentsList(componentsList.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

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
    const validComponents = componentsList.filter(c => c.name && c.name.trim());
    const autoAccessoriesSummary = validComponents.map(c => `${c.name} (${c.qty} ${c.unit})`).join(', ');

    onSave({
      ...formData,
      price: Number(formData.price) || 0,
      accessoriesList: validComponents,
      masterChecklistItems: validComponents.map(c => ({
        id: c.id,
        name: c.name,
        itemNo: c.itemNo || '',
        partNo: c.itemNo || '',
        serialNo: c.serialNo || '',
        qty: Number(c.qty) || 1,
        unit: c.unit || 'ชิ้น',
        note: c.note || '',
        condition: 'สมบูรณ์'
      })),
      demoUnitsAvailable: validUnits.length || 1,
      demoSerialNumbers: validUnits.map(u => u.sn),
      demoUnits: validUnits.map(u => ({
        ...u,
        accessories: u.accessories || autoAccessoriesSummary
      }))
    });
  };

  return (
    <div className="fixed inset-0 z-[700] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl animate-modal max-h-[94vh] overflow-y-auto text-slate-100">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/30 shadow-md">
              📦
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {product ? 'แก้ไขข้อมูลสินค้า & รายการอุปกรณ์' : 'เพิ่มชนิดสินค้าใหม่'}
              </h3>
              <p className="text-xs text-slate-400">บันทึกข้อมูลสเปก, ตารางแจกแจงอุปกรณ์ประกอบ และเครื่องสาธิต (Central Catalog)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs">✕ ปิด</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <span>🏷️</span> <span>ข้อมูลพื้นฐานสินค้า</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">หมวดหมู่/ประเภทสินค้า</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none"
                >
                  {window.PRODUCT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">แบรนด์/ผู้ผลิต</label>
                <input
                  type="text"
                  placeholder="เช่น AERON MEDICAL"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">ชื่อรุ่นสินค้า (Model Code) <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="เช่น AERON Cardio 12L-AI, BJ3500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">ราคาขายประมาณการ (บาท THB)</label>
                <input
                  type="number"
                  placeholder="เช่น 900000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none font-mono font-bold text-amber-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รายละเอียดจุดเด่น / สเปกทั่วไป</label>
              <textarea
                rows="2"
                placeholder="คำอธิบายจุดเด่น สเปกการทำงานคร่าวๆ ของตัวเครื่อง..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none"
              ></textarea>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 📊 Section 2: Excel-Style Components Breakdown Table */}
          {/* ========================================================= */}
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <h4 className="font-bold text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>📑</span> <span>ตารางรายการชิ้นส่วน & อุปกรณ์ประกอบในชุด ({componentsList.length} รายการ)</span>
                </h4>
                <p className="text-[11px] text-slate-400">ระบุรายละเอียดแยก Item No., Serial No. (S/N), จำนวน และหมายเหตุแบบชัดเจน</p>
              </div>

              <button
                type="button"
                onClick={handleAddComponent}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95"
              >
                <span>➕ เพิ่มแถวอุปกรณ์</span>
              </button>
            </div>

            {/* Excel-style Table Grid */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2 px-2.5 text-center w-10 border-r border-slate-800">ลำดับ</th>
                    <th className="p-2 px-3 border-r border-slate-800 min-w-[170px]">ชื่อรายการชิ้นส่วน / อุปกรณ์ <span className="text-rose-400">*</span></th>
                    <th className="p-2 px-2.5 border-r border-slate-800 w-28">Item No. (รหัส)</th>
                    <th className="p-2 px-2.5 border-r border-slate-800 w-32">Serial No. (S/N)</th>
                    <th className="p-2 px-2 text-center w-16 border-r border-slate-800">จำนวน</th>
                    <th className="p-2 px-2 text-center w-24 border-r border-slate-800">หน่วยนับ</th>
                    <th className="p-2 px-3 border-r border-slate-800 min-w-[130px]">หมายเหตุ (Remarks)</th>
                    <th className="p-2 px-2 text-center w-10">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {componentsList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-slate-500 italic">
                        ยังไม่มีรายการอุปกรณ์ประกอบ กดปุ่ม "+ เพิ่มแถวอุปกรณ์" ด้านบนเพื่อเริ่มกรอก
                      </td>
                    </tr>
                  ) : (
                    componentsList.map((comp, idx) => (
                      <tr key={comp.id || idx} className="hover:bg-slate-800/50 transition-colors">
                        
                        {/* 1. ลำดับ */}
                        <td className="p-2 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">
                          {idx + 1}
                        </td>

                        {/* 2. ชื่อรายการชิ้นส่วน */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            required
                            placeholder="เช่น สาย Patient Cable 10-Lead, ลีดดูดสูญญากาศ"
                            value={comp.name}
                            onChange={(e) => handleComponentChange(idx, 'name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 text-slate-100 outline-none text-xs focus:border-emerald-500 font-medium"
                          />
                        </td>

                        {/* 3. Item No. */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            placeholder="เช่น CBL-10L"
                            value={comp.itemNo || ''}
                            onChange={(e) => handleComponentChange(idx, 'itemNo', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 font-mono text-indigo-300 outline-none text-xs focus:border-emerald-500"
                          />
                        </td>

                        {/* 4. Serial No. (S/N) */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            placeholder="เช่น SN-884102"
                            value={comp.serialNo || ''}
                            onChange={(e) => handleComponentChange(idx, 'serialNo', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 font-mono text-amber-300 outline-none text-xs focus:border-emerald-500"
                          />
                        </td>

                        {/* 5. จำนวน */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="number"
                            min="1"
                            value={comp.qty}
                            onChange={(e) => handleComponentChange(idx, 'qty', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 text-center font-mono font-bold text-amber-300 outline-none text-xs focus:border-emerald-500"
                          />
                        </td>

                        {/* 6. หน่วยนับ */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            list="units-datalist"
                            placeholder="เครื่อง/เส้น/ลูก"
                            value={comp.unit}
                            onChange={(e) => handleComponentChange(idx, 'unit', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 text-center text-slate-200 outline-none text-xs focus:border-emerald-500 font-medium"
                          />
                        </td>

                        {/* 7. หมายเหตุ */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            placeholder="เช่น สภาพสมบูรณ์ / พร้อมใช้งาน"
                            value={comp.note || ''}
                            onChange={(e) => handleComponentChange(idx, 'note', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 text-slate-300 outline-none text-xs focus:border-emerald-500"
                          />
                        </td>

                        {/* 8. ลบแถว */}
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                            title="ลบแถวนี้"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <datalist id="units-datalist">
              <option value="เครื่อง" />
              <option value="ชิ้น" />
              <option value="เส้น" />
              <option value="ลูก" />
              <option value="ม้วน" />
              <option value="ชุด" />
              <option value="เล่ม" />
              <option value="ใบ" />
              <option value="กล่อง" />
            </datalist>
          </div>

          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-purple-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🧪</span> <span>หมายเลขเครื่องสาธิต Demo ประจำการ ({demoUnits.length} เครื่อง)</span>
                </h4>
                <p className="text-[10.5px] text-slate-400">กำหนดหมายเลข Serial Number และสถานที่เก็บเครื่องสาธิต</p>
              </div>
              <button
                type="button"
                onClick={handleAddUnit}
                className="px-3 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 transition-all"
              >
                <span>➕ เพิ่มเครื่อง Demo</span>
              </button>
            </div>

            <div className="space-y-3">
              {demoUnits.map((unit, idx) => (
                <div key={idx} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 relative hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <span>📦</span> <span>เครื่องเดโม่ตัวที่ {idx + 1}</span>
                    </span>
                    {demoUnits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(idx)}
                        className="text-rose-400 text-xs hover:text-rose-300 px-2 py-0.5 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center gap-1"
                      >
                        <span>🗑️ ลบ</span>
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
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none font-mono text-xs focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">สถานะเครื่องเดโม่</label>
                      <select
                        value={unit.status || 'พร้อมใช้งาน'}
                        onChange={(e) => handleUnitChange(idx, 'status', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none font-semibold"
                      >
                        <option value="พร้อมใช้งาน">✅ พร้อมใช้งาน</option>
                        <option value="ส่งซ่อม">🔧 ส่งซ่อม</option>
                        <option value="เสีย">❌ เสีย</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">📍 สถานที่ประจำการเครื่องขณะนี้</label>
                    <input
                      type="text"
                      placeholder="เช่น สำนักงาน AERON กรุงเทพฯ / โรงพยาบาลศิริราช (ยืมสาธิต)"
                      value={unit.location || ''}
                      onChange={(e) => handleUnitChange(idx, 'location', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium">ยกเลิก</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 active:scale-95 transition-all">
              💾 บันทึกข้อมูลสินค้า & ตารางอุปกรณ์
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
