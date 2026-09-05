// MODULE: mod00_core/AeronNumberInput.js

/**
 * 🔢 AeronNumberInput
 * Component สำหรับใส่ลูกน้ำ (Thousands Separator) อัตโนมัติทุกช่องตัวเลขแบบเรียลไทม์
 * - กรองเฉพาะตัวเลข (และจุดทศนิยม 1 จุด)
 * - จัดรูปแบบลูกน้ำคั่นหลักพัน เช่น 1,000,000 หรือ 1,500.50
 * - รักษาระดับ Cursor Position ไม่ให้กระโดดไปท้ายสุดขณะพิมพ์แก้ไขตรงกลาง
 * - ส่งค่า Unformatted Numeric String กลับไปยัง onChange เพื่อไม่ให้การคำนวณติด NaN
 */
function AeronNumberInput({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = "0",
  className = "",
  required = false,
  disabled = false,
  name,
  id,
  allowDecimals = true,
  autoSelectOnFocus = false,
  min,
  max,
  unit = ""
}) {
  const inputRef = useRef(null);

  const formatWithCommas = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const s = String(val).replace(/,/g, '');
    if (s === '') return '';
    const parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1 && allowDecimals) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return parts[0];
  };

  const [displayValue, setDisplayValue] = useState(() => formatWithCommas(value));

  // Sync with prop changes when parent updates state
  useEffect(() => {
    const formatted = formatWithCommas(value);
    if (formatted !== displayValue) {
      setDisplayValue(formatted);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const rawInput = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    // Count how many valid digits/dots were before the cursor
    const textBeforeCursor = rawInput.substring(0, cursorPos);
    const validCharsBefore = allowDecimals
      ? textBeforeCursor.replace(/[^0-9.]/g, '')
      : textBeforeCursor.replace(/[^0-9]/g, '');
    const digitsBeforeCount = validCharsBefore.length;

    // Clean total input
    let cleaned = allowDecimals
      ? rawInput.replace(/[^0-9.]/g, '')
      : rawInput.replace(/[^0-9]/g, '');

    // Allow at most 1 decimal point
    if (allowDecimals && cleaned.indexOf('.') !== -1) {
      const firstDot = cleaned.indexOf('.');
      cleaned = cleaned.substring(0, firstDot + 1) + cleaned.substring(firstDot + 1).replace(/\./g, '');
    }

    if (cleaned === '') {
      setDisplayValue('');
      if (onChange) {
        onChange({
          target: {
            name: name || id,
            id: id || name,
            value: '',
            rawValue: 0
          }
        });
      }
      return;
    }

    // Format new display value
    const parts = cleaned.split('.');
    const formattedInt = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = parts.length > 1 && allowDecimals
      ? `${formattedInt}.${parts.slice(1).join('')}`
      : formattedInt;

    setDisplayValue(formatted);

    // Calculate new cursor position in formatted string
    let newCursorPos = formatted.length;
    if (digitsBeforeCount === 0) {
      newCursorPos = 0;
    } else {
      let counted = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/[0-9.]/.test(formatted[i])) {
          counted++;
          if (counted === digitsBeforeCount) {
            newCursorPos = i + 1;
            break;
          }
        }
      }
    }

    // Restore cursor position asynchronously after DOM update
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });

    // Fire onChange with clean numeric string (or float)
    if (onChange) {
      onChange({
        target: {
          name: name || id,
          id: id || name,
          value: cleaned,
          rawValue: cleaned === '' ? 0 : Number(cleaned)
        }
      });
    }
  };

  const handleBlur = (e) => {
    // If user left a trailing dot e.g. "1,500.", remove it on blur
    if (displayValue.endsWith('.')) {
      const cleanEnd = displayValue.slice(0, -1);
      setDisplayValue(cleanEnd);
      if (onChange) {
        const rawClean = cleanEnd.replace(/,/g, '');
        onChange({
          target: {
            name: name || id,
            id: id || name,
            value: rawClean,
            rawValue: Number(rawClean) || 0
          }
        });
      }
    }
    if (onBlur) onBlur(e);
  };

  const handleFocus = (e) => {
    if (autoSelectOnFocus && e.target) {
      e.target.select();
    }
    if (onFocus) onFocus(e);
  };

  return (
    <div className="relative w-full flex items-center">
      <input
        ref={inputRef}
        type="text"
        inputMode={allowDecimals ? "decimal" : "numeric"}
        id={id}
        name={name}
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
        className={className}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  );
}

window.AeronNumberInput = AeronNumberInput;
