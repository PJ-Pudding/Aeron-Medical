// ====================================================
// MODULE: mod00_core/hooks/useAeronAccounting.js
// 💰 Domain Hook: Accounting Transactions, Bank Accounts & Purchase Orders
// ====================================================

function useAeronAccounting({ setShipments }) {
  // 1. Transactions State
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_accounting_txns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= (window.INITIAL_ACCOUNTING_TRANSACTIONS?.length || 0)) {
          return parsed;
        }
      }
      return window.INITIAL_ACCOUNTING_TRANSACTIONS || [];
    } catch(e) {
      console.warn('localStorage parse fallback for aeron_accounting_txns:', e);
      return window.INITIAL_ACCOUNTING_TRANSACTIONS || [];
    }
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

  // ⚡ Live Cloud Sync & Local Storage Persistence (Protected by Hydration Guard)
  const isHydrated = useRef(false);

  useEffect(() => {
    localStorage.setItem('aeron_accounting_txns', JSON.stringify(transactions));
    if (isHydrated.current && typeof syncToDB === 'function') {
      syncToDB('accounting', transactions);
    }
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('aeron_purchase_orders', JSON.stringify(purchaseOrders));
    if (isHydrated.current && typeof syncToDB === 'function') {
      syncToDB('purchase_orders', purchaseOrders);
    }
  }, [purchaseOrders]);

  // ⚡ Real-Time Universal Hydration: Initial Mount + Tab Focus + 10s Heartbeat Poller
  useEffect(() => {
    let isMounted = true;

    async function hydrateAccountingFromCloud() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;

        // 1. Transactions
        const remoteTxns = await fetcher('accounting', null);
        if (isMounted && Array.isArray(remoteTxns)) {
          setTransactions(remoteTxns);
          localStorage.setItem('aeron_accounting_txns', JSON.stringify(remoteTxns));
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
    const poller = setInterval(hydrateAccountingFromCloud, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', hydrateAccountingFromCloud);
      clearInterval(poller);
    };
  }, []);

  // Handlers
  const handleSaveTransaction = useCallback((txnData) => {
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === txnData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...txnData };
        return copy;
      } else {
        return [{ ...txnData }, ...prev];
      }
    });
  }, []);

  const handleDeleteTransaction = useCallback((txnId) => {
    if (window.confirm('ต้องการลบรายการนี้?')) {
      setTransactions(prev => prev.filter(t => t.id !== txnId));
    }
  }, []);

  // Save Purchase Order with Auto-Linking to Shipment Tracking
  const handleSavePO = useCallback((poData) => {
    let savedPO = poData;
    if (poData.id) {
      setPurchaseOrders(prev => prev.map(po => po.id === poData.id ? poData : po));
    } else {
      savedPO = {
        ...poData,
        id: 'po-' + Date.now()
      };
      setPurchaseOrders(prev => [savedPO, ...prev]);
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
      setPurchaseOrders(prev => prev.filter(po => po.id !== poId));
    }
  }, []);

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
