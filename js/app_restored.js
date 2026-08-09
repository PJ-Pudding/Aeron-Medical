const fs = require('fs');

// We can read lines 1 to 994 from app.js, then inject clean main content layout
let code = fs.readFileSync('d:/Team Projects/js/app.js', 'utf8');

const mainLayout = `
        {/* Main Content Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-[1920px] w-full mx-auto space-y-6">

          {/* TAB 1: Dashboard */}
          {activeSidebarTab === 'dashboard' && (
            <ManagerDashboard 
              projects={filteredProjects}
              members={members}
              products={products}
              demoBookings={demoBookings}
              soldProducts={soldProducts}
              repairTickets={repairTickets}
              shipments={shipments}
              purchaseOrders={purchaseOrders}
              fdaRegistrations={fdaRegistrations}
              onOpenNewModal={() => { setEditingProject(null); setIsModalOpen(true); }}
              onSelectProject={(p) => setSelectedProjectForDetail(p)}
            />
          )}

          {/* TAB 2: Clients */}
          {activeSidebarTab === 'clients' && (
            <ClientsDirectoryView 
              projects={projects}
              members={members}
              onSelectProject={(p) => setSelectedProjectForDetail(p)}
            />
          )}

          {/* TAB 3: Project (Kanban) */}
          {activeSidebarTab === 'project' && (
            <>
              {activeView === 'kanban' && (
                <KanbanBoard 
                  projects={filteredProjects}
                  onMoveStage={handleMoveStage}
                  onEditProject={(p) => { setEditingProject(p); setIsModalOpen(true); }}
                  onDeleteProject={handleDeleteProject}
                  onSelectProject={(p) => setSelectedProjectForDetail(p)}
                  onOpenNewModal={() => { setEditingProject(null); setIsModalOpen(true); }}
                />
              )}

              {activeView === 'list' && (
                <ProjectListView 
                  projects={filteredProjects}
                  onEditProject={(p) => { setEditingProject(p); setIsModalOpen(true); }}
                  onDeleteProject={handleDeleteProject}
                  onSelectProject={(p) => setSelectedProjectForDetail(p)}
                  onOpenNewModal={() => { setEditingProject(null); setIsModalOpen(true); }}
                />
              )}

              {activeView === 'member_kanban' && (
                <MemberKanban 
                  projects={filteredProjects}
                  members={members}
                  onMoveStage={handleMoveStage}
                  onEditProject={(p) => { setEditingProject(p); setIsModalOpen(true); }}
                  onDeleteProject={handleDeleteProject}
                  onSelectProject={(p) => setSelectedProjectForDetail(p)}
                />
              )}
            </>
          )}

          {/* TAB 4: Logistic */}
          {activeSidebarTab === 'logistic' && (
            <div className="space-y-6">
              {logisticSubView === 'product_catalog' && (
                <ProductCatalogView 
                  products={products}
                  demoBookings={demoBookings}
                  onOpenNewProduct={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                  onEditProduct={(product) => { setEditingProduct(product); setIsProductModalOpen(true); }}
                  onDeleteProduct={(id) => setProducts(prev => prev.filter(p => p.id !== id))}
                  onOpenRepairModal={handleOpenRepairFromCatalog}
                />
              )}

              {logisticSubView === 'shipment_tracking' && (
                <ShipmentTrackingView 
                  shipments={shipments}
                  purchaseOrders={purchaseOrders}
                  products={products}
                  onOpenNewShipment={(prefill) => { setEditingShipment(prefill); setIsShipmentModalOpen(true); }}
                  onEditShipment={(shipment) => { setEditingShipment(shipment); setIsShipmentModalOpen(true); }}
                  onDeleteShipment={handleDeleteShipment}
                />
              )}

              {logisticSubView === 'messenger_trips' && (
                <MessengerTripsView
                  messengerTrips={messengerTrips}
                  members={members}
                  onOpenNewTrip={() => { setEditingMessengerTrip(null); setIsMessengerTripModalOpen(true); }}
                  onEditTrip={(trip) => { setEditingMessengerTrip(trip); setIsMessengerTripModalOpen(true); }}
                  onDeleteTrip={handleDeleteMessengerTrip}
                />
              )}

              {logisticSubView === 'repair_service' && (
                <RepairServiceView 
                  repairTickets={repairTickets}
                  products={products}
                  members={members}
                  onOpenNewTicket={(prefill) => { setEditingRepairTicket(prefill); setIsRepairModalOpen(true); }}
                  onEditTicket={(ticket) => { setEditingRepairTicket(ticket); setIsRepairModalOpen(true); }}
                  onDeleteTicket={handleDeleteRepairTicket}
                  onViewInCatalog={(pName) => { setLogisticSubView('product_catalog'); }}
                />
              )}

              {logisticSubView === 'sold_products' && (
                <SoldProductsView 
                  soldProducts={soldProducts}
                  projects={projects}
                  members={members}
                  onOpenNewAsset={(prefill) => { setEditingSoldAsset(prefill); setIsSoldModalOpen(true); }}
                  onEditAsset={(asset) => { setEditingSoldAsset(asset); setIsSoldModalOpen(true); }}
                  onDeleteAsset={handleDeleteSoldAsset}
                />
              )}
            </div>
          )}

          {/* TAB 5: Calendar */}
          {activeSidebarTab === 'calendar' && (
            <DemoCalendarView 
              demoBookings={demoBookings}
              products={products}
              projects={projects}
              members={members}
              currentUser={currentUser}
              onOpenBookDemo={() => { setDemoPrefill(null); setIsDemoModalOpen(true); }}
              onDeleteBooking={(id) => setDemoBookings(prev => prev.filter(b => b.id !== id))}
              onUpdateStatus={handleUpdateBookingStatus}
              onOpenChecklist={(b) => { setChecklistTargetBooking(b); setIsChecklistModalOpen(true); }}
            />
          )}

          {/* TAB 6: Report */}
          {activeSidebarTab === 'report' && (
            <div className="space-y-6">
              {reportSubView === 'fda_registration' && (
                <FDARegistrationView 
                  fdaRegistrations={fdaRegistrations}
                  products={products}
                  members={members}
                  onOpenNewFDA={(prefill) => { setEditingFDA(prefill); setIsFDAModalOpen(true); }}
                  onEditFDA={(fda) => { setEditingFDA(fda); setIsFDAModalOpen(true); }}
                  onDeleteFDA={handleDeleteFDA}
                />
              )}

              {reportSubView === 'analytics_reports' && (
                <AnalyticalReportsView
                  projects={projects}
                  members={members}
                  products={products}
                  costCalculations={costCalculations}
                  purchaseOrders={purchaseOrders}
                  shipments={shipments}
                  messengerTrips={messengerTrips}
                  repairTickets={repairTickets}
                  soldProducts={soldProducts}
                  fdaRegistrations={fdaRegistrations}
                  leaveRequests={leaveRequests}
                  attendanceLogs={attendanceLogs}
                />
              )}

              {reportSubView === 'activity_logs' && (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                      <span>🔐 ประวัติการใช้งานระบบ (System Activity Audit Logs)</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">ทั้งหมด {activityLogs.length} รายการ</span>
                  </div>
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 uppercase text-[10px] text-slate-400 sticky top-0">
                        <tr>
                          <th className="p-3">วัน-เวลา</th>
                          <th className="p-3">ผู้ใช้งาน</th>
                          <th className="p-3">ตำแหน่ง</th>
                          <th className="p-3">กิจกรรมที่ทำ</th>
                          <th className="p-3">เป้าหมาย/ระบบ</th>
                          <th className="p-3">รายละเอียดเพิ่มเติม</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {activityLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-900/40">
                            <td className="p-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                            <td className="p-3 font-bold text-amber-300">{log.fullName}</td>
                            <td className="p-3 text-slate-400">{log.role}</td>
                            <td className="p-3 font-bold text-emerald-400">{log.action}</td>
                            <td className="p-3 text-indigo-300">{log.target}</td>
                            <td className="p-3 text-slate-300 text-[11px]">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Finance */}
          {activeSidebarTab === 'finance' && (
            <div className="space-y-6">
              {financeSubView === 'cost_calculation' && (
                <CostCalculationView 
                  costCalculations={costCalculations}
                  projects={projects}
                  members={members}
                  onOpenNewCalc={(prefill) => { setEditingCostCalc(prefill); setIsCostModalOpen(true); }}
                  onEditCalc={(calc) => { setEditingCostCalc(calc); setIsCostModalOpen(true); }}
                  onDeleteCalc={handleDeleteCostCalc}
                />
              )}

              {financeSubView === 'purchase_orders' && (
                <PurchaseOrderView 
                  purchaseOrders={purchaseOrders}
                  projects={projects}
                  products={products}
                  onOpenNewPO={(prefillProj) => { setEditingPO(prefillProj ? { projectId: prefillProj.id, hospitalName: prefillProj.hospitalName, productName: prefillProj.productName, quantity: prefillProj.quantity, totalAmountTHB: prefillProj.budget } : null); setIsPOModalOpen(true); }}
                  onEditPO={(po) => { setEditingPO(po); setIsPOModalOpen(true); }}
                  onDeletePO={handleDeletePO}
                />
              )}
            </div>
          )}

          {/* TAB 8: HR */}
          {activeSidebarTab === 'hr' && (
            <div className="space-y-6">
              {hrSubView === 'leave_attendance' && (
                <LeaveAttendanceView 
                  members={members}
                  leaveRequests={leaveRequests}
                  attendanceLogs={attendanceLogs}
                  onOpenLeaveModal={() => { setEditingLeave(null); setIsLeaveModalOpen(true); }}
                  onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
                  onDeleteLeave={handleDeleteLeave}
                  onDeleteAttendance={handleDeleteAttendance}
                />
              )}

              {hrSubView === 'team_roster' && (
                <TeamRosterView 
                  members={members}
                  onOpenMemberModal={() => setIsMemberModalOpen(true)}
                  onDeleteMember={handleDeleteMember}
                />
              )}
            </div>
          )}

        </main>
      </div>

      {/* Render Modals */}
      {isModalOpen && (
        <NewProjectModal 
          editingProject={editingProject}
          members={members}
          onSave={handleSaveProject}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isMemberModalOpen && (
        <MemberModal 
          members={members}
          onSave={handleSaveMember}
          onDelete={handleDeleteMember}
          onClose={() => setIsMemberModalOpen(false)}
        />
      )}

      {isDemoModalOpen && (
        <DemoBookingModal 
          prefill={demoPrefill}
          products={products}
          projects={projects}
          members={members}
          onSave={handleSaveDemoBooking}
          onClose={() => setIsDemoModalOpen(false)}
        />
      )}

      {isProductModalOpen && (
        <ProductModal 
          editingProduct={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => setIsProductModalOpen(false)}
        />
      )}

      {isRepairModalOpen && (
        <RepairTicketModal 
          editingTicket={editingRepairTicket}
          products={products}
          members={members}
          projects={projects}
          onSave={handleSaveRepairTicket}
          onClose={() => setIsRepairModalOpen(false)}
        />
      )}

      {isSoldModalOpen && (
        <SoldAssetModal 
          editingAsset={editingSoldAsset}
          projects={projects}
          products={products}
          members={members}
          onSave={handleSaveSoldAsset}
          onClose={() => setIsSoldModalOpen(false)}
        />
      )}

      {isShipmentModalOpen && (
        <ShipmentModal 
          editingShipment={editingShipment}
          purchaseOrders={purchaseOrders}
          products={products}
          members={members}
          onSave={handleSaveShipment}
          onClose={() => setIsShipmentModalOpen(false)}
        />
      )}

      {isFDAModalOpen && (
        <FDAModal 
          editingFDA={editingFDA}
          products={products}
          members={members}
          onSave={handleSaveFDA}
          onClose={() => setIsFDAModalOpen(false)}
        />
      )}

      {isLeaveModalOpen && (
        <LeaveRequestModal 
          editingLeave={editingLeave}
          members={members}
          onSave={handleSaveLeaveRequest}
          onClose={() => setIsLeaveModalOpen(false)}
        />
      )}

      {isAttendanceModalOpen && (
        <AttendanceModal 
          members={members}
          onSave={handleSaveAttendanceLog}
          onClose={() => setIsAttendanceModalOpen(false)}
        />
      )}

      {isCostModalOpen && (
        <CostCalculationModal 
          editingCostCalc={editingCostCalc}
          projects={projects}
          products={products}
          members={members}
          onSave={handleSaveCostCalc}
          onClose={() => setIsCostModalOpen(false)}
        />
      )}

      {isPOModalOpen && (
        <PurchaseOrderModal 
          editingPO={editingPO}
          projects={projects}
          products={products}
          members={members}
          onSave={handleSavePO}
          onClose={() => setIsPOModalOpen(false)}
        />
      )}

      {isMessengerTripModalOpen && (
        <MessengerTripModal
          editingTrip={editingMessengerTrip}
          members={members}
          onSave={handleSaveMessengerTrip}
          onClose={() => setIsMessengerTripModalOpen(false)}
        />
      )}

      {selectedProjectForDetail && (
        <ProjectDetailModal 
          project={selectedProjectForDetail}
          members={members}
          demoBookings={demoBookings}
          costCalculations={costCalculations}
          purchaseOrders={purchaseOrders}
          soldProducts={soldProducts}
          onClose={() => setSelectedProjectForDetail(null)}
          onOpenCostCalc={(proj) => { setSelectedProjectForDetail(null); setEditingCostCalc({ projectId: proj.id, hospitalName: proj.hospitalName, productName: proj.productName, budgetTHB: proj.budget }); setIsCostModalOpen(true); }}
          onOpenPO={(proj) => { setSelectedProjectForDetail(null); setEditingPO({ projectId: proj.id, hospitalName: proj.hospitalName, productName: proj.productName, quantity: proj.quantity, totalAmountTHB: proj.budget }); setIsPOModalOpen(true); }}
          onOpenDemo={(proj) => { setSelectedProjectForDetail(null); setDemoPrefill(proj); setIsDemoModalOpen(true); }}
        />
      )}

      {isChecklistModalOpen && checklistTargetBooking && (
        <ChecklistModal
          booking={checklistTargetBooking}
          products={products}
          onClose={() => setIsChecklistModalOpen(false)}
        />
      )}

      {isAiModalOpen && (
        <AiAnalysisModal 
          projects={projects}
          members={members}
          soldProducts={soldProducts}
          purchaseOrders={purchaseOrders}
          costCalculations={costCalculations}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}

    </div>
  );
}

// ----------------------------------------------------
// ReactDOM Render Root Mount
// ----------------------------------------------------
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
`;

// Find where <Header ... /> ends (after onOpenActivityLogs)
let headerEndIndex = code.indexOf("onOpenActivityLogs={() => setIsActivityLogModalOpen(true)}\n        />");
if (headerEndIndex === -1) {
  headerEndIndex = code.indexOf("onOpenActivityLogs={() => setIsActivityLogModalOpen(true)}");
}

if (headerEndIndex !== -1) {
  let cutPoint = code.indexOf("/>", headerEndIndex) + 2;
  let prefix = code.substring(0, cutPoint);
  let finalCode = prefix + mainLayout;
  fs.writeFileSync('d:/Team Projects/js/app.js', finalCode, 'utf8');
  console.log('Successfully reconstructed clean app.js return layout!');
} else {
  console.error('Could not find Header end cut point');
}
