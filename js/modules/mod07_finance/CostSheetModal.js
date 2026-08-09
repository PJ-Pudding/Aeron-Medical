// MODULE: mod07_finance/CostSheetModal.js

function CostSheetModal({ calc, projects, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (calc) return { ...calc };
    const firstProj = projects[0] || {};
    let parsedDf = 0;
    let dfMissing = true;
    if (firstProj.dfAmount) {
      dfMissing = false;
      const numStr = String(firstProj.dfAmount).replace(/[^0-9.]/g, '');
      parsedDf = Number(numStr) || 0;
    }
    return {
      projectId: firstProj.id || '',
      projectName: firstProj.hospitalName ? `${firstProj.hospitalName} - ${firstProj.title}` : '',
      date: new Date().toISOString().split('T')[0],
      sellingPriceInVat: firstProj.budget || 4500000,
      costInVat: 3240000,
      dfType: 'amount',
      dfValue: parsedDf,
      dfMissing: dfMissing,
      salesCommPercent: 2.0,
      interestPercent: 7.0,
      taxPercent: 20.0,
      retentionPercent: 5.0,
      note: ''
    };
  });

  const handleProjectSelect = (projId) => {
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      let parsedDf = 0;
      let dfMissing = true;
      if (proj.dfAmount) {
        dfMissing = false;
        const numStr = String(proj.dfAmount).replace(/[^0-9.]/g, '');
        parsedDf = Number(numStr) || 0;
      }
      setFormData(prev => ({
        ...prev,
        projectId: projId,
        projectName: `${proj.hospitalName} - ${proj.title}`,
        sellingPriceInVat: proj.budget || prev.sellingPriceInVat,
        dfValue: parsedDf,
        dfMissing: dfMissing
      }));
    }
  };

  const computed = computeCostSheet(formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sellingPriceInVat || !formData.costInVat) {
      alert('กรุณากรอกราคาขายและราคาต้นทุน');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-lg">
              🧮
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">คำนวณราคาต้นทุนและราคาขายต่ำสุด</h3>
              <p className="text-xs text-slate-400">ใบวิเคราะห์ผลกำไรทางการเงินและเกณฑ์อนุมัติ (Financial Viability Sheet)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Project Selector & Date Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-300">เลือกโครงการจาก Sales Kanban <span className="text-rose-400">*</span></label>
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-semibold outline-none focus:border-emerald-500"
              >
                {(projects || []).map(p => (
                  <option key={p.id} value={p.id}>
                    🏥 {p.hospitalName} - {p.title} (โดย {p.assignee})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">วันที่คำนวณ</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          {/* Excel Calculation Table Replica */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 w-1/3 border-r border-slate-800">รายการ</th>
                  <th className="p-3 w-1/4 text-center border-r border-slate-800">%</th>
                  <th className="p-3 text-right">ราคา (บาท THB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                
                {/* 1. ราคาขาย In VAT */}
                <tr className="bg-emerald-950/20 hover:bg-emerald-950/40 transition-colors">
                  <td className="p-3 font-bold text-slate-100 font-sans border-r border-slate-800">
                    ราคาขาย In vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      required
                      value={formData.sellingPriceInVat}
                      onChange={(e) => setFormData({ ...formData, sellingPriceInVat: Number(e.target.value) })}
                      className="w-full max-w-[200px] bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 2. ราคาขาย Ex VAT */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ราคาขาย Ex vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.saleExVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 3. ทุน In VAT */}
                <tr className="bg-amber-950/20 hover:bg-amber-950/40 transition-colors">
                  <td className="p-3 font-bold text-slate-100 font-sans border-r border-slate-800">
                    ทุน In vat <span className="text-rose-400">*</span>
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      required
                      placeholder="ใส่ราคาต้นทุนรวม VAT"
                      value={formData.costInVat}
                      onChange={(e) => setFormData({ ...formData, costInVat: Number(e.target.value) })}
                      className="w-full max-w-[200px] bg-slate-900 border border-amber-500/50 text-amber-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 4. ทุน Ex VAT */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ทุน Ex vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 font-bold text-amber-400">
                    {(Number(computed?.costExVatPercent) || 0).toFixed(2)}%
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.costExVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 5. DF */}
                <tr className="bg-purple-950/20 hover:bg-purple-950/40 transition-colors">
                  <td className="p-3 font-bold text-purple-200 font-sans border-r border-slate-800">
                    <div className="flex items-center justify-between">
                      <span>df (Doctor Fee)</span>
                      {formData.dfMissing && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-normal">
                          ⚠️ เซลส์ไม่ได้ใส่มา (Admin เติมเอง)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.dfType === 'percent' ? formData.dfValue : (Number(computed?.dfPercent) || 0).toFixed(2)}
                        onChange={(e) => setFormData({ ...formData, dfType: 'percent', dfValue: Number(e.target.value), dfMissing: false })}
                        className="w-16 bg-slate-900 border border-purple-500/50 text-purple-300 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      value={formData.dfType === 'amount' ? formData.dfValue : Math.round(computed.dfAmount)}
                      onChange={(e) => setFormData({ ...formData, dfType: 'amount', dfValue: Number(e.target.value), dfMissing: false })}
                      className="w-full max-w-[200px] bg-slate-900 border border-purple-500/50 text-purple-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 6. Sales Commission */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    Sales (คอมเซลส์ 2% ราคาขาย Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.salesCommPercent}
                        onChange={(e) => setFormData({ ...formData, salesCommPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.salesCommAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 7. ดอก (Interest) */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ดอก (ดอกเบี้ยเงินทุน 7% ของทุน In VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.interestPercent}
                        onChange={(e) => setFormData({ ...formData, interestPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 8. ภาษี (Corporate Tax) */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ภาษี (20% ของกำไรขั้นต้น Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.taxPercent}
                        onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 9. Retention */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    Retention (ประกันผลงาน 5% ราคาขาย Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.retentionPercent}
                        onChange={(e) => setFormData({ ...formData, retentionPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.retentionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 10. กำไรก่อนภาษี / Net Profit Summary Row */}
                <tr className="bg-slate-950 border-t-2 border-slate-700 text-sm font-black">
                  <td className="p-3.5 text-white font-sans border-r border-slate-800">
                    กำไรสุทธิก่อนภาษี (Net Profit)
                  </td>
                  <td className={`p-3.5 text-center border-r border-slate-800 text-base font-extrabold ${
                    computed.netProfitPercent > 15 ? 'text-emerald-400' : computed.netProfitPercent >= 10 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {(Number(computed?.netProfitPercent) || 0).toFixed(2)}%
                  </td>
                  <td className={`p-3.5 text-right text-base font-extrabold ${
                    computed.netProfitAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {computed.netProfitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Profitability Status & Approval Rule Indicator */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${computed.statusColor}`}>
            <div className="space-y-0.5">
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>ผลการประเมินทางการเงิน:</span>
                <span className={`px-3 py-1 rounded-xl text-white text-xs font-bold ${computed.statusBadgeBg}`}>
                  {computed.statusText}
                </span>
              </div>
              <p className="text-xs opacity-90 font-sans">
                {computed.statusKey === 'approved' && 'อัตรากำไรสุทธิสูงกว่า 15% อยู่ในเกณฑ์อนุมัติให้ดำเนินการต่อได้ทันที'}
                {computed.statusKey === 'warning' && 'อัตรากำไรสุทธิระหว่าง 10% - 15% อยู่ในเกณฑ์ให้ทบทวนและตรวจสอบเงื่อนไขเพิ่มเติม'}
                {computed.statusKey === 'danger' && 'อัตรากำไรสุทธิต่ำกว่า 10% อยู่ในเกณฑ์ไม่อนุมัติโดยอัตโนมัติ ต้องเข้าหารือและขออนุมัติพิเศษจากคุณตู้'}
              </p>
            </div>

            <div className="text-right font-mono text-xs flex-shrink-0 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div>&gt;15%: อนุมัติ (เขียว)</div>
              <div>10-15%: รีวิว (เหลือง)</div>
              <div>&lt;10%: คุณตู้ (แดง)</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700"
            >
              🖨️ พิมพ์ใบคำนวณต้นทุน
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">ยกเลิก</button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30">
                💾 บันทึกสเปรดชีตต้นทุน
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
