// MODULE: mod03_projects/ProjectModal.js

function ProjectModal({ project, members, stages, products, onSave, onClose }) {
  const [formData, setFormData] = useState(project || {
    hospitalName: '',
    clientType: 'รัฐบาล',
    title: '',
    details: '',
    assignee: members[0] ? members[0].name : '',
    productId: products[0] ? products[0].id : '',
    productName: products[0] ? products[0].name : '',
    productCategory: products[0] ? products[0].category : '',
    productBrand: products[0] ? products[0].brand : 'AERON MEDICAL',
    quantity: 1,
    budget: '',
    budgetType: 'งบลงทุน',
    budgetTrend: 'ขาขึ้น',
    procurementDate: '',
    demoStatus: 'ยังไม่ได้เข้าเดโม่',
    demoStartDate: '',
    demoEndDate: '',
    decisionMakers: '',
    dfAmount: '',
    competitors: '',
    winProbability: 50,
    status: stages[0].id
  });

  const handleProductSelect = (productId) => {
    const selected = products.find(p => p.id === productId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        productId: selected.id,
        productName: selected.name,
        productCategory: selected.category,
        productBrand: selected.brand || 'AERON MEDICAL'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.title.trim()) {
      alert('กรุณากรอกชื่อโรงพยาบาลและชื่องานโครงการ');
      return;
    }
    onSave({
      ...formData,
      budget: Number(formData.budget) || 0,
      quantity: Number(formData.quantity) || 1,
      winProbability: Number(formData.winProbability) || 50
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
            <span>🏥 {project ? 'แก้ไขข้อมูลโครงการ' : 'เพิ่มโครงการโรงพยาบาลใหม่'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">ชื่อโรงพยาบาล / หน่วยงาน <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทลูกค้า</label>
              <select
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                <option value="รัฐบาล">🏛️ รัฐบาล</option>
                <option value="เอกชน">🏢 เอกชน</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่องาน / รายละเอียดโครงการจัดซื้อ <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น จัดซื้อเครื่องตรวจคลื่นหัวใจไฟฟ้า 12 ลีด 5 เครื่อง"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl space-y-3">
            <div className="text-emerald-300 font-semibold flex items-center justify-between">
              <span>📦 สินค้าเครื่องมือแพทย์ที่เสนอ (Central Catalog)</span>
              <span className="text-[10.5px] font-normal text-slate-400">เลือกจากคลังสินค้าส่วนกลาง</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300">เลือกรุ่นสินค้า</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none focus:border-emerald-500"
                >
                  {(products || []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand || 'AERON'}) - {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">จำนวนที่จัดซื้อ (ชุด)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono text-center outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">งบประมาณรวม (บาท) <span className="text-rose-400">*</span></label>
              <input
                type="number"
                required
                placeholder="เช่น 4500000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทงบประมาณ</label>
              <select
                value={formData.budgetType}
                onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                {window.BUDGET_TYPES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium outline-none focus:border-emerald-500"
              >
                {(members || []).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ขั้นตอนการติดตาม (Stage)</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <label className="font-semibold">โอกาสได้งาน (%)</label>
                <span className="font-mono text-purple-300 font-bold">{formData.winProbability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.winProbability}
                onChange={(e) => setFormData({ ...formData, winProbability: e.target.value })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">กำหนดจัดซื้อจัดจ้างเมื่อไหร่</label>
              <input
                type="date"
                value={formData.procurementDate}
                onChange={(e) => setFormData({ ...formData, procurementDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ค่า DF (Doctor Fee / ดำเนินงาน)</label>
              <input
                type="text"
                placeholder="เช่น 150,000 บาท"
                value={formData.dfAmount}
                onChange={(e) => setFormData({ ...formData, dfAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-purple-200 font-semibold">
              <span>🧪 สถานะและวันนัดเดโม่เครื่อง (Demo Schedule)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">สถานะเดโม่</label>
                <select
                  value={formData.demoStatus}
                  onChange={(e) => setFormData({ ...formData, demoStatus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="ยังไม่ได้เข้าเดโม่">ยังไม่ได้เข้าเดโม่</option>
                  <option value="นัดหมายแล้ว">นัดหมายแล้ว</option>
                  <option value="กำลังเดโม่">กำลังเดโม่</option>
                  <option value="เดโม่เสร็จสิ้น">เดโม่เสร็จสิ้น</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">วันเริ่มนัดเดโม่</label>
                <input
                  type="date"
                  value={formData.demoStartDate}
                  onChange={(e) => setFormData({ ...formData, demoStartDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">ถึงวันที่ (สิ้นสุด)</label>
                <input
                  type="date"
                  value={formData.demoEndDate}
                  onChange={(e) => setFormData({ ...formData, demoEndDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รายชื่ออาจารย์ที่ตัดสินใจ</label>
              <textarea
                rows="2"
                placeholder="เช่น ศ.ดร.นพ.สมศักดิ์ (หัวหน้าภาควิชา), นพ.วิชัย"
                value={formData.decisionMakers}
                onChange={(e) => setFormData({ ...formData, decisionMakers: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">คู่แข่งเป็นใคร (Competitors)</label>
              <textarea
                rows="2"
                placeholder="เช่น แบรนด์ A (บริษัท เมดิคอลไบโอ), แบรนด์ B"
                value={formData.competitors}
                onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows="2"
              placeholder="เงื่อนไขสเปก ข้อตกลงพิเศษ หรือข้อคิดเห็นเพิ่มเติม..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-600/30">
              💾 บันทึกโครงการ
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
