// ====================================================
// MODULE: mod00_core/hooks/useAeronAccounting.js
// 💰 Domain Hook: Accounting Transactions, Bank Accounts & Purchase Orders
// ====================================================

function useAeronAccounting({ setShipments }) {
  const isHydrated = useRef(false);

  // 1. Transactions State
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_accounting_txns');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const rawList = typeof window.sanitizeThaiData === 'function' ? window.sanitizeThaiData(parsed) : parsed;
          return rawList.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.id || '').localeCompare(String(a.id || '')));
        }
      }
    } catch(e) {}
    return [];
  });

  // 2. Vendor Purchase Orders State
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_purchase_orders');
      return saved ? JSON.parse(saved) : window.INITIAL_PURCHASE_ORDERS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_purchase_orders:', e);
      return window.INITIAL_PURCHASE_ORDERS || [];
    }
  });

  // Modals
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);

  // ⚡ Action-Driven Direct Cloud Sync

  // ⚡ Real-Time Universal Hydration: Initial Mount + Tab Focus + 10s Heartbeat Poller
  useEffect(() => {
    let isMounted = true;

    async function hydrateAccountingFromCloud() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;

        // 1. Transactions (Smart Deep Compare & Universal Thai Sanitizer)
        const remoteTxns = await fetcher('accounting', null);
        if (isMounted && Array.isArray(remoteTxns)) {
          const rawTxns = typeof window.sanitizeThaiData === 'function' ? window.sanitizeThaiData(remoteTxns) : remoteTxns;
          const cleanTxns = rawTxns.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.id || '').localeCompare(String(a.id || '')));
          setTransactions(prev => (JSON.stringify(prev) === JSON.stringify(cleanTxns) ? prev : cleanTxns));
          localStorage.setItem('aeron_accounting_txns', JSON.stringify(cleanTxns));
        }

        // 2. Purchase Orders
        const remotePOs = await fetcher('purchase_orders', null);
        if (isMounted && Array.isArray(remotePOs)) {
          setPurchaseOrders(remotePOs);
          localStorage.setItem('aeron_purchase_orders', JSON.stringify(remotePOs));
        }
      } catch (e) {
        console.warn('[Accounting Cloud Hydration Notice]:', e.message);
      } finally {
        if (isMounted) isHydrated.current = true;
      }
    }

    hydrateAccountingFromCloud();

    window.addEventListener('focus', hydrateAccountingFromCloud);
    const poller = setInterval(hydrateAccountingFromCloud, 3000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', hydrateAccountingFromCloud);
      clearInterval(poller);
    };
  }, []);

  // Handlers
  const handleSaveTransaction = useCallback((txnData) => {
    setTransactions(prev => {
      let updated;
      const idx = prev.findIndex(t => t.id === txnData.id);
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...txnData };
      } else {
        updated = [{ ...txnData }, ...prev];
      }
      try {
        localStorage.setItem('aeron_accounting_txns', JSON.stringify(updated));
        if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
          window.syncToDB('accounting', updated);
        }
      } catch (e) {
        console.error('Error saving transaction to storage/cloud:', e);
      }
      return updated;
    });
  }, []);

  const handleDeleteTransaction = useCallback((txnId) => {
    if (window.confirm('ต้องการลบรายการนี้?')) {
      setTransactions(prev => {
        const updated = prev.filter(t => t.id !== txnId);
        try {
          localStorage.setItem('aeron_accounting_txns', JSON.stringify(updated));
          if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
            window.syncToDB('accounting', updated);
          }
        } catch (e) {
          console.error('Error deleting transaction from storage/cloud:', e);
        }
        return updated;
      });
    }
  }, []);

  // Save Purchase Order with Auto-Linking to Shipment Tracking
  const handleSavePO = useCallback((poData) => {
    let savedPO = poData;
    let nextPOs;
    if (poData.id) {
      setPurchaseOrders(prev => {
        nextPOs = prev.map(po => po.id === poData.id ? poData : po);
        try {
          localStorage.setItem('aeron_purchase_orders', JSON.stringify(nextPOs));
          if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
            window.syncToDB('purchase_orders', nextPOs);
          }
        } catch (e) {}
        return nextPOs;
      });
    } else {
      savedPO = {
        ...poData,
        id: 'po-' + Date.now()
      };
      setPurchaseOrders(prev => {
        nextPOs = [savedPO, ...prev];
        try {
          localStorage.setItem('aeron_purchase_orders', JSON.stringify(nextPOs));
          if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
            window.syncToDB('purchase_orders', nextPOs);
          }
        } catch (e) {}
        return nextPOs;
      });
    }

    // Auto Link: Create Shipment Tracking Entry if not existing
    if (savedPO.poNumber && setShipments) {
      setShipments(prevShipments => {
        const exists = (prevShipments || []).some(s => s.poNumber === savedPO.poNumber || s.poId === savedPO.id);
        if (!exists) {
          const delivYr = new Date().getFullYear();
          const newShipment = {
            id: 'shp-' + Date.now(),
            shipmentNumber: `SHP-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
            poNumber: savedPO.poNumber,
            poId: savedPO.id,
            productName: savedPO.productName || 'เครื่องมือแพทย์ AERON',
            productCategory: savedPO.productCategory || 'อุปกรณ์การแพทย์',
            quantity: savedPO.quantity || 1,
            vendorName: savedPO.vendorName || 'Vendor Manufacturer',
            vendorCountry: savedPO.vendorCountry || 'ต่างประเทศ',
            hospitalDestination: savedPO.hospitalName || 'โรงพยาบาลปลายทาง',
            shippingCompany: 'DHL Global Forwarding',
            trackingNumber: `AWB-${Math.floor(Math.random() * 89999999) + 10000000}`,
            cbm: 2.5,
            grossWeight: 150.0,
            transportType: '✈️ ขนส่งทางอากาศ (Air Freight)',
            shippingCost: 35000,
            dutyTaxes: 12000,
            customsBroker: 'V-Cargo Logistics (Thailand)',
            etd: savedPO.poDate || new Date().toISOString().split('T')[0],
            eta: savedPO.expectedDelivery || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            status: 'รอดำเนินการ',
            notes: `เปิด PO ส่งให้ Vendor ${savedPO.vendorName} เรียบร้อยแล้ว`
          };
          return [newShipment, ...prevShipments];
        }
        return prevShipments;
      });
    }

    setIsPOModalOpen(false);
    setEditingPO(null);
  }, [setShipments]);

  const handleDeletePO = useCallback((poId) => {
    if (window.confirm('คุณต้องการลบใบสั่งซื้อ PO นี้ออกจากระบบใช่หรือไม่?')) {
      setPurchaseOrders(prev => {
        const nextPOs = prev.filter(po => po.id !== poId);
        try {
          localStorage.setItem('aeron_purchase_orders', JSON.stringify(nextPOs));
          if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
            window.syncToDB('purchase_orders', nextPOs);
          }
        } catch (e) {}
        return nextPOs;
      });
    }
  }, []);

  // Continuous auto-sync when state changes after initial hydration
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem('aeron_accounting_txns', JSON.stringify(transactions));
      if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
        window.syncToDB('accounting', transactions);
      }
    } catch (e) {}
  }, [transactions]);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem('aeron_purchase_orders', JSON.stringify(purchaseOrders));
      if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
        window.syncToDB('purchase_orders', purchaseOrders);
      }
    } catch (e) {}
  }, [purchaseOrders]);

  return {
    transactions, setTransactions,
    purchaseOrders, setPurchaseOrders,
    isPOModalOpen, setIsPOModalOpen,
    editingPO, setEditingPO,
    handleSaveTransaction,
    handleDeleteTransaction,
    handleSavePO,
    handleDeletePO
  };
}

window.useAeronAccounting = useAeronAccounting;
