// ====================================================
// MODULE: mod04_logistics/CategoryManagerModal.js
// ⚙️ Category Master Data Manager Modal (เพิ่ม/แก้ไข/ลบ/รีเซ็ต ประเภทสินค้า)
// ====================================================

function CategoryManagerModal({
  isOpen,
  onClose,
  categories = [],
  onUpdateCategories
}) {
  const [catList, setCatList] = useState(categories || []);
  const [newCatInput, setNewCatInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCatList(categories);
    }
  }, [categories]);

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (catList.includes(trimmed)) {
      alert('มีประเภทสินค้านี้อยู่ในระบบแล้ว');
      return;
    }
    const updated = [...catList, trimmed];
    setCatList(updated);
    setNewCatInput('');
    if (onUpdateCategories) onUpdateCategories(updated);
  };

  const handleStartEdit = (index, val) => {
    setEditingIndex(index);
    setEditValue(val);
  };

  const handleSaveEdit = (index) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const updated = [...catList];
    updated[index] = trimmed;
    setCatList(updated);
    setEditingIndex(null);
    setEditValue('');
    if (onUpdateCategories) onUpdateCategories(updated);
  };

  const handleDelete = (index) => {
    const item = catList[index];
    if (window.confirm(`คุณต้องการลบประเภทสินค้า "${item}" ออกจากระบบใช่หรือไม่?`)) {
      const updated = catList.filter((_, i) => i !== index);
      setCatList(updated);
      if (onUpdateCategories) onUpdateCategories(updated);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('คุณต้องการรีเซ็ตประเภทสินค้ากลับเป็นค่ามาตรฐาน 6 หมวดหมู่ของโรงพยาบาลใช่หรือไม่?')) {
      const defaults = [
        'เครื่องตรวจคลื่นหัวใจ (ECG/EKG)',
        'ระบบเครื่องอัลตราซาวด์ (Ultrasound)',
        'เตียงผ่าตัด & โคมไฟผ่าตัด (Surgical System)',
        'เครื่องช่วยหายใจ (Ventilator)',
        'ระบบเฝ้าระวังผู้ป่วยวิกฤต (Central Monitor)',
        'เครื่องมือแพทย์อื่นๆ'
      ];
      setCatList(defaults);
      if (onUpdateCategories) onUpdateCategories(defaults);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl border border-indigo-500/30 shadow-md">
              ⚙️
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>จัดการฐานข้อมูลประเภทสินค้า</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  MASTER DATA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                เพิ่ม แก้ไข หรือลบหมวดหมู่สินค้าสำหรับการลงทะเบียนและตัวกรอง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Quick Add Box */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>➕</span> <span>เพิ่มประเภทสินค้าใหม่ในฐานข้อมูล</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="เช่น เครื่องวัดสัญญาณชีพ, เครื่องฟอกไต, เครื่องเอกซเรย์..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-sans"
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span>➕ เพิ่มรายการ</span>
              </button>
            </div>
          </div>

          {/* Current Categories Table/List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>รายการประเภทสินค้าปัจจุบัน ({catList.length} หมวดหมู่):</span>
              <button
                onClick={handleResetDefaults}
                className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 underline"
              >
                <span>🔄 คืนค่าเริ่มต้น</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
              {catList.map((cat, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                  
                  {editingIndex === idx ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                        className="flex-1 bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white outline-none font-sans"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(idx)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-[11px]"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {cat}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStartEdit(idx, cat)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-indigo-300 transition-all text-xs"
                          title="แก้ไขชื่อ"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-all text-xs"
                          title="ลบรายการ"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}

window.CategoryManagerModal = CategoryManagerModal;
