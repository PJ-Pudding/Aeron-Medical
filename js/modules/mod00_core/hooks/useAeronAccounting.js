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

  // ⚡ Universal Notion-Like Hydration: Initial Mount + Tab Focus + 20s Heartbeat Poller (Smart Merge - Zero Data Loss)
  useEffect(() => {
    let isMounted = true;

    async function hydrateAccountingFromCloud() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;

        // 🛡️ Skip hydration if user has active local mutations
        if (window.isAeronMutating && window.isAeronMutating('accounting')) return;

        // 1. Transactions (Smart Merge & Universal Thai Sanitizer - NEVER wipes local items)
        const remoteTxns = await fetcher('accounting', null);
        if (isMounted && Array.isArray(remoteTxns)) {
          const rawTxns = typeof window.sanitizeThaiData === 'function' ? window.sanitizeThaiData(remoteTxns) : remoteTxns;
          setTransactions(prev => {
            if (window.isAeronMutating && window.isAeronMutating('accounting')) return prev;
            const merged = typeof window.mergeAeronDatasets === 'function'
              ? window.mergeAeronDatasets(prev, rawTxns, 'id')
              : (rawTxns.length > 0 ? rawTxns : prev);
            const cleanTxns = merged.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.id || '').localeCompare(String(a.id || '')));
            if (JSON.stringify(prev) === JSON.stringify(cleanTxns)) return prev;
            try {
              localStorage.setItem('aeron_accounting_txns', JSON.stringify(cleanTxns));
            } catch(e) {}
            return cleanTxns;
          });
        }

        // 2. Purchase Orders (Smart Merge)
        const remotePOs = await fetcher('purchase_orders', null);
        if (isMounted && Array.isArray(remotePOs)) {
          setPurchaseOrders(prev => {
            if (window.isAeronMutating && window.isAeronMutating('purchase_orders')) return prev;
            const merged = typeof window.mergeAeronDatasets === 'function'
              ? window.mergeAeronDatasets(prev, remotePOs, 'id')
              : (remotePOs.length > 0 ? remotePOs : prev);
            if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
            try {
              localStorage.setItem('aeron_purchase_orders', JSON.stringify(merged));
            } catch(e) {}
            return merged;
          });
        }
      } catch (e) {
        console.warn('[Accounting Cloud Hydration Notice]:', e.message);
      } finally {
        if (isMounted) isHydrated.current = true;
      }
    }

    hydrateAccountingFromCloud();

    window.addEventListener('focus', hydrateAccountingFromCloud);
    const poller = setInterval(hydrateAccountingFromCloud, 20000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', hydrateAccountingFromCloud);
      clearInterval(poller);
    };
  }, []);

  // Handlers
  const handleSaveTransaction = useCallback((txnData) => {
    const timestampedTxn = {
      ...txnData,
      updated_at: new Date().toISOString()
    };
    setTransactions(prev => {
      let updated;
      const idx = prev.findIndex(t => t.id === timestampedTxn.id);
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...timestampedTxn };
      } else {
        updated = [{ ...timestampedTxn }, ...prev];
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

  // ⚡ Notion-Style Atomic Batch Import (Deduplicates, updates state ONCE, saves to storage ONCE, syncs ONCE)
  const handleBatchImportTransactions = useCallback((importedList) => {
    if (!Array.isArray(importedList) || importedList.length === 0) return;
    setTransactions(prev => {
      const existingMap = new Map();
      prev.forEach(t => {
        if (t.id) existingMap.set(String(t.id), t);
        // Also index by composite key for items imported without unique IDs
        const compositeKey = `${t.date || ''}_${(t.title || '').trim()}_${Number(t.amount) || 0}`;
        existingMap.set(compositeKey, t);
      });

      const newRecords = [];
      const now = new Date().toISOString();
      importedList.forEach((item, idx) => {
        const compositeKey = `${item.date || ''}_${(item.title || '').trim()}_${Number(item.amount) || 0}`;
        const itemId = item.id ? String(item.id) : `TXN-IMP-${Date.now()}-${idx}`;

        if (!existingMap.has(itemId) && !existingMap.has(compositeKey)) {
          const rec = {
            ...item,
            id: itemId,
            updated_at: now,
            createdDate: item.createdDate || now
          };
          newRecords.push(rec);
          existingMap.set(itemId, rec);
          existingMap.set(compositeKey, rec);
        }
      });

      const merged = [...newRecords, ...prev].sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.id || '').localeCompare(String(a.id || '')));
      try {
        localStorage.setItem('aeron_accounting_txns', JSON.stringify(merged));
        if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
          window.syncToDB('accounting', merged);
        }
      } catch (e) {
        console.error('Error saving batch import to storage/cloud:', e);
      }
      return merged;
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
    const timestampedPO = {
      ...poData,
      updated_at: new Date().toISOString()
    };
    let savedPO = timestampedPO;
    let nextPOs;
    if (timestampedPO.id) {
      setPurchaseOrders(prev => {
        nextPOs = prev.map(po => po.id === timestampedPO.id ? timestampedPO : po);
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
        ...timestampedPO,
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
            notes: `เปิด PO ส่งให้ Vendor ${savedPO.vendorName} เรียบร้อยแล้ว`,
            updated_at: new Date().toISOString()
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

  return {
    transactions, setTransactions,
    purchaseOrders, setPurchaseOrders,
    isPOModalOpen, setIsPOModalOpen,
    editingPO, setEditingPO,
    handleSaveTransaction,
    handleBatchImportTransactions,
    handleDeleteTransaction,
    handleSavePO,
    handleDeletePO
  };
}

window.useAeronAccounting = useAeronAccounting;
