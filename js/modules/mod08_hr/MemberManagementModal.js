// MODULE: mod08_hr/MemberManagementModal.js

function MemberManagementModal({ members, setMembers, onClose }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Sales Specialist');
  const [avatar, setAvatar] = useState('👨‍⚕️');

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newMember = {
      id: 'm-' + Date.now(),
      name,
      role,
      avatar
    };
    setMembers([...members, newMember]);
    setName('');
  };

  const handleDelete = (id) => {
    if (window.confirm('ลบสมาชิกท่านนี้ใช่หรือไม่?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-modal">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base">👥 จัดการรายชื่อสมาชิกในทีม</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(members || []).map(m => (
            <div key={m.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{m.avatar}</span>
                <div>
                  <div className="font-semibold text-white">{m.name}</div>
                  <div className="text-[10px] text-slate-400">{m.role}</div>
                </div>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-rose-400 p-1.5 rounded-lg">🗑️</button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddMember} className="space-y-2 pt-2 border-t border-slate-800 text-xs">
          <h4 className="font-semibold text-slate-300">➕ เพิ่มสมาชิกคนใหม่</h4>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              required
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
            >
              <option value="Sales Specialist">Sales</option>
              <option value="Medical Representative">Med Rep</option>
              <option value="Product Specialist">Product Spec</option>
              <option value="Key Account Manager">KAM</option>
            </select>
            <select
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none text-center"
            >
              <option value="👨‍⚕️">👨‍⚕️</option>
              <option value="👩‍⚕️">👩‍⚕️</option>
              <option value="👨‍💼">👨‍💼</option>
              <option value="👩‍💼">👩‍💼</option>
              <option value="🧑‍💻">🧑‍💻</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium mt-2">
            + บันทึกเพิ่มสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
}
