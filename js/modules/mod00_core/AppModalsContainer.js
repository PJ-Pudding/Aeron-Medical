// MODULE: mod00_core/AppModalsContainer.js
// Centralized Popups & Modals Container extracted from App.js for Clean Architecture

function AppModalsContainer({
  // Demo Booking Modal
  isDemoModalOpen, setIsDemoModalOpen, demoPrefill, setDemoPrefill,
  projects, products, members, demoBookings, handleSaveDemoBooking,
  
  // Product Master Modal
  isProductModalOpen, setIsProductModalOpen, editingProduct, setEditingProduct,
  productCategories, handleUpdateCategories, handleSaveProduct,
  
  // Purchase Order Modal
  isPOModalOpen, setIsPOModalOpen, editingPO, setEditingPO, handleSavePO,
  
  // Repair Ticket Modal
  isRepairModalOpen, setIsRepairModalOpen, editingRepairTicket, setEditingRepairTicket,
  handleSaveRepairTicket,
  
  // Delivered / Sold Product Modal
  isSoldModalOpen, setIsSoldModalOpen, editingSoldAsset, setEditingSoldAsset,
  handleSaveSoldAsset,
  
  // Import Shipment Modal
  isShipmentModalOpen, setIsShipmentModalOpen, editingShipment, setEditingShipment,
  purchaseOrders, handleSaveShipment,
  
  // FDA Registration Modal
  isFDAModalOpen, setIsFDAModalOpen, editingFDA, setEditingFDA, handleSaveFDA,
  
  // Project History & Timeline Modal
  isHistoryModalOpen, setIsHistoryModalOpen, historyTargetProject, setHistoryTargetProject,
  handleAddWeeklyLog,
  
  // Cost Sheet Modal
  isCostModalOpen, setIsCostModalOpen, editingCostCalc, setEditingCostCalc,
  handleSaveCostCalc,
  
  // Demo Checklist Modal
  isChecklistModalOpen, setIsChecklistModalOpen, checklistTargetBooking, setChecklistTargetBooking,
  
  // Toast Notification
  toastNotification, setToastNotification, setActiveView,
  
  // Leave & Attendance Modals
  isLeaveModalOpen, setIsLeaveModalOpen, currentUser, handleSaveLeave,
  isAttendanceModalOpen, setIsAttendanceModalOpen, handleSaveAttendance,
  
  // User Accounts & System Notifications Modals
  isUserAccountModalOpen, setIsUserAccountModalOpen,
  isNotificationModalOpen, setIsNotificationModalOpen, systemAlerts,
  
  // Universal Report Viewer Modal
  isUniversalReportModalOpen, setIsUniversalReportModalOpen, activeReportId,
  soldProducts, fdaRegistrations, costCalculations, leaveRequests, attendanceLogs,
  
  // Category Manager & Login Modals
  isGlobalCategoryManagerOpen, setIsGlobalCategoryManagerOpen,
  isLoginModalOpen, setIsLoginModalOpen, handleLoginSuccess
}) {
  return (
    <>
      {/* Demo Booking Modal */}
      {isDemoModalOpen && (
        <DemoBookingModal
          prefill={demoPrefill}
          projects={projects}
          products={products}
          members={members}
          existingBookings={demoBookings}
          onSave={handleSaveDemoBooking}
          onClose={() => { setIsDemoModalOpen(false); setDemoPrefill(null); }}
        />
      )}

      {/* Product Master Modal */}
      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={productCategories}
          onUpdateCategories={handleUpdateCategories}
          onSave={handleSaveProduct}
          onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        />
      )}

      {/* Purchase Order Modal */}
      {isPOModalOpen && (
        <PurchaseOrderModal
          po={editingPO}
          projects={projects}
          products={products}
          onSave={handleSavePO}
          onClose={() => { setIsPOModalOpen(false); setEditingPO(null); }}
        />
      )}

      {/* Repair Ticket Modal */}
      {isRepairModalOpen && (
        <RepairTicketModal
          ticket={editingRepairTicket}
          products={products}
          members={members}
          onSave={handleSaveRepairTicket}
          onClose={() => { setIsRepairModalOpen(false); setEditingRepairTicket(null); }}
        />
      )}

      {/* Delivered / Sold Product Modal */}
      {isSoldModalOpen && (
        <SoldProductModal
          asset={editingSoldAsset}
          projects={projects}
          members={members}
          onSave={handleSaveSoldAsset}
          onClose={() => { setIsSoldModalOpen(false); setEditingSoldAsset(null); }}
        />
      )}

      {/* Import Logistics / Shipment Modal */}
      {isShipmentModalOpen && (
        <ShipmentModal
          shipment={editingShipment}
          purchaseOrders={purchaseOrders}
          products={products}
          onSave={handleSaveShipment}
          onClose={() => { setIsShipmentModalOpen(false); setEditingShipment(null); }}
        />
      )}

      {/* Thai FDA Registration Modal */}
      {isFDAModalOpen && (
        <FDAModal
          fda={editingFDA}
          products={products}
          members={members}
          onSave={handleSaveFDA}
          onClose={() => { setIsFDAModalOpen(false); setEditingFDA(null); }}
        />
      )}

      {/* Project History & Activity Timeline Modal */}
      {isHistoryModalOpen && historyTargetProject && (
        <ProjectHistoryModal
          project={historyTargetProject}
          members={members}
          stages={window.STAGES}
          products={products}
          onAddLog={handleAddWeeklyLog}
          onClose={() => { setIsHistoryModalOpen(false); setHistoryTargetProject(null); }}
        />
      )}

      {/* Cost & Minimum Selling Price Financial Sheet Modal */}
      {isCostModalOpen && (
        <CostSheetModal 
          calc={editingCostCalc}
          projects={projects}
          onSave={handleSaveCostCalc}
          onClose={() => { setIsCostModalOpen(false); setEditingCostCalc(null); }}
        />
      )}

      {/* Demo Checklist Modal */}
      {isChecklistModalOpen && checklistTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>📋 รายการตรวจสอบคิวเครื่อง Demo (Checklist)</span>
              </h3>
              <button 
                onClick={() => { setIsChecklistModalOpen(false); setChecklistTargetBooking(null); }}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400">🏥 โรงพยาบาล: {checklistTargetBooking.hospitalName || checklistTargetBooking.hospital}</div>
                <div className="text-slate-400">📦 สินค้า: {checklistTargetBooking.productName}</div>
                <div className="text-amber-300 font-mono">📅 {checklistTargetBooking.startDate || 'N/A'} ถึง {checklistTargetBooking.endDate || 'N/A'}</div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950/40 rounded-lg hover:bg-slate-950/80">
                  <input type="checkbox" defaultChecked className="accent-emerald-500 rounded" />
                  <span>ตรวจสอบสภาพเครื่องก่อนส่งมอบ (Hardware Inspection)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950/40 rounded-lg hover:bg-slate-950/80">
                  <input type="checkbox" defaultChecked className="accent-emerald-500 rounded" />
                  <span>อุปกรณ์เสริมครบถ้วน (Accessories Checklist)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950/40 rounded-lg hover:bg-slate-950/80">
                  <input type="checkbox" className="accent-emerald-500 rounded" />
                  <span>ใบรับ-ส่งเครื่อง และเอกสารยินยอมทดลองใช้งาน</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => { setIsChecklistModalOpen(false); setChecklistTargetBooking(null); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                บันทึกเรียบร้อย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification when Sales Wins a Project */}
      {toastNotification && toastNotification.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900/95 border-2 border-amber-500/80 p-4 rounded-2xl shadow-2xl shadow-amber-500/30 text-white backdrop-blur-md animate-modal space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🔔</span>
              <h4 className="font-bold text-amber-300 text-sm leading-snug">{toastNotification.title}</h4>
            </div>
            <button onClick={() => setToastNotification(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <p className="text-xs text-slate-300">{toastNotification.message}</p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => { setActiveView('purchase_orders'); setToastNotification(null); }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/30"
            >
              🛒 ไปยังหน้าสั่งซื้อ Vendor (PO)
            </button>
            <button
              onClick={() => setToastNotification(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {isLeaveModalOpen && (
        <LeaveModal
          members={members}
          currentUser={currentUser}
          onSave={handleSaveLeave}
          onClose={() => setIsLeaveModalOpen(false)}
        />
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <AttendanceModal
          members={members}
          onSave={handleSaveAttendance}
          onClose={() => setIsAttendanceModalOpen(false)}
        />
      )}

      {/* User Account Management Modal (Root Level - Top Z-Index 1000) */}
      {isUserAccountModalOpen && (
        <UserAccountManagementModal
          isOpen={isUserAccountModalOpen}
          onClose={() => setIsUserAccountModalOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* 🔔 Smart Notification Action Center Modal */}
      {isNotificationModalOpen && (
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          currentUser={currentUser}
          alerts={systemAlerts}
        />
      )}

      {/* 📊 Universal Report Viewer Modal */}
      {isUniversalReportModalOpen && (
        <UniversalReportModal
          isOpen={isUniversalReportModalOpen}
          onClose={() => setIsUniversalReportModalOpen(false)}
          reportId={activeReportId}
          appState={{
            projects,
            members,
            products,
            demoBookings,
            purchaseOrders,
            shipments,
            repairTickets,
            soldProducts,
            fdaRegistrations,
            costCalculations,
            leaveRequests,
            attendanceLogs,
            accountingTransactions: window.INITIAL_ACCOUNTING_TRANSACTIONS || [],
            currentUser
          }}
        />
      )}

      {/* Global Category Master Data Manager Modal */}
      <CategoryManagerModal
        isOpen={isGlobalCategoryManagerOpen}
        onClose={() => setIsGlobalCategoryManagerOpen(false)}
        categories={productCategories || window.PRODUCT_CATEGORIES || []}
        onUpdateCategories={handleUpdateCategories}
      />

      {/* Login & Role Switcher Modal */}
      {(isLoginModalOpen || !currentUser) && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsLoginModalOpen(false)}
          isSwitching={!!currentUser}
        />
      )}
    </>
  );
}
