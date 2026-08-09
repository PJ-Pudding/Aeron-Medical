// MODULE: mod06_fda/ReportPreviewModal.js

function ReportPreviewModal({ report, projects, messengerTrips, purchaseOrders, repairTickets, fdaRegistrations, leaveRequests, onClose }) {

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 space-y-6 shadow-2xl animate-modal text-xs my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Action Controls Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">{report.icon}</span>
            <h3 className="font-extrabold text-white text-base">{report.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
            >
              <span>🖨️ พิมพ์เอกสาร (Print / PDF)</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-base px-2">✕</button>
          </div>
        </div>

        {/* Printable Formal Document Sheet */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-inner space-y-6 print:p-0 print:shadow-none print:bg-transparent">
          
          {/* Formal Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <img src="./assets/logo.jpg" alt="AERON Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-wider">บริษัท แอโรน เมดิคอล จำกัด (AERON MEDICAL CO., LTD.)</h1>
                <p className="text-[11px] text-slate-600">ผู้นำเข้าและจัดจำหน่ายเครื่องมือแพทย์ อุปกรณ์การแพทย์สาธิต และบริการทางการแพทย์</p>
                <p className="text-[10px] text-slate-500">เลขประจำตัวผู้เสียภาษี: 0105565098765 | สำนักงานใหญ่: กรุงเทพมหานคร</p>
              </div>
            </div>
            <div className="text-right text-[11px]">
              <div className="font-bold text-indigo-900">เอกสารรายงานสรุปผู้บริหาร</div>
              <div className="text-slate-600 font-mono">วันที่ออกเอกสาร: {new Date().toLocaleDateString('th-TH')}</div>
              <div className="text-slate-500 font-mono">รหัสรายงาน: {report.id.toUpperCase()}</div>
            </div>
          </div>

          {/* Report Title Banner */}
          <div className="text-center space-y-1 bg-slate-100 p-3 rounded-lg border border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900">{report.title}</h2>
            <p className="text-xs text-slate-600">{report.desc}</p>
          </div>

          {/* Key Summary Boxes */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px] font-bold">{report.stat1Label}</div>
              <div className="text-lg font-black text-indigo-900 font-mono mt-0.5">{report.stat1Val}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px] font-bold">{report.stat2Label}</div>
              <div className="text-lg font-black text-emerald-900 font-mono mt-0.5">{report.stat2Val}</div>
            </div>
          </div>

          {/* Report Detailed Data Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">ตารางแสดงรายละเอียดข้อมูลทางการ (Data Detail Table):</h4>
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-left text-[11px] text-slate-800">
                <thead className="bg-slate-200 text-slate-900 uppercase font-bold border-b border-slate-300">
                  {report.category === 'messenger' ? (
                    <tr>
                      <th className="p-2">วันที่</th>
                      <th className="p-2">แมสเซ็นเจอร์</th>
                      <th className="p-2">ต้นทาง ➔ ปลายทาง</th>
                      <th className="p-2 text-center">ระยะทาง (กม.)</th>
                      <th className="p-2">ประเภทวัน</th>
                      <th className="p-2 text-right">ค่าเที่ยว (บาท)</th>
                    </tr>
                  ) : report.category === 'sales' || report.category === 'clients' ? (
                    <tr>
                      <th className="p-2">โรงพยาบาล</th>
                      <th className="p-2">ชื่อโครงการ</th>
                      <th className="p-2">ประเภทลูกค้า</th>
                      <th className="p-2">ผู้ดูแล (Sales)</th>
                      <th className="p-2">สถานะ Stage</th>
                      <th className="p-2 text-right">งบประมาณ (บาท)</th>
                    </tr>
                  ) : report.category === 'finance' ? (
                    <tr>
                      <th className="p-2">เลขที่ PO</th>
                      <th className="p-2">ผู้ขาย (Vendor)</th>
                      <th className="p-2">รายการสินค้า</th>
                      <th className="p-2">วันกำหนดส่ง</th>
                      <th className="p-2">สถานะ</th>
                      <th className="p-2 text-right">รวมเงิน (บาท)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-2">ลำดับ</th>
                      <th className="p-2">รายการ / ชื่ออ้างอิง</th>
                      <th className="p-2">รายละเอียด</th>
                      <th className="p-2">สถานะ</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.category === 'messenger' ? (
                    messengerTrips.slice(0, 15).map((t, idx) => (
                      <tr key={t.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono">{t.date}</td>
                        <td className="p-2 font-bold">{t.messengerName}</td>
                        <td className="p-2">{t.origin} ➔ {t.destination}</td>
                        <td className="p-2 text-center font-mono">{t.distanceKm} กม.</td>
                        <td className="p-2">{t.isHoliday ? '🚩 วันหยุด' : 'วันปกติ'}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-900">{t.feeAmount} บาท</td>
                      </tr>
                    ))
                  ) : report.category === 'finance' ? (
                    purchaseOrders.slice(0, 15).map((po, idx) => (
                      <tr key={po.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold">{po.poNumber}</td>
                        <td className="p-2">{po.supplierName}</td>
                        <td className="p-2">{po.productName}</td>
                        <td className="p-2 font-mono">{po.expectedDeliveryDate}</td>
                        <td className="p-2">{po.status}</td>
                        <td className="p-2 text-right font-mono font-bold">{Number(po.totalPrice).toLocaleString()} บาท</td>
                      </tr>
                    ))
                  ) : (
                    projects.slice(0, 15).map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold">{p.hospitalName}</td>
                        <td className="p-2">{p.projectName}</td>
                        <td className="p-2">{p.clientType}</td>
                        <td className="p-2">{p.assignee}</td>
                        <td className="p-2">{p.stage}</td>
                        <td className="p-2 text-right font-mono font-bold">{Number(p.budget).toLocaleString()} บาท</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formal Approval Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-[11px] text-slate-700">
            <div className="space-y-8">
              <div className="border-b border-dashed border-slate-400 pb-1 font-mono">ลงชื่อ..........................................................</div>
              <div>
                <div className="font-bold text-slate-900">( ผู้จัดทำรายงาน / Reporter )</div>
                <div className="text-slate-500">ตำแหน่ง: ผู้ช่วยบริหารงานโครงการ</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-dashed border-slate-400 pb-1 font-mono">ลงชื่อ..........................................................</div>
              <div>
                <div className="font-bold text-slate-900">( หัวหน้าฝ่ายปฏิบัติการ / Manager )</div>
                <div className="text-slate-500">ตำแหน่ง: ผู้จัดการฝ่ายปฏิบัติการ</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-dashed border-slate-400 pb-1 font-mono">ลงชื่อ..........................................................</div>
              <div>
                <div className="font-bold text-slate-900">( คุณตู้ / Owner & Managing Director )</div>
                <div className="text-slate-500">กรรมการผู้จัดการ บริษัท แอโรน เมดิคอล จำกัด</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
