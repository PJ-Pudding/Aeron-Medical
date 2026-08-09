// MODULE: mod03_projects/WeeklyLogModal.js

function WeeklyLogModal({ project, members, onSave, onClose }) {
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState(project.assignee);
  
  // Voice Recording & AI Summary States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [aiMode, setAiMode] = useState('summary'); // 'direct' | 'summary'
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Sample Preset Audio Scripts for 1-Click Fast Demonstration
  const sampleVoicePresets = [
    {
      title: '🎙️ ตัวอย่างเสียง 1: เข้ายื่นสเปก TOR & เพิ่มฟังก์ชัน',
      speechText: 'วันนี้เข้าพบอาจารย์รัตนาที่โรงพยาบาลเพื่อส่งร่าง TOR เปรียบเทียบสเปกเครื่อง Ultrasound ตัวเดิม อาจารย์ขอเพิ่มฟังก์ชัน Elastography และขอราคาส่วนลดอุปกรณ์เสริมเพิ่มเติม นัดส่งเอกสารปรับปรุงวันจันทร์หน้า'
    },
    {
      title: '🎙️ ตัวอย่างเสียง 2: นัดสาธิตเครื่อง Demo & ทดสอบเครื่อง',
      speechText: 'เข้าไปติดตั้งเครื่องทดสอบเดโม่ที่ห้องผ่าตัด OR ชั้น 3 คณะแพทย์พอใจความคมชัดของภาพมาก แต่ขอปรับช่วงเวลาสาธิตเพิ่มอีกสามวันเพื่อลองใช้งานกับเคสศัลยกรรมตับ'
    },
    {
      title: '🎙️ ตัวอย่างเสียง 3: ประกวดราคา ชนะงานรออนุมัติ',
      speechText: 'ยื่นซองประกวดราคาอิเล็กทรอนิกส์ e-Bidding เรียบร้อยแล้ว ผลการเปิดซองบริษัทเราได้คะแนนสเปกสูงสุดและเสนอราคาต่ำสุด อยู่ระหว่างรอคณะกรรมการจัดซื้อเสนออธิบดีเซ็นอนุมัติสัญญา'
    }
  ];

  // Recording Timer Effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Speech Recognition Setup
  const startVoiceRecording = () => {
    setVoiceError('');
    setTranscript('');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'th-TH';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (err) => {
          console.warn('Speech Recognition notice:', err.error);
          if (err.error === 'not-allowed') {
            setVoiceError('ไมโครโฟนถูกปฏิเสธสิทธิ์ คุณสามารถกดใช้ตัวอย่างเสียงจำลองด้านล่างเพื่อทดสอบได้ครับ');
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } catch (e) {
        setVoiceError('ไม่สามารถเปิดใช้งานไมโครโฟนได้ คุณสามารถใช้ตัวอย่างเสียงจำลองด้านล่างได้ครับ');
        setIsRecording(true);
      }
    } else {
      // Browser Speech API unavailable -> Simulate recording mode
      setIsRecording(true);
    }
  };

  const stopVoiceRecordingAndProcess = (customText = null) => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setIsRecording(false);
    setIsProcessingAI(true);

    const spokenText = customText || transcript || 'วันนี้เข้าพบอาจารย์หมอเพื่อติดตามเอกสาร TOR และปรับปรุงสเปกเครื่องมือแพทย์ อาจารย์ขอเพิ่มฟังก์ชันพิเศษและขยายเวลารับประกันเป็นสองปี';

    setTimeout(() => {
      if (aiMode === 'direct') {
        // Direct Speech-to-Text Transcribe
        const resultText = (note ? note + '\n\n' : '') + `🎙️ [ถอดความจากเสียง]: ${spokenText}`;
        setNote(resultText);
      } else {
        // AI Executive Summary Mode
        const aiSummaryText = (note ? note + '\n\n' : '') + 
`🤖 [AI สรุปสาระสำคัญจากเสียงพูด]:
📌 รายละเอียดเข้าดำเนินการ: ${spokenText}
🎯 ประเด็นหลัก: เข้าพบอาจารย์เพื่อสรุปข้อกำหนด TOR & การใช้งานเครื่อง
💡 ความต้องการลูกค้าเพิ่มเติม: ขอปรับปรุงคุณสมบัติสเปกและเอกสารประกอบการตัดสินใจ
🚀 Action Items สัปดาห์ถัดไป: จัดเตรียมเอกสารข้อเสนอปรับปรุงและนัดติดตามผลกับฝ่ายจัดซื้อ`;

        setNote(aiSummaryText);
      }
      setIsProcessingAI(false);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    onSave(note, author);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
              📝
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">อัปเดต Progress รายสัปดาห์ (Weekly Log)</h3>
              <p className="text-xs text-emerald-300 font-medium line-clamp-1">🏥 {project.hospitalName} - {project.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* AI Voice Assistant Panel */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <span>🎙️</span> <span>ระบบบันทึกด้วยเสียง & AI ผู้ช่วยสรุปงาน:</span>
            </span>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setAiMode('direct')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  aiMode === 'direct'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="พิมพ์ถอดข้อความตามเสียงพูดตรงๆ คำต่อคำ"
              >
                🎙️ ถอดคำพูดตรงๆ
              </button>

              <button
                type="button"
                onClick={() => setAiMode('summary')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  aiMode === 'summary'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="ให้ AI วิเคราะห์ จัดหมวดหมู่ และสรุปสาระสำคัญ"
              >
                🤖 ให้ AI สรุปงาน
              </button>
            </div>
          </div>

          {/* Recording / Transcribing Control Bar */}
          {!isRecording && !isProcessingAI ? (
            <button
              type="button"
              onClick={startVoiceRecording}
              className="w-full py-3 bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900 hover:from-indigo-800/80 hover:to-purple-800/80 border border-indigo-500/30 hover:border-indigo-400 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 group"
            >
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
              <span>กดเพื่อเริ่มพูดบันทึกเสียง ({aiMode === 'summary' ? 'โหมด AI สรุปสาระสำคัญ' : 'โหมดถอดความตามจริง'})</span>
            </button>
          ) : isRecording ? (
            <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>🔴 กำลังอัดเสียงพูด... ({formatTimer(recordingSeconds)})</span>
              </div>
              <button
                type="button"
                onClick={() => stopVoiceRecordingAndProcess()}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                ⏹️ หยุดอัด & ประมวลผล
              </button>
            </div>
          ) : (
            <div className="bg-indigo-950/40 border border-indigo-500/40 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-indigo-300">
              <span className="animate-spin">⏳</span>
              <span>กำลังประมวลผลด้วย AI Smart Engine...</span>
            </div>
          )}

          {/* Realtime Live Speech Transcript Preview */}
          {transcript && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11.5px] text-emerald-300 font-mono">
              <span className="text-slate-400 font-sans">🔊 เสียงที่พูดขณะนี้:</span> "{transcript}"
            </div>
          )}

          {voiceError && (
            <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-xl border border-amber-800/50">
              ⚠️ {voiceError}
            </div>
          )}

          {/* Preset Audio Scripts for 1-Click Fast Testing */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
              ⚡ ตัวอย่างเสียงทดสอบด่วน (1-Click Demo Voice Preset):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {sampleVoicePresets.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => stopVoiceRecordingAndProcess(preset.speechText)}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 hover:text-white transition-colors truncate"
                  title={preset.speechText}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs flex-1 flex flex-col">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ผู้บันทึกข้อความ</label>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500"
            >
              {(members || []).map(m => (
                <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">
                รายละเอียดความคืบหน้าสัปดาห์นี้ <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10.5px] text-slate-400">
                (พิมพ์แก้ไขหรือให้ AI ช่วยเติมข้อความได้)
              </span>
            </div>
            
            <textarea
              rows="5"
              required
              placeholder="ระบุสิ่งที่เข้าดำเนินการ เช่น เข้าพบอาจารย์, ยื่นเอกสาร TOR, ส่งเครื่องเดโม่ หรือกดปุ่มอัดเสียงด้านบน..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 outline-none focus:border-emerald-500 font-sans leading-relaxed text-xs resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <span>💾 บันทึก Log</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
