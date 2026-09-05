// MODULE: mod00_core/SmartSuggestInput.js
// 🧠 Universal Smart Autocomplete Input with Interactive Dropdown & Fuzzy Similarity Warning

function SmartSuggestInput({
  category = 'hospital', // 'hospital' | 'doctor' | 'payee' | 'product' | 'title' | 'competitor' | 'forwarder' | 'origin' | 'brand' | 'repair_symptom' | 'accessory' | 'unit' | 'location' | 'department'
  value = '',
  onChange,
  onSelect,
  onBlur,
  placeholder = '',
  className = '',
  required = false,
  disabled = false,
  compact = false,
  id,
  name
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [forceShowAll, setForceShowAll] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [dictionaryList, setDictionaryList] = useState(() => {
    return window.getAeronDictionary ? window.getAeronDictionary(category) : [];
  });

  const [similarMatch, setSimilarMatch] = useState(null);

  // Sync with live dictionary updates
  useEffect(() => {
    const handleUpdate = (e) => {
      if (!e.detail || !e.detail.category || e.detail.category === category) {
        if (window.getAeronDictionary) {
          setDictionaryList(window.getAeronDictionary(category));
        }
      }
    };
    window.addEventListener('aeron_dictionary_updated', handleUpdate);
    return () => window.removeEventListener('aeron_dictionary_updated', handleUpdate);
  }, [category]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setForceShowAll(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isExactMatch = useMemo(() => {
    if (!value || typeof value !== 'string') return false;
    const q = value.trim().toLowerCase();
    return dictionaryList.some(item => item.trim().toLowerCase() === q);
  }, [dictionaryList, value]);

  // Filter suggestions in real-time based on substring match
  // If no value, or user clicked ⌄ (forceShowAll), or current value is already an exact existing item: show ALL choices!
  const filteredSuggestions = useMemo(() => {
    if (!value || typeof value !== 'string' || forceShowAll || isExactMatch) {
      return dictionaryList.slice(0, 50);
    }
    const q = value.trim().toLowerCase();
    return dictionaryList
      .filter(item => item.toLowerCase().includes(q))
      .slice(0, 50);
  }, [dictionaryList, value, forceShowAll, isExactMatch]);

  // Detect similar names as user types (Fuzzy Similarity >= 70%)
  useEffect(() => {
    if (window.findSimilarDictionaryName && value && value.trim().length >= 2 && !isExactMatch) {
      const match = window.findSimilarDictionaryName(value, category);
      setSimilarMatch(match);
    } else {
      setSimilarMatch(null);
    }
  }, [value, category, isExactMatch]);

  const handleInputChange = (e) => {
    setForceShowAll(false);
    if (onChange) onChange(e);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectOption = (item) => {
    if (onChange) {
      onChange({ target: { name: name || id, value: item } });
    }
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
    setForceShowAll(false);
    setSimilarMatch(null);
    if (window.saveAeronDictionaryItem) {
      window.saveAeronDictionaryItem(category, item);
    }
  };

  const handleInputBlur = (e) => {
    const minLen = category === 'unit' ? 1 : 2;
    if (value && value.trim().length >= minLen && window.saveAeronDictionaryItem) {
      window.saveAeronDictionaryItem(category, value.trim());
    }
    if (onBlur) onBlur(e);
  };

  const handleApplySimilar = (suggestedName) => {
    if (onChange) {
      onChange({ target: { name: name || id, value: suggestedName } });
    }
    if (onSelect) {
      onSelect(suggestedName);
    }
    setSimilarMatch(null);
    setIsOpen(false);
    setForceShowAll(false);
  };

  const defaultInputClass = compact
    ? "w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 text-slate-100 outline-none text-xs focus:border-emerald-500 font-medium pr-6"
    : "w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-8 transition";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
              if (window.getAeronDictionary) {
                setDictionaryList(window.getAeronDictionary(category));
              }
            }
          }}
          onFocus={(e) => {
            setIsOpen(true);
            // Refresh list from global on focus
            if (window.getAeronDictionary) {
              setDictionaryList(window.getAeronDictionary(category));
            }
          }}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className={className ? `${className} ${compact ? 'pr-6' : 'pr-8'}` : defaultInputClass}
        />

        {/* Dropdown Toggle Button ⌄ */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            const next = !isOpen;
            setIsOpen(next);
            if (next) {
              setForceShowAll(true);
              if (window.getAeronDictionary) {
                setDictionaryList(window.getAeronDictionary(category));
              }
            }
            if (!isOpen && inputRef.current) inputRef.current.focus();
          }}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 p-1 transition-colors ${compact ? 'right-1 p-0.5' : 'right-2.5'}`}
          title="ดูตัวเลือกทั้งหมดที่มีในระบบ"
        >
          <svg className={`transition-transform duration-200 ${compact ? 'w-3 h-3' : 'w-4 h-4'} ${isOpen ? 'rotate-180 text-amber-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Fuzzy Similarity Alert Banner */}
      {similarMatch && (
        <div className="mt-1.5 flex items-center justify-between text-[11px] bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded-lg px-2.5 py-1.5 shadow-sm animate-fadeIn z-[1060]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="shrink-0 text-amber-400">💡</span>
            <span className="truncate">พบชื่อใกล้เคียงในระบบ: <strong className="text-amber-200 font-bold">"{similarMatch.item}"</strong></span>
          </div>
          <button
            type="button"
            onClick={() => handleApplySimilar(similarMatch.item)}
            className="ml-2 shrink-0 bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 border border-amber-500/50 rounded px-2.5 py-0.5 font-bold transition text-[10.5px]"
          >
            คลิกเพื่อใช้ชื่อนี้
          </button>
        </div>
      )}

      {/* Custom Interactive Suggestions Dropdown */}
      {isOpen && (filteredSuggestions.length > 0 || (value && value.trim().length >= (category === 'unit' ? 1 : 2) && !isExactMatch)) && (
        <div className="absolute left-0 min-w-[200px] w-full top-full mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-[1050] divide-y divide-slate-800 animate-fadeIn">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-950/80 flex items-center justify-between border-b border-slate-800">
            <span>ตัวเลือกในระบบ ({dictionaryList.length})</span>
            <span className="text-[9px] text-amber-400 font-normal">คลิกเลือก</span>
          </div>
          {filteredSuggestions.map((item, idx) => {
            const isExact = value && item.toLowerCase() === value.trim().toLowerCase();
            return (
              <div
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur before select
                  handleSelectOption(item);
                }}
                className={`px-3 py-2 text-xs text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 cursor-pointer flex items-center justify-between transition-colors ${isExact ? 'bg-emerald-500/15 font-bold text-emerald-300' : ''}`}
              >
                <span className="truncate">{item}</span>
                {isExact && <span className="text-[10px] text-emerald-400 shrink-0 ml-2 font-mono">✓ เลือกอยู่</span>}
              </div>
            );
          })}

          {/* Quick Add Custom Typed Option */}
          {value && value.trim().length >= (category === 'unit' ? 1 : 2) && !isExactMatch && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectOption(value.trim());
              }}
              className="px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/20 cursor-pointer flex items-center justify-between transition-colors bg-amber-500/10 font-bold border-t border-amber-500/30"
            >
              <span className="truncate">➕ ใช้ "{value.trim()}" (เพิ่มเป็นตัวเลือกใหม่)</span>
              <span className="text-[10px] text-amber-400 shrink-0 ml-2">บันทึกอัตโนมัติ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

window.SmartSuggestInput = SmartSuggestInput;
