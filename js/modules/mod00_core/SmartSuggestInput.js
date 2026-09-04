// MODULE: mod00_core/SmartSuggestInput.js
// 🧠 Universal Smart Autocomplete Input with Fuzzy Similarity Warning

function SmartSuggestInput({
  category = 'hospital', // 'hospital' | 'doctor' | 'payee' | 'product' | 'title'
  value = '',
  onChange,
  onBlur,
  placeholder = '',
  className = '',
  required = false,
  disabled = false,
  id,
  name
}) {
  const [suggestions, setSuggestions] = useState(() => {
    return window.getAeronDictionary ? window.getAeronDictionary(category) : [];
  });

  const [similarMatch, setSimilarMatch] = useState(null);
  const inputId = useMemo(() => id || `suggest-${category}-${Math.random().toString(36).substring(2, 7)}`, [id, category]);
  const listId = useMemo(() => `list-${inputId}`, [inputId]);

  // Sync with live dictionary updates
  useEffect(() => {
    const handleUpdate = (e) => {
      if (!e.detail || !e.detail.category || e.detail.category === category) {
        if (window.getAeronDictionary) {
          setSuggestions(window.getAeronDictionary(category));
        }
      }
    };
    window.addEventListener('aeron_dictionary_updated', handleUpdate);
    return () => window.removeEventListener('aeron_dictionary_updated', handleUpdate);
  }, [category]);

  // Detect similar names as user types (Fuzzy Similarity >= 70%)
  useEffect(() => {
    if (window.findSimilarDictionaryName && value && value.trim().length >= 3) {
      const match = window.findSimilarDictionaryName(value, category);
      setSimilarMatch(match);
    } else {
      setSimilarMatch(null);
    }
  }, [value, category]);

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    if (onChange) onChange(e);
  };

  const handleInputBlur = (e) => {
    if (value && value.trim().length >= 2 && window.saveAeronDictionaryItem) {
      window.saveAeronDictionaryItem(category, value.trim());
    }
    if (onBlur) onBlur(e);
  };

  const handleApplySimilar = (suggestedName) => {
    if (onChange) {
      onChange({ target: { name: name || id, value: suggestedName } });
    }
    setSimilarMatch(null);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        id={inputId}
        name={name}
        list={listId}
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
        className={className || "w-full bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"}
      />

      {/* Native High-Performance Datalist Suggestions */}
      <datalist id={listId}>
        {suggestions.slice(0, 50).map((item, idx) => (
          <option key={idx} value={item} />
        ))}
      </datalist>

      {/* Fuzzy Similarity Alert Banner */}
      {similarMatch && (
        <div className="mt-1 flex items-center justify-between text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded px-2.5 py-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 truncate">
            <span>💡 พบชื่อใกล้เคียงในระบบ:</span>
            <span className="font-semibold text-amber-200 truncate">"{similarMatch.item}"</span>
          </div>
          <button
            type="button"
            onClick={() => handleApplySimilar(similarMatch.item)}
            className="ml-2 shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded px-2 py-0.5 font-medium transition"
          >
            ใช้ชื่อนี้
          </button>
        </div>
      )}
    </div>
  );
}

window.SmartSuggestInput = SmartSuggestInput;
