import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlaneTakeoff, PlaneLanding, FileText, CloudRain, Clock, 
  Settings, ChevronRight, ChevronLeft, Plus, Map, Info, AlertTriangle, 
  CheckCircle, Navigation, Printer, CloudLightning, RefreshCw, ZoomIn,
  Menu, X, LogOut, User, KeyRound, ShieldCheck, Plane, Database, Trash2, Edit, Sparkles, Bot, Wrench, ExternalLink
} from 'lucide-react';

// --- Mock Data ---
const initialAircrafts = [
  { registration: 'B-16722', type: 'B777-300ER', airline: 'BR' },
  { registration: 'B-18355', type: 'A330-300', airline: 'CI' },
  { registration: 'B-18101', type: 'A321NEO', airline: 'CI' },
  { registration: 'B-17881', type: 'B787-9', airline: 'BR' },
  { registration: 'B-16858', type: 'ATR72-600', airline: 'AE' } 
];

const initialAirports = [
  { icao: 'RCTP', name: 'TAIPEI TAOYUAN INTL' },
  { icao: 'KJFK', name: 'NEW YORK JOHN F KENNEDY' },
  { icao: 'VHHH', name: 'HONG KONG INTL' },
  { icao: 'RJTT', name: 'TOKYO HANEDA' },
  { icao: 'KBOS', name: 'BOSTON LOGAN INTL' },
  { icao: 'KEWR', name: 'NEWARK LIBERTY INTL' },
  { icao: 'VMMC', name: 'MACAU INTL' },
  { icao: 'RJAA', name: 'TOKYO NARITA' },
  { icao: 'RCKH', name: 'KAOHSIUNG INTL' },
  { icao: 'RCQC', name: 'MAKUNG' },
  { icao: 'RCMQ', name: 'TAICHUNG INTL' },
  { icao: 'RCSS', name: 'TAIPEI SONGSHAN' }
];

const initialRoutes = [
  {
    id: 'r1', dep: 'RCTP', arr: 'KJFK', acftType: 'B777-300ER', distance: 6800, blockTime: 870,
    atcRoute: 'SID CHALI M750 ENVAR OTR8 SEALS 50N160E 50N170E 49N180E 47N170W 45N160W 43N150W 40N140W 38N130W 35N120W STAR',
    altn1Apt: 'KBOS', altn2Apt: 'KEWR', altn3Apt: '',
    trip: 105000, altn1: 4500, altn2: 4800, altn3: 0, finres: 3200, cont: 5250, taxi: 800, extra: 2000
  },
  {
    id: 'r2', dep: 'RCTP', arr: 'VHHH', acftType: 'A330-300', distance: 430, blockTime: 105,
    atcRoute: 'SID CHALI T1 KADAP M750 ENVAR V512 ABBEY STAR',
    altn1Apt: 'VMMC', altn2Apt: '', altn3Apt: '',
    trip: 12500, altn1: 2100, altn2: 0, altn3: 0, finres: 1800, cont: 625, taxi: 400, extra: 0
  },
  {
    id: 'r3', dep: 'RCKH', arr: 'RCQC', acftType: 'ATR72-600', distance: 122, blockTime: 45,
    atcRoute: 'TNN1C TNN W6 MKG SEGMA',
    altn1Apt: 'RCKH', altn2Apt: 'RCMQ', altn3Apt: 'RCSS',
    trip: 460, altn1: 430, altn2: 400, altn3: 580, finres: 300, cont: 200, taxi: 100, extra: 0
  }
];

const initialFlights = [
  {
    id: '1',
    callsign: 'EVA031',
    airline: 'BR',
    aircraft: 'B777-300ER',
    registration: 'B-16722',
    date: '2026-02-27',
    dep: 'RCTP',
    arr: 'KJFK',
    altn1: 'KBOS',
    altn2: 'KEWR',
    altn3: '',
    std: '23:35Z',
    sta: '14:05',
    status: 'CLEARED',
    dispatcherSign: 'DP_AUTH_01',
    captainSign: null,
    route: 'SID CHALI M750 ENVAR OTR8 SEALS 50N160E 50N170E 49N180E 47N170W 45N160W 43N150W 40N140W 38N130W 35N120W STAR',
    weights: { zfw: 220500, payload: 52000, tow: 335000, law: 245000 },
    fuel: { trip: 105000, cont: 5250, altn1: 4500, altn2: 4800, altn3: 0, finres: 3200, extra: 2000, taxi: 800 },
    remarks: 'NIL SIG WX ENROUTE.',
    ddItems: 'NIL'
  },
  {
    id: '2',
    callsign: 'CAL731',
    airline: 'CI',
    aircraft: 'A330-300',
    registration: 'B-18355',
    date: '2026-02-28',
    dep: 'RCTP',
    arr: 'VHHH',
    altn1: 'VMMC',
    altn2: '',
    altn3: '',
    std: '04:00Z',
    sta: '05:45',
    status: 'PREFLIGHT',
    dispatcherSign: null,
    captainSign: null,
    route: 'SID CHALI T1 KADAP M750 ENVAR V512 ABBEY STAR',
    weights: { zfw: 165000, payload: 38000, tow: 195000, law: 182000 },
    fuel: { trip: 12500, cont: 625, altn1: 2100, altn2: 0, altn3: 0, finres: 1800, extra: 0, taxi: 400 },
    remarks: 'VHHH EXP DELAY DUE TO HEAVY TFC.',
    ddItems: 'NIL'
  }
];

// --- Block In Time Auto Calculation Helper ---
const calculateBlockIn = (stdStr, blockTimeMins) => {
  if (!stdStr || !blockTimeMins) return '';
  const raw = stdStr.replace(/[^0-9]/g, '');
  if (raw.length < 4) return '';
  
  const hrs = parseInt(raw.slice(0, 2), 10);
  const mins = parseInt(raw.slice(2, 4), 10);
  
  if (isNaN(hrs) || isNaN(mins)) return '';
  
  const totalMins = hrs * 60 + mins + Number(blockTimeMins);
  const newHrs = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;
  
  return `${String(newHrs).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

// --- Dynamic URL Generators & Weather Logic ---
const parseTargetDate = (dateStr, timeStr) => {
  if (!dateStr) return new Date();
  const now = new Date();
  let hh = '00', mm = '00';
  if (timeStr) {
      const timePart = timeStr.replace(/[^0-9]/g, ''); 
      if (timePart.length >= 4) {
          hh = timePart.substring(0, 2);
          mm = timePart.substring(2, 4);
      } else if (timePart.length > 0) {
          hh = timePart;
      }
  }
  const parsed = new Date(`${dateStr}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00Z`);
  return isNaN(parsed.getTime()) ? now : parsed;
};

const getDynamicAirmetUrls = (targetDateStr = null, targetHourStr = null) => {
  const urls = [];
  const now = new Date();
  let targetDate = targetDateStr ? parseTargetDate(targetDateStr, targetHourStr) : now;

  const generateForTime = (dateObj, count) => {
    const hours = dateObj.getUTCHours();
    let startHour = 21;
    let daysOffset = 0;

    if (hours >= 21) { startHour = 21; daysOffset = 0; }
    else if (hours >= 17) { startHour = 17; daysOffset = 0; }
    else if (hours >= 13) { startHour = 13; daysOffset = 0; }
    else if (hours >= 9) { startHour = 9; daysOffset = 0; }
    else if (hours >= 5) { startHour = 5; daysOffset = 0; }
    else if (hours >= 1) { startHour = 1; daysOffset = 0; }
    else { startHour = 21; daysOffset = -1; }

    const baseDate = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate() + daysOffset, startHour, 0, 0));
    
    for (let i = 0; i < count; i++) {
      const start = new Date(baseDate.getTime() - i * 4 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

      const startStr = `${String(start.getUTCDate()).padStart(2, '0')}${String(start.getUTCHours()).padStart(2, '0')}00`;
      const endStr = `${String(end.getUTCDate()).padStart(2, '0')}${String(end.getUTCHours()).padStart(2, '0')}00`;
      
      for (let j = 6; j >= 1; j--) {
        urls.push(`https://aoaws.anws.gov.tw/data/tamc/typh/airmet_0${j}_${startStr}_${endStr}.jpg`);
      }
    }
  };

  generateForTime(targetDate, 2);
  generateForTime(now, 6);
  
  return [...new Set(urls)];
};

const getDynamicSigwxUrls = (basePrefix, targetDateStr = null, targetHourStr = null) => {
  const urls = [];
  const now = new Date();
  let targetDate = targetDateStr ? parseTargetDate(targetDateStr, targetHourStr) : now;

  const generateForTime = (dateObj, count) => {
    const hours = dateObj.getUTCHours();
    let bestIssueHour = Math.floor(hours / 6) * 6;
    
    const validDate = new Date(dateObj.getTime());
    validDate.setUTCHours(bestIssueHour, 0, 0, 0);

    for (let i = 0; i < count; i++) { 
      const d = new Date(validDate.getTime() - i * 6 * 60 * 60 * 1000);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const hh = String(d.getUTCHours()).padStart(2, '0');

      urls.push(`https://aoaws.anws.gov.tw/data/tamc/sig/${basePrefix}${hh}_${yyyy}${mm}${dd}.jpg`);
    }
  };

  generateForTime(targetDate, 2);
  generateForTime(now, 4);
  
  return [...new Set(urls)];
};

// --- 模擬飛航公告資料 Helper ---
const mockNotam = (icao) => {
  if (!icao) return [];
  const notams = {
    'RCTP': [
      `A0101/26 NOTAMN\nQ) RCAA/QXXXX/IV/NBO/A/000/999/\nA) RCTP\nB) 2602250000 C) 2603312359\nE) TWY NC BETWEEN TWY N4 AND TWY N5 CLSD DUE TO MAINT.`,
      `A0105/26 NOTAMN\nQ) RCAA/QMRLC/IV/NBO/A/000/999/\nA) RCTP\nB) 2603010000 C) 2603011200\nE) RWY 05L/23R CLSD FOR RUBBER REMOVAL.`,
      `A0110/26 NOTAMN\nQ) RCAA/QFAXX/IV/NBO/A/000/999/\nA) RCTP\nB) 2602010000 C) 2605010000\nE) BIRD HAZARD REPORTED IN VICINITY OF AD. EXER CTN.`
    ],
    'KJFK': [
      `A1234/26 NOTAMR A1200/26\nQ) KZWY/QMRXX/IV/NBO/A/000/999/\nA) KJFK\nB) 2602201200 C) 2603151200\nE) RWY 04L/22R CLSD FOR WIP.`,
      `A1240/26 NOTAMN\nQ) KZWY/QXXXX/IV/NBO/A/000/999/\nA) KJFK\nB) 2603010000 C) 2603020000\nE) ILS RWY 13L GLIDE PATH OUT OF SERVICE.`
    ],
    'KBOS': [
      `A0987/26 NOTAMN\nQ) KZBW/QXXXX/IV/NBO/A/000/999/\nA) KBOS\nB) 2603010000 C) 2603052359\nE) ILS RWY 04R U/S.`
    ],
    'KEWR': [
      `A0888/26 NOTAMN\nQ) KZWY/QXXXX/IV/NBO/A/000/999/\nA) KEWR\nB) 2602281000 C) 2603102200\nE) VOR/DME EWR 108.4 UNUSABLE.`
    ],
    'VHHH': [
      `A0505/26 NOTAMN\nQ) VHHK/QXXXX/IV/NBO/A/000/999/\nA) VHHH\nB) 2603010100 C) 2603010500\nE) RWY 07R/25L CLSD DUE TO RUBBER REMOVAL.`,
      `A0506/26 NOTAMN\nQ) VHHK/QXXXX/IV/NBO/A/000/999/\nA) VHHH\nB) 2603010000 C) 2603022359\nE) TAXIWAY B CLSD FOR ALL ACFT.`
    ],
    'VMMC': [
      `A0202/26 NOTAMN\nQ) VMFC/QXXXX/IV/NBO/A/000/999/\nA) VMMC\nB) 2602260000 C) 2604302359\nE) BIRD CONCENTRATION IN VICINITY OF AD.`
    ],
    'RCKH': [
      `A0303/26 NOTAMN\nQ) RCAA/QXXXX/IV/NBO/A/000/999/\nA) RCKH\nB) 2603010200 C) 2603010600\nE) MIL JET TRAINING ACT WILL TAKE PLACE IN RCR18.`,
      `A0304/26 NOTAMN\nQ) RCAA/QXXXX/IV/NBO/A/000/999/\nA) RCKH\nB) 2603010000 C) 2603052359\nE) PAPI RWY 09 OUT OF SERVICE.`
    ],
    'RCQC': [
      `A0404/26 NOTAMN\nQ) RCAA/QXXXX/IV/NBO/A/000/999/\nA) RCQC\nB) 2603010000 C) 2605312359\nE) AD OPR HR CHANGED TO 0000-1100 DAILY.`
    ],
    'RCMQ': [
      `A0606/26 NOTAMN\nQ) RCAA/QXXXX/IV/NBO/A/000/999/\nA) RCMQ\nB) 2602280000 C) 2603152359\nE) TWY W CLSD DUE TO CONST.`,
      `A0607/26 NOTAMN\nQ) RCAA/QXXXX/IV/NBO/A/000/999/\nA) RCMQ\nB) 2603010000 C) 2603152359\nE) VOR/DME TCG 114.0 OUT OF SERVICE.`
    ],
    'RCSS': [
      `A0707/26 NOTAMN\nQ) RCAA/QXXXX/IV/NBO/A/000/999/\nA) RCSS\nB) 2603011400 C) 2603012200\nE) AD CLSD DUE TO CURFEW.`
    ]
  };
  
  return notams[icao] || [
    `A0000/26 NOTAMN\nQ) XXXX/QXXXX/IV/NBO/A/000/999/\nA) ${icao}\nB) 2603010000 C) 2612312359\nE) NIL SIG NOTAM.`
  ];
};

// --- 輔助 UI 元件 ---
function NavItem({ icon, label, active, onClick, isSub = false, collapsed = false }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 py-2.5 rounded-md transition-all group outline-none ${collapsed ? 'md:justify-center px-0 md:px-0 px-3' : 'px-3 justify-start'} ${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 border border-transparent'} ${isSub ? 'text-sm py-2' : 'font-medium'}`} title={label}>
      <div className={`shrink-0 ${active && collapsed ? 'scale-110 transition-transform' : ''}`}>{icon}</div>
      <span className={`whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1 ${collapsed ? 'md:hidden block' : 'block'}`}>{label}</span>
    </button>
  );
}

function StatusCard({ title, value, color }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 lg:p-6 flex flex-col justify-center shadow-md">
      <h4 className="text-slate-400 text-sm font-medium mb-1 lg:mb-2">{title}</h4>
      <span className={`text-3xl lg:text-4xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

function FormInput({ label, name, value, onChange, placeholder, type = "text", readonly = false, required = false }) {
  return (
    <div className="w-full flex flex-col min-w-0">
      <label className="block text-xs font-medium text-slate-400 mb-1.5 truncate" title={label}>{label}</label>
      <input 
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        readOnly={readonly}
        className={`w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono placeholder:text-slate-600 transition-colors ${type === 'date' ? '' : 'uppercase'} ${readonly ? 'opacity-50 cursor-not-allowed' : ''}`} 
        required={required && !readonly} 
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options, defaultOption, required = false }) {
  return (
    <div className="w-full flex flex-col min-w-0">
      <label className="block text-xs font-medium text-slate-400 mb-1.5 truncate" title={label}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono transition-colors"
        required={required}
      >
        <option value="" disabled className="text-slate-500">{defaultOption}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value} disabled={opt.disabled} className={opt.disabled ? "text-slate-600 bg-slate-900" : ""}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FuelRow({ label, value, bold, isBlue, isGreen, textLarge }) {
  return (
    <div className={`flex justify-between items-center py-0.5 ${bold ? 'font-bold text-white print:text-black' : 'text-slate-300'} ${isBlue ? 'text-blue-400 print:text-black' : ''} ${isGreen ? 'text-green-400 print:text-black' : ''} ${textLarge ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
      <span className="tracking-wider">{label}</span>
      <span className="font-mono tracking-wider">{value.toLocaleString('en-US')}</span>
    </div>
  );
}

function WtRow({ label, value, bold, textLarge }) {
  return (
    <div className={`flex justify-between items-center py-0.5 ${bold ? 'font-bold text-white print:text-black' : 'text-slate-300'} ${textLarge ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
      <span className="tracking-wider">{label}</span>
      <span className="font-mono tracking-wider">{value.toLocaleString('en-US')}</span>
    </div>
  );
}

function WeatherTabBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${active ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
      {label}
    </button>
  );
}

function BriefingChart({ title, srcList, auth, useAuth = false }) {
  return (
    <div className="border border-slate-700 print:border-gray-400 rounded-md p-2 lg:p-3 bg-slate-900/30 print:bg-white flex flex-col h-[300px] sm:h-[350px] print:h-[450px]">
       <h4 className="text-xs font-bold text-slate-300 print:text-black mb-2 text-center tracking-widest">{title}</h4>
       <div className="flex-1 relative overflow-hidden bg-[#0f172a] print:bg-transparent rounded flex items-center justify-center p-1">
         <WeatherImage srcList={srcList} alt={title} auth={auth} useAuth={useAuth} isBriefing={true} />
       </div>
    </div>
  );
}

function NotamAccordion({ typeLabel, icao, notams }) {
  const [isOpen, setIsOpen] = useState(false); 

  useEffect(() => {
    // 預設展開 DEP 與 ARR
    if (typeLabel === 'DEP' || typeLabel === 'ARR') {
      setIsOpen(true);
    }
  }, [typeLabel]);

  if (!notams || notams.length === 0) return null;

  return (
    <div className="border border-slate-700 print:border-gray-300 rounded-md overflow-hidden bg-slate-900/30 print:bg-transparent">
      <div className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-700 print:bg-gray-100 transition-colors text-left">
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 flex-1 outline-none print:pointer-events-none"
        >
          <span className={`px-2 py-0.5 rounded text-xs font-bold print:bg-gray-200 print:text-black ${typeLabel === 'DEP' || typeLabel === 'ARR' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
            [{typeLabel}]
          </span>
          <span className="font-bold text-slate-200 print:text-black">{icao}</span>
          <span className="text-xs text-slate-500 print:text-gray-600 bg-slate-950 print:bg-transparent px-2 py-0.5 rounded-full print:border print:border-gray-400">{notams.length} 則模擬公告</span>
        </button>
        <div className="flex items-center gap-4">
          <a 
            href={`https://notams.aim.faa.gov/notamSearch/nsapp.html#/results?searchType=0&locIds=${icao}`} 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-400 hover:text-blue-300 text-[10px] sm:text-xs flex items-center gap-1 bg-slate-900/80 px-2 py-1.5 rounded transition-colors print:hidden pointer-events-auto"
            title={`前往 FAA 系統查詢 ${icao} 即時 NOTAM`}
          >
            <ExternalLink className="w-3 h-3"/> FAA 查詢
          </a>
          <button onClick={() => setIsOpen(!isOpen)} className="outline-none print:hidden">
             <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className={`${isOpen ? 'block' : 'hidden'} print:block p-3 space-y-3 bg-slate-950/50 print:bg-transparent border-t border-slate-700 print:border-gray-300`}>
        {notams.map((notam, idx) => (
          <div key={idx} className={idx > 0 ? "border-t border-slate-800 print:border-gray-200 pt-3" : ""}>
            <p className="text-slate-400 print:text-black whitespace-pre-wrap font-mono text-[11px] sm:text-xs leading-relaxed">{notam}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeatherImage({ srcList, alt, auth, useAuth = false, isBriefing = false }) {
  const [status, setStatus] = useState('loading'); 
  const [renderSrc, setRenderSrc] = useState(null);
  const [testInfo, setTestInfo] = useState({ count: 0 });

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadImages = async () => {
      setStatus('loading');
      console.group(`[天氣引擎] 啟動抓取: ${alt}`);
      console.log(`總計生成 ${srcList.length} 筆備援網址。`);
      
      for (let i = 0; i < srcList.length; i++) {
        if (!isMounted) break;
        const baseUrl = srcList[i];
        setTestInfo({ count: i + 1 });
        
        console.groupCollapsed(`[測試 ${i+1}/${srcList.length}] ${baseUrl.split('/').pop()}`);

        if (useAuth && auth && auth.username) {
          try {
            console.log(`-> [需授權] 嘗試 HTTP Basic Auth 網址: ${baseUrl}`);
            const res = await fetch(baseUrl, {
              headers: { 'Authorization': 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
            });
            if (res.ok) {
              const blob = await res.blob();
              if (!isMounted) break;
              objectUrl = URL.createObjectURL(blob);
              setRenderSrc(objectUrl);
              setStatus('success');
              console.info('✅ [成功] Auth Fetch 成功取得圖資！');
              console.groupEnd();
              console.groupEnd();
              return; 
            } else {
              console.warn(`❌ [失敗] 伺服器回傳錯誤代碼: ${res.status}`);
            }
          } catch(e) { 
            console.warn(`❌ [失敗] Fetch 發生 CORS 或網路錯誤:`, e.message); 
          }
        } else {
          console.log(`-> [免授權直連] 直接載入圖片: ${baseUrl}`);
        }

        try {
          if (!isMounted) break;
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = baseUrl;
          });
          if (!isMounted) break;
          setRenderSrc(baseUrl);
          setStatus('success');
          console.info('✅ [成功] 直接載入圖片成功！');
          console.groupEnd();
          console.groupEnd();
          return;
        } catch(e) {
          console.warn('❌ [失敗] 直接載入圖片失敗 (可能為 404 或 CORS 阻擋)。');
        }

        try {
          const proxySrc = `https://api.allorigins.win/raw?url=${encodeURIComponent(baseUrl)}`;
          console.log(`-> 嘗試代理伺服器繞過 網址: ${proxySrc}`);
          if (!isMounted) break;
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = proxySrc;
          });
          if (!isMounted) break;
          setRenderSrc(proxySrc);
          setStatus('success');
          console.info('✅ [成功] 透過 Proxy 載入圖片成功！');
          console.groupEnd();
          console.groupEnd();
          return;
        } catch(e) {
          console.warn('❌ [失敗] 代理伺服器亦無法載入此圖。準備切換至下一個歷史時段。');
        }

        console.groupEnd(); 
      }

      if (isMounted) {
        console.error(`[天氣引擎] 掃描結束。所有 ${srcList.length} 筆網址皆已失效或被拒絕。`);
        console.groupEnd();
        setStatus('error');
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [srcList, auth, useAuth, alt]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center text-slate-400 space-y-4 w-full h-full min-h-[200px] animate-in fade-in duration-500">
         <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
         <div className="text-center">
           <p className="text-sm font-medium text-slate-300">正在背景掃描...</p>
           {testInfo.count > 1 && (
             <p className="text-xs text-slate-500 mt-1">
               已掃描 {testInfo.count} 個可能時段，請查閱 Console
             </p>
           )}
         </div>
      </div>
    );
  }

  if (status === 'error') {
    const firstUrlTried = srcList?.[0] || '#';
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 space-y-4 p-6 animate-in zoom-in-95 duration-300">
        <AlertTriangle className={`${isBriefing ? 'w-8 h-8' : 'w-12 h-12'} text-slate-600`} />
        <div className="text-center">
          <p className={`${isBriefing ? 'text-sm' : 'text-base'} font-medium text-slate-300`}>無資料</p>
           <a 
            href={firstUrlTried} 
            target="_blank" 
            rel="noreferrer" 
            className="text-[10px] sm:text-xs mt-4 inline-block font-mono text-blue-400 hover:text-blue-300 hover:underline break-all bg-slate-900 border border-slate-700 p-2 sm:p-3 rounded-md transition-colors"
          >
            開啟預期網址 &rarr;
          </a>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={renderSrc} 
      alt={alt} 
      className="max-w-full max-h-full object-contain rounded border border-slate-700 shadow-2xl bg-white/5 animate-in fade-in zoom-in-95 duration-500" 
      referrerPolicy="no-referrer"
    />
  );
}

function WeatherView({ zuluTime, appSettings }) {
  const [activeTab, setActiveTab] = useState('radar');
  const [imgKey, setImgKey] = useState(Date.now());

  const weatherSources = useMemo(() => ({
    radar: { 
      title: "最新雷達回波圖 (Radar)", 
      urlList: ["https://aoaws.anws.gov.tw/data/www_content/realtime_links/domain4/radar_cwb_45.png"]
    },
    vis_satellite: { 
      title: "最新可見光圖 (VIS Satellite)", 
      urlList: ["https://aoaws.anws.gov.tw/data/www_content/realtime_links/domain3/mtsat_vis_45.png"]
    },
    sigwx_low: { 
      title: "SFC-10000FT SIGWX", 
      urlList: getDynamicSigwxUrls('sig1')
    },
    sigwx_mid: { 
      title: "10000-25000FT SIGWX", 
      urlList: getDynamicSigwxUrls('sig2')
    },
    sigwx_high: { 
      title: "SFC-45000FT SIGWX", 
      urlList: getDynamicSigwxUrls('sig4')
    },
    airmet: { 
      title: "TPE AIRMET", 
      urlList: getDynamicAirmetUrls()
    }
  }), [imgKey]); 

  const handleRefresh = () => { setImgKey(Date.now()); };
  const handleTabChange = (tab) => { setActiveTab(tab); };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full space-y-4 w-full">
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-md shrink-0 w-full">
        <div className="flex gap-2 p-1 bg-slate-900 rounded-lg border border-slate-700 w-full lg:w-auto overflow-x-auto custom-scrollbar">
          <WeatherTabBtn active={activeTab === 'radar'} onClick={() => handleTabChange('radar')} label="雷達回波 (Radar)" />
          <WeatherTabBtn active={activeTab === 'vis_satellite'} onClick={() => handleTabChange('vis_satellite')} label="可見光 (VIS)" />
          <WeatherTabBtn active={activeTab === 'sigwx_low'} onClick={() => handleTabChange('sigwx_low')} label="SFC-10K SIGWX" />
          <WeatherTabBtn active={activeTab === 'sigwx_mid'} onClick={() => handleTabChange('sigwx_mid')} label="10K-25K SIGWX" />
          <WeatherTabBtn active={activeTab === 'sigwx_high'} onClick={() => handleTabChange('sigwx_high')} label="SFC-45K SIGWX" />
          <WeatherTabBtn active={activeTab === 'airmet'} onClick={() => handleTabChange('airmet')} label="TPE AIRMET" />
        </div>
        <div className="flex items-center justify-between lg:justify-end gap-4 text-sm w-full lg:w-auto border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
          <span className="text-slate-400 font-mono flex items-center gap-2 text-xs sm:text-sm">
            <Clock className="w-4 h-4 shrink-0" /> {zuluTime ? `${zuluTime} Z` : '00:00:00 Z'}
          </span>
          <button onClick={handleRefresh} className="flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1.5 rounded-md transition-colors border border-blue-500/30 whitespace-nowrap">
            <RefreshCw className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">強制更新</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col relative w-full min-h-[400px]">
        <div className="flex-1 p-2 sm:p-4 flex items-center justify-center bg-[#0f172a] relative overflow-auto custom-scrollbar w-full h-full">
          <WeatherImage 
            srcList={weatherSources[activeTab].urlList}
            alt={weatherSources[activeTab].title}
            auth={appSettings}
          />
        </div>
      </div>
    </div>
  );
}

function LoginView({ onLogin }) {
  const [role, setRole] = useState('dispatcher'); 
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin({ name: name.toUpperCase(), role });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-[#0f172a] to-slate-950 font-sans p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mb-4 shadow-inner shadow-blue-500/20">
            <Navigation className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AeroDispatch<span className="text-blue-500">Pro</span></h1>
          <p className="text-sm text-slate-400 uppercase tracking-widest font-medium">Aviation Operating System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">選擇登入身份 (Select Role)</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('dispatcher')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${role === 'dispatcher' ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-900/20' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'}`}>
                <ShieldCheck className="w-6 h-6" />
                <span className="text-sm font-bold">簽派員 Dispatcher</span>
              </button>
              <button type="button" onClick={() => setRole('pilot')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${role === 'pilot' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-900/20' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'}`}>
                <Plane className="w-6 h-6" />
                <span className="text-sm font-bold">飛行員 Pilot</span>
              </button>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">員工編號 / 姓名 (ID or Name)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-500" /></div>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow uppercase placeholder:normal-case placeholder:text-slate-600 font-mono" placeholder={role === 'dispatcher' ? "e.g. DP_TPE_01" : "e.g. CAPT_WANG"} required />
            </div>
            <div className="relative opacity-60">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-slate-500" /></div>
              <input type="password" className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-3 cursor-not-allowed font-mono text-sm" value="••••••••" readOnly />
            </div>
          </div>
          <button type="submit" className={`w-full py-3.5 rounded-lg text-white font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${role === 'dispatcher' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'}`}>
            登入系統 (Login as {role === 'dispatcher' ? 'Dispatcher' : 'Pilot'})
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [currentView, setCurrentView] = useState('dashboard'); 
  
  const [flights, setFlights] = useState(initialFlights);
  const [aircrafts, setAircrafts] = useState(initialAircrafts);
  const [airports, setAirports] = useState(initialAirports);
  const [routes, setRoutes] = useState(initialRoutes);
  
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [zuluTime, setZuluTime] = useState('');
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appSettings, setAppSettings] = useState({ 
    username: '', 
    password: '', 
    geminiApiKey: '', 
    aiModel: 'gemini-3.1-pro-preview' 
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setZuluTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    
    const savedSettings = localStorage.getItem(`AeroDispatch_Settings_${user.name}`);
    if (savedSettings) {
      try {
        setAppSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("無法解析使用者設定檔");
      }
    } else {
      setAppSettings({ username: '', password: '', geminiApiKey: '', aiModel: 'gemini-3.1-pro-preview' });
    }
    
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedFlight(null);
  };

  const handleViewFlight = (flight) => {
    setSelectedFlight(flight);
    setCurrentView('view');
    setIsMobileMenuOpen(false); 
  };

  const handleCreateSubmit = (newFlight) => {
    setFlights([...flights, { ...newFlight, id: Date.now().toString() }]);
    setCurrentView('dashboard');
  };

  const handleUpdateFlight = (updatedFlight) => {
    setFlights(flights.map(f => f.id === updatedFlight.id ? updatedFlight : f));
    if (selectedFlight?.id === updatedFlight.id) {
      setSelectedFlight(updatedFlight);
    }
  };

  const handleSignFlight = (flightId, role) => {
    setFlights(flights.map(f => {
      if (f.id === flightId) {
        if (role === 'dispatcher') {
          return { ...f, status: 'CLEARED', dispatcherSign: currentUser.name };
        } else if (role === 'pilot') {
          return { ...f, status: 'ACCEPTED', captainSign: currentUser.name };
        }
      }
      return f;
    }
    ));
    if (selectedFlight?.id === flightId) {
      if (role === 'dispatcher') {
        setSelectedFlight({ ...selectedFlight, status: 'CLEARED', dispatcherSign: currentUser.name });
      } else if (role === 'pilot') {
        setSelectedFlight({ ...selectedFlight, status: 'ACCEPTED', captainSign: currentUser.name });
      }
    }
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const isPilot = currentUser.role === 'pilot';
  const isDispatcher = currentUser.role === 'dispatcher';

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-200 font-sans overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col shrink-0 print:hidden
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
          md:translate-x-0 md:relative ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        <div className={`p-4 flex items-center justify-between h-16 shrink-0 ${isSidebarCollapsed ? 'md:justify-center' : ''}`}>
          <div className={`flex items-center gap-2 overflow-hidden ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
            <Navigation className="w-6 h-6 text-blue-500 shrink-0" />
            <h1 className="text-xl font-bold text-blue-400 whitespace-nowrap">
              AeroDispatch<span className="text-slate-100">Pro</span>
            </h1>
          </div>
          <div className={`hidden items-center justify-center ${isSidebarCollapsed ? 'md:flex' : 'md:hidden'}`}>
            <Navigation className="w-8 h-8 text-blue-500" />
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className={`px-4 pb-4 ${isSidebarCollapsed ? 'md:px-2' : ''}`}>
          <div className={`bg-slate-800/80 rounded-lg p-3 border border-slate-700 flex flex-col justify-center transition-all ${isSidebarCollapsed ? 'md:items-center md:p-2' : 'items-center flex-row justify-between'}`}>
            <span className={`text-slate-400 font-medium ${isSidebarCollapsed ? 'text-[10px]' : 'text-sm'}`}>
              {isSidebarCollapsed ? 'ZULU' : 'UTC / ZULU'}
            </span>
            <span className={`font-mono text-green-400 font-bold tracking-wider ${isSidebarCollapsed ? 'text-xs mt-1' : 'text-lg'}`}>
              {zuluTime ? (isSidebarCollapsed ? zuluTime.substring(0,2) + 'Z' : `${zuluTime}Z`) : '00:00:00Z'}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1.5 custom-scrollbar">
          <NavItem icon={<Map className="w-5 h-5 shrink-0" />} label="航班儀表板" active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} collapsed={isSidebarCollapsed} />
          
          {isDispatcher && (
            <>
              <NavItem icon={<Plus className="w-5 h-5 shrink-0" />} label="新建飛行計畫" active={currentView === 'create'} onClick={() => navigateTo('create')} collapsed={isSidebarCollapsed} />
              <NavItem icon={<Database className="w-5 h-5 shrink-0" />} label="資料庫管理" active={currentView === 'database'} onClick={() => navigateTo('database')} collapsed={isSidebarCollapsed} />
            </>
          )}

          <NavItem icon={<CloudLightning className="w-5 h-5 shrink-0" />} label="航空氣象圖" active={currentView === 'weather'} onClick={() => navigateTo('weather')} collapsed={isSidebarCollapsed} />
          
          <div className={`pt-6 pb-2 border-b border-slate-800/50 mb-2 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">現用航班 Active</p>
          </div>
          
          {flights.map(f => (
            <NavItem 
              key={f.id}
              icon={<FileText className={`w-4 h-4 shrink-0 ${currentView === 'view' && selectedFlight?.id === f.id ? 'text-blue-400' : 'text-slate-500'}`} />} 
              label={`${f.callsign} (${f.dep}-${f.arr})`}
              active={currentView === 'view' && selectedFlight?.id === f.id}
              onClick={() => handleViewFlight(f)}
              isSub={true}
              collapsed={isSidebarCollapsed}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 mt-auto flex flex-col gap-2">
          <div className={`flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800 ${isSidebarCollapsed ? 'md:justify-center' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg ${isPilot ? 'bg-indigo-600 shadow-indigo-900/20' : 'bg-blue-600 shadow-blue-900/20'}`}>
              {isPilot ? 'CP' : 'DP'}
            </div>
            <div className={`overflow-hidden transition-all flex-1 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
              <p className="text-sm font-medium text-slate-200 whitespace-nowrap truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 whitespace-nowrap">{isPilot ? 'Pilot In Command' : 'Dispatcher'}</p>
            </div>
          </div>
          
          <div className={`flex gap-2 ${isSidebarCollapsed ? 'md:flex-col' : ''}`}>
            <button 
              onClick={handleLogout}
              className={`flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md transition-colors ${isSidebarCollapsed ? 'px-0' : 'px-3'}`}
              title="登出系統"
            >
              <LogOut className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">登出</span>}
            </button>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex flex-none items-center justify-center px-2 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title={isSidebarCollapsed ? "展開側邊欄" : "收合側邊欄"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 min-w-0 print:bg-white print:overflow-visible">
        <header className="h-16 bg-slate-900/95 backdrop-blur z-10 border-b border-slate-800 flex items-center px-4 lg:px-8 justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-4 min-w-0">
            <button className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-slate-100 truncate flex items-center gap-2">
              {currentView === 'dashboard' && (isDispatcher ? '航班監控中心 (Dispatch Center)' : '機組員入口網 (Flight Crew Portal)')}
              {currentView === 'create' && '簽派放行與飛行計畫建立 (Dispatch Release)'}
              {currentView === 'database' && '資料庫管理 (Database Management)'}
              {currentView === 'view' && <span className="truncate">飛行計畫簡報 - <span className="text-blue-400">{selectedFlight?.callsign}</span></span>}
              {currentView === 'weather' && <><CloudLightning className="text-blue-400 w-5 h-5 shrink-0"/> <span className="truncate">航空氣象圖資</span></>}
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
             <button onClick={() => navigateTo('weather')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors" title="開啟氣象面板"><CloudRain className="w-5 h-5" /></button>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors" title="系統設定"><Settings className="w-5 h-5" /></button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative print:p-0 print:overflow-visible custom-scrollbar">
          {currentView === 'dashboard' && <DashboardView flights={flights} onView={handleViewFlight} />}
          {currentView === 'create' && <CreateOFPView aircrafts={aircrafts} airports={airports} routes={routes} onSubmit={handleCreateSubmit} onCancel={() => navigateTo('dashboard')} />}
          {currentView === 'database' && <DatabaseView aircrafts={aircrafts} setAircrafts={setAircrafts} airports={airports} setAirports={setAirports} routes={routes} setRoutes={setRoutes} />}
          {currentView === 'view' && <OFPBriefingView flight={selectedFlight} currentUser={currentUser} onSign={handleSignFlight} onUpdateFlight={handleUpdateFlight} appSettings={appSettings} />}
          {currentView === 'weather' && <WeatherView zuluTime={zuluTime} appSettings={appSettings} />}
        </main>
      </div>
      
      {/* Global styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1cm; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          /* 列印時強制顯示所有 NOTAM 面板 */
          .print\\:block { display: block !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        
        /* 解決日曆圖示在深色背景看不清的問題 */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.6;
          cursor: pointer;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}} />

      {/* 系統設定 Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          settings={appSettings} 
          onSave={(newSettings) => { 
            setAppSettings(newSettings); 
            if (currentUser) {
              localStorage.setItem(`AeroDispatch_Settings_${currentUser.name}`, JSON.stringify(newSettings));
            }
            setIsSettingsOpen(false); 
          }} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}

function SettingsModal({ settings, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...settings });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" /> 系統設定
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* AOAWS 設定 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-800 pb-2 flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-slate-400" /> AOAWS 驗證
            </h4>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400">授權帳號</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md pl-9 pr-3 py-2 focus:border-blue-500 outline-none text-sm" placeholder="AOAWS 帳號" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400">授權密碼</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                  </div>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md pl-9 pr-3 py-2 focus:border-blue-500 outline-none text-sm" placeholder="密碼" />
                </div>
              </div>
            </div>
          </div>

          {/* AI 設定 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-slate-400" /> AI 分析設定 (Gemini API)
            </h4>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400">Gemini API Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                  </div>
                  <input type="password" value={formData.geminiApiKey} onChange={(e) => setFormData({...formData, geminiApiKey: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md pl-9 pr-3 py-2 focus:border-blue-500 outline-none text-sm font-mono" placeholder="輸入 API Key 以啟用分析功能" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400">AI Model 選擇</label>
                <select value={formData.aiModel} onChange={(e) => setFormData({...formData, aiModel: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md p-2 focus:border-blue-500 outline-none text-sm">
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (最強大)</option>
                  <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (最新快速)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (平衡)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (穩定)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800 mt-6 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">取消</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-md text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> 儲存設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DatabaseView({ aircrafts, setAircrafts, airports, setAirports, routes, setRoutes }) {
  const [activeTab, setActiveTab] = useState('route');
  
  const [acftForm, setAcftForm] = useState({ registration: '', type: '', airline: '' });
  const handleAcftSubmit = (e) => {
    e.preventDefault();
    if (acftForm.registration && acftForm.type) {
      setAircrafts([...aircrafts, { ...acftForm, registration: acftForm.registration.toUpperCase(), airline: acftForm.airline.toUpperCase() }]);
      setAcftForm({ registration: '', type: '', airline: '' });
    }
  };

  const [aptForm, setAptForm] = useState({ icao: '', name: '' });
  const handleAptSubmit = (e) => {
    e.preventDefault();
    if (aptForm.icao && aptForm.name) {
      setAirports([...airports, { ...aptForm, icao: aptForm.icao.toUpperCase(), name: aptForm.name.toUpperCase() }]);
      setAptForm({ icao: '', name: '' });
    }
  };

  const [editingRouteId, setEditingRouteId] = useState(null);

  const [rtForm, setRtForm] = useState({
    dep: '', arr: '', acftType: '', distance: '', blockTime: '', atcRoute: '',
    altn1Apt: '', altn2Apt: '', altn3Apt: '',
    trip: '', altn1: '', altn2: '', altn3: '', finres: '', cont: '', taxi: '', extra: ''
  });

  const handleRtFormChange = (e) => {
    let { name, value } = e.target;
    if (name === 'atcRoute') value = value.toUpperCase();
    
    if (value === 'NONE') {
      value = '';
    }

    setRtForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'altn1Apt') next.altn1 = '';
      if (name === 'altn2Apt') next.altn2 = '';
      if (name === 'altn3Apt') next.altn3 = '';
      return next;
    });
  };

  const handleRtSubmit = (e) => {
    e.preventDefault();
    if (rtForm.dep && rtForm.arr && rtForm.altn1Apt && rtForm.acftType) {
      const newRouteData = {
        ...rtForm, 
        distance: Number(rtForm.distance) || 0,
        blockTime: Number(rtForm.blockTime) || 0,
        atcRoute: rtForm.atcRoute.toUpperCase(),
        trip: Number(rtForm.trip) || 0,
        altn1: Number(rtForm.altn1) || 0,
        altn2: Number(rtForm.altn2) || 0,
        altn3: Number(rtForm.altn3) || 0,
        finres: Number(rtForm.finres) || 0,
        cont: Number(rtForm.cont) || 0,
        taxi: Number(rtForm.taxi) || 0,
        extra: Number(rtForm.extra) || 0
      };

      if (editingRouteId) {
        setRoutes(routes.map(r => r.id === editingRouteId ? { ...newRouteData, id: editingRouteId } : r));
        setEditingRouteId(null);
      } else {
        setRoutes([...routes, { ...newRouteData, id: Date.now().toString() }]);
      }
      
      setRtForm({ 
        dep: '', arr: '', acftType: '', distance: '', blockTime: '', atcRoute: '', 
        altn1Apt: '', altn2Apt: '', altn3Apt: '', 
        trip: '', altn1: '', altn2: '', altn3: '', finres: '', cont: '', taxi: '', extra: '' 
      });
    }
  };

  const handleEditRoute = (rt) => {
    setEditingRouteId(rt.id);
    setRtForm({
      dep: rt.dep, arr: rt.arr, acftType: rt.acftType, distance: rt.distance, blockTime: rt.blockTime || '', atcRoute: rt.atcRoute,
      altn1Apt: rt.altn1Apt || '', altn2Apt: rt.altn2Apt || '', altn3Apt: rt.altn3Apt || '',
      trip: rt.trip, altn1: rt.altn1 || '', altn2: rt.altn2 || '', altn3: rt.altn3 || '', 
      finres: rt.finres, cont: rt.cont, taxi: rt.taxi, extra: rt.extra
    });
  };

  const handleCancelEdit = () => {
    setEditingRouteId(null);
    setRtForm({ 
      dep: '', arr: '', acftType: '', distance: '', blockTime: '', atcRoute: '', 
      altn1Apt: '', altn2Apt: '', altn3Apt: '', 
      trip: '', altn1: '', altn2: '', altn3: '', finres: '', cont: '', taxi: '', extra: '' 
    });
  };

  const uniqueAcftTypes = [...new Set(aircrafts.map(a => a.type))];
  const aptOptions = airports.map(a => ({ value: a.icao, label: `${a.icao} - ${a.name}` }));
  const acftTypeOptions = uniqueAcftTypes.map(t => ({ value: t, label: t }));
  
  const altnOptionsWithNone = [...aptOptions, { value: 'NONE', label: 'NONE (無)' }];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 w-fit overflow-x-auto custom-scrollbar max-w-full">
        <button onClick={() => setActiveTab('aircraft')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'aircraft' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>機隊管理 (Aircrafts)</button>
        <button onClick={() => setActiveTab('airport')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'airport' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>機場管理 (Airports)</button>
        <button onClick={() => setActiveTab('route')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'route' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>航線與燃油 (Routes & Fuel)</button>
      </div>

      {activeTab === 'aircraft' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg h-fit">
            <h3 className="font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">新增航機 (Add Aircraft)</h3>
            <form onSubmit={handleAcftSubmit} className="space-y-4">
              <FormInput label="註冊編號 (Registration)" name="registration" value={acftForm.registration} onChange={e => setAcftForm({...acftForm, registration: e.target.value})} placeholder="e.g. B-16722" required />
              <FormInput label="機型 (Type)" name="type" value={acftForm.type} onChange={e => setAcftForm({...acftForm, type: e.target.value})} placeholder="e.g. B777-300ER" required />
              <FormInput label="航空公司 (Airline)" name="airline" value={acftForm.airline} onChange={e => setAcftForm({...acftForm, airline: e.target.value})} placeholder="e.g. BR" required />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md text-sm font-medium transition-colors">加入資料庫</button>
            </form>
          </div>
          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col max-h-[600px]">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                    <th className="px-5 py-3">註冊編號</th>
                    <th className="px-5 py-3">機型</th>
                    <th className="px-5 py-3">航空公司</th>
                    <th className="px-5 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {aircrafts.map((acft, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="px-5 py-3 font-mono font-bold text-slate-200">{acft.registration}</td>
                      <td className="px-5 py-3 text-sm text-slate-300">{acft.type}</td>
                      <td className="px-5 py-3 text-sm text-slate-400">{acft.airline}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setAircrafts(aircrafts.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'airport' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg h-fit">
            <h3 className="font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">新增機場 (Add Airport)</h3>
            <form onSubmit={handleAptSubmit} className="space-y-4">
              <FormInput label="ICAO 代碼" name="icao" value={aptForm.icao} onChange={e => setAptForm({...aptForm, icao: e.target.value})} placeholder="e.g. RCTP" required />
              <FormInput label="機場名稱 (Name)" name="name" value={aptForm.name} onChange={e => setAptForm({...aptForm, name: e.target.value})} placeholder="e.g. TAIPEI TAOYUAN" required />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md text-sm font-medium transition-colors">加入資料庫</button>
            </form>
          </div>
          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col max-h-[600px]">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                    <th className="px-5 py-3">ICAO</th>
                    <th className="px-5 py-3">機場名稱</th>
                    <th className="px-5 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {airports.map((apt, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="px-5 py-3 font-mono font-bold text-slate-200">{apt.icao}</td>
                      <td className="px-5 py-3 text-sm text-slate-300">{apt.name}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setAirports(airports.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'route' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg h-fit max-h-[850px] overflow-y-auto custom-scrollbar">
            <h3 className="font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">
              {editingRouteId ? '編輯航線 (Edit Route)' : '新增航線 (Add Route)'}
            </h3>
            <form onSubmit={handleRtSubmit}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <FormSelect label="起飛 (DEP)*" name="dep" value={rtForm.dep} onChange={handleRtFormChange} options={aptOptions} defaultOption="-- DEP --" required />
                  <FormSelect label="降落 (ARR)*" name="arr" value={rtForm.arr} onChange={handleRtFormChange} options={aptOptions} defaultOption="-- ARR --" required />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <FormSelect label="適用機型 (Type)*" name="acftType" value={rtForm.acftType} onChange={handleRtFormChange} options={acftTypeOptions} defaultOption="-- TYPE --" required />
                  <FormInput label="距離 (NM)" name="distance" value={rtForm.distance} onChange={handleRtFormChange} placeholder="e.g. 6800" type="number" />
                  <FormInput label="時間 (分鐘)" name="blockTime" value={rtForm.blockTime} onChange={handleRtFormChange} placeholder="e.g. 870" type="number" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <FormSelect label="備降1 (ALTN1)*" name="altn1Apt" value={rtForm.altn1Apt} onChange={handleRtFormChange} options={aptOptions} defaultOption="-- ALTN1 --" required />
                  <FormSelect label="備降2 (ALTN2)" name="altn2Apt" value={rtForm.altn2Apt} onChange={handleRtFormChange} options={altnOptionsWithNone} defaultOption="-- ALTN2 --" />
                  <FormSelect label="備降3 (ALTN3)" name="altn3Apt" value={rtForm.altn3Apt} onChange={handleRtFormChange} options={altnOptionsWithNone} defaultOption="-- ALTN3 --" />
                </div>
              </div>

              <div className="w-full mt-3 mb-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">ATC 航路 (ATC Route)</label>
                <textarea name="atcRoute" value={rtForm.atcRoute} onChange={handleRtFormChange} rows="2" className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow custom-scrollbar resize-y" placeholder="SID WAYPOINT AWY WAYPOINT STAR..." />
              </div>
              
              <h4 className="text-xs font-semibold text-slate-400 border-b border-slate-800 pb-1 mt-4 mb-2">預設燃油資料 Default Fuel (KGS)</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                <FormInput label="TRIP FUEL" name="trip" value={rtForm.trip} onChange={handleRtFormChange} type="number" />
                <FormInput label="FINAL RES" name="finres" value={rtForm.finres} onChange={handleRtFormChange} type="number" />
                <FormInput label="CONT FUEL" name="cont" value={rtForm.cont} onChange={handleRtFormChange} type="number" />
                <FormInput label="ALTN1 FUEL*" name="altn1" value={rtForm.altn1} onChange={handleRtFormChange} type="number" required />
                <FormInput label="ALTN2 FUEL" name="altn2" value={rtForm.altn2} onChange={handleRtFormChange} type="number" />
                <FormInput label="ALTN3 FUEL" name="altn3" value={rtForm.altn3} onChange={handleRtFormChange} type="number" />
                <FormInput label="TAXI FUEL" name="taxi" value={rtForm.taxi} onChange={handleRtFormChange} type="number" />
                <FormInput label="EXTRA FUEL" name="extra" value={rtForm.extra} onChange={handleRtFormChange} type="number" />
              </div>
              <p className="text-[10px] text-slate-500 mt-2">* 總油量與備降油量等計算，將於「建立飛行計畫」階段動態產生。</p>

              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md text-sm font-medium transition-colors">
                  {editingRouteId ? '儲存修改' : '加入航線資料庫'}
                </button>
                {editingRouteId && (
                  <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium transition-colors">
                    取消
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="xl:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col max-h-[850px]">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
              <table className="w-full text-left min-w-[850px]">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                    <th className="px-4 py-3">航線 (Route)</th>
                    <th className="px-4 py-3">機型 (Type)</th>
                    <th className="px-4 py-3">Block Time</th>
                    <th className="px-4 py-3">ATC 航路</th>
                    <th className="px-4 py-3">預設 ALTN</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {routes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
                          <span>{rt.dep}</span>
                          <ChevronRight className="w-3 h-3 text-slate-600" />
                          <span>{rt.arr}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{rt.acftType}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{rt.blockTime ? `${rt.blockTime}m` : '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono truncate max-w-[200px]" title={rt.atcRoute}>{rt.atcRoute}</td>
                      <td className="px-4 py-3">
                         <div className="flex flex-col text-xs font-mono text-yellow-400">
                           {rt.altn1Apt && <span>1: {rt.altn1Apt} ({rt.altn1})</span>}
                           {rt.altn2Apt && <span>2: {rt.altn2Apt} ({rt.altn2})</span>}
                           {rt.altn3Apt && <span>3: {rt.altn3Apt} ({rt.altn3})</span>}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => handleEditRoute(rt)} className="text-blue-400 hover:text-blue-300 p-1.5 mr-1 bg-blue-500/10 rounded" title="編輯航線"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => setRoutes(routes.filter(r => r.id !== rt.id))} className="text-red-400 hover:text-red-300 p-1.5 bg-red-500/10 rounded" title="刪除"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateOFPView({ aircrafts, airports, routes, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    callsign: '', airline: '', aircraft: '', registration: '',
    date: new Date().toISOString().split('T')[0],
    dep: '', arr: '', std: '', sta: '', route: '', zfw: '', payload: '',
    altn1: '', altn2: '', altn3: '',
    trip: '', altn1Fuel: '', altn2Fuel: '', altn3Fuel: '', finres: '', cont: '', taxi: '', extra: '',
    remarks: 'NIL SIG WX ENROUTE.',
    ddItems: 'NIL'
  });

  const matchingRoute = useMemo(() => {
    return routes.find(r => 
      r.dep === formData.dep && 
      r.arr === formData.arr && 
      r.acftType === formData.aircraft
    );
  }, [routes, formData.dep, formData.arr, formData.aircraft]);

  // 根據匹配的航線，動態產生允許的備降場清單
  const baseAltnOptions = useMemo(() => {
    const allOptions = airports.map(a => ({ value: a.icao, label: `${a.icao} - ${a.name}` }));
    if (matchingRoute) {
      const allowedApts = [matchingRoute.altn1Apt, matchingRoute.altn2Apt, matchingRoute.altn3Apt].filter(Boolean);
      return allOptions.filter(opt => allowedApts.includes(opt.value));
    }
    return allOptions;
  }, [airports, matchingRoute]);

  // 產生互斥的選項清單 (防止重複選擇)
  const getOptionsWithDisabled = (otherVal1, otherVal2, allowNone) => {
    let opts = baseAltnOptions.map(opt => ({
      ...opt,
      disabled: (opt.value === otherVal1 && otherVal1 !== '') || (opt.value === otherVal2 && otherVal2 !== '')
    }));
    if (allowNone) {
      opts.push({ value: 'NONE', label: 'NONE (無)', disabled: false });
    }
    return opts;
  };

  const altn1Options = getOptionsWithDisabled(formData.altn2, formData.altn3, false);
  const altn2Options = getOptionsWithDisabled(formData.altn1, formData.altn3, true);
  const altn3Options = getOptionsWithDisabled(formData.altn1, formData.altn2, true);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'std' || name === 'sta') {
      let val = value.toUpperCase().replace(/[^0-9Z:]/g, '');
      let rawNums = val.replace(/[^0-9]/g, '');

      if (rawNums.length >= 4) {
        let zPart = val.includes('Z') ? 'Z' : '';
        value = rawNums.slice(0, 2) + ':' + rawNums.slice(2, 4) + zPart;
      } else {
        value = val;
      }

      // 判斷是否滿足觸發條件：編輯的是 Block Out (std) 且航線中有 Block Time 設定
      if (name === 'std' && rawNums.length >= 4 && matchingRoute && matchingRoute.blockTime) {
         const newSta = calculateBlockIn(value, matchingRoute.blockTime);
         setFormData(prev => ({ ...prev, std: value, sta: newSta }));
         return; 
      }

    } else if (name !== 'date' && name !== 'remarks' && name !== 'ddItems') {
      value = value.toUpperCase();
    }
    
    // 動態尋找對應的備降場油量，並處理 NONE 的清空邏輯
    if (['altn1', 'altn2', 'altn3'].includes(name)) {
      let fuelName = `${name}Fuel`;
      let fuelValue = '';
      
      if (value === 'NONE') {
        value = ''; 
        fuelValue = '';
      } else {
        if (matchingRoute) {
          if (value === matchingRoute.altn1Apt) fuelValue = matchingRoute.altn1;
          else if (value === matchingRoute.altn2Apt) fuelValue = matchingRoute.altn2;
          else if (value === matchingRoute.altn3Apt) fuelValue = matchingRoute.altn3;
          else fuelValue = value ? 2500 : ''; // 預設值
        } else {
          fuelValue = value ? 2500 : '';
        }
      }

      setFormData(prev => ({ ...prev, [name]: value, [fuelName]: fuelValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAircraftChange = (e) => {
    const reg = e.target.value;
    const selectedAcft = aircrafts.find(a => a.registration === reg);
    if (selectedAcft) {
      setFormData(prev => ({
        ...prev,
        registration: selectedAcft.registration,
        aircraft: selectedAcft.type,
        airline: selectedAcft.airline
      }));
    } else {
      setFormData(prev => ({ ...prev, registration: reg }));
    }
  };

  // 當航線匹配時，強制洗掉舊資料並套用航線資料庫設定
  useEffect(() => {
    if (matchingRoute) {
      setFormData(prev => {
        let updatedSta = prev.sta;
        // 若航線切換成功時，Block Out 已填入且有 Block Time，就順手算一下 Block In 帶入
        if (prev.std && prev.std.length >= 5 && matchingRoute.blockTime) {
          updatedSta = calculateBlockIn(prev.std, matchingRoute.blockTime);
        }

        return { 
          ...prev, 
          route: prev.route || matchingRoute.atcRoute || '',
          altn1: prev.altn1 || matchingRoute.altn1Apt || '',
          altn2: prev.altn2 || matchingRoute.altn2Apt || '',
          altn3: prev.altn3 || matchingRoute.altn3Apt || '',
          trip: prev.trip || matchingRoute.trip || '',
          altn1Fuel: prev.altn1Fuel || matchingRoute.altn1 || '',
          altn2Fuel: prev.altn2Fuel || matchingRoute.altn2 || '',
          altn3Fuel: prev.altn3Fuel || matchingRoute.altn3 || '',
          finres: prev.finres || matchingRoute.finres || '',
          cont: prev.cont || matchingRoute.cont || '',
          taxi: prev.taxi || matchingRoute.taxi || '',
          extra: prev.extra || matchingRoute.extra || '',
          sta: updatedSta
        };
      });
    }
  }, [matchingRoute]);

  // 動態計算油量 (依據當前表單輸入值)
  const zfwNum = parseInt(formData.zfw) || 60000;
  const tF = parseInt(formData.trip) || Math.floor(zfwNum * 0.15); 
  const a1F = parseInt(formData.altn1Fuel) || 0; // ALTN1 作為基礎計算標準
  const cF = parseInt(formData.cont) || Math.floor(tF * 0.05);
  const frF = parseInt(formData.finres) || 1500;
  const txF = parseInt(formData.taxi) || 300;
  const exF = parseInt(formData.extra) || 0;
  
  const minFuel = tF + a1F + frF + cF + txF;
  const minDivFuel = a1F + frF + 50;
  const rampFuel = minFuel + exF;
  const totalFuel = rampFuel; 

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newFlight = {
      ...formData,
      status: 'PREFLIGHT',
      dispatcherSign: null, captainSign: null,
      weights: { zfw: zfwNum, payload: parseInt(formData.payload) || 15000, tow: zfwNum + totalFuel, law: zfwNum + totalFuel - tF },
      fuel: { trip: tF, cont: cF, altn1: a1F, altn2: parseInt(formData.altn2Fuel)||0, altn3: parseInt(formData.altn3Fuel)||0, finres: frF, extra: exF, taxi: txF }
    };
    onSubmit(newFlight);
  };

  const aptOptions = airports.map(a => ({ value: a.icao, label: `${a.icao} - ${a.name}` }));

  return (
    <div className="max-w-5xl mx-auto pb-10 w-full">
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl w-full">
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue-400 shrink-0" />
          <h3 className="font-semibold text-lg text-slate-100">建立新營運飛行計畫 (Generate New OFP)</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2 uppercase tracking-wider flex items-center gap-2"><Info className="w-4 h-4"/> Flight Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <FormInput label="航班號 (Callsign)" name="callsign" value={formData.callsign} onChange={handleChange} placeholder="e.g. CAL101" required />
              
              <FormSelect 
                label="註冊編號 (Registration)" 
                name="registration" 
                value={formData.registration} 
                onChange={handleAircraftChange} 
                options={aircrafts.map(a => ({ value: a.registration, label: `${a.registration} (${a.type})` }))}
                defaultOption="-- 選擇航機 --"
                required
              />

              <FormInput label="機型 (Aircraft)" name="aircraft" value={formData.aircraft} onChange={handleChange} placeholder="Auto-filled" readonly />
              <FormInput label="航空公司 (Airline)" name="airline" value={formData.airline} onChange={handleChange} placeholder="Auto-filled" readonly />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2 uppercase tracking-wider flex items-center gap-2"><Map className="w-4 h-4"/> Routing & Schedule</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <FormInput label="預計起飛日期 (Date)" name="date" value={formData.date} onChange={handleChange} type="date" required />
              </div>
              <FormSelect 
                label="起飛機場 (DEP)" name="dep" value={formData.dep} onChange={handleChange} 
                options={aptOptions} defaultOption="-- DEP --" required
              />
              <FormSelect 
                label="降落機場 (ARR)" name="arr" value={formData.arr} onChange={handleChange} 
                options={aptOptions} defaultOption="-- ARR --" required
              />
              <FormInput label="Block Out Time (Z)" name="std" value={formData.std} onChange={handleChange} placeholder="HH:MMZ" required />
              <FormInput label="Block In Time (Z)" name="sta" value={formData.sta} onChange={handleChange} placeholder="HH:MM" required />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4">
              <FormSelect label="備降機場1 (ALTN1)*" name="altn1" value={formData.altn1} onChange={handleChange} options={altn1Options} defaultOption="-- ALTN1 --" required />
              <FormSelect label="備降機場2 (ALTN2)" name="altn2" value={formData.altn2} onChange={handleChange} options={altn2Options} defaultOption="-- ALTN2 --" />
              <FormSelect label="備降機場3 (ALTN3)" name="altn3" value={formData.altn3} onChange={handleChange} options={altn3Options} defaultOption="-- ALTN3 --" />
            </div>

            <div className="w-full mt-4">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">ATC 航路 (ATC Route)</label>
              <textarea name="route" value={formData.route} onChange={handleChange} rows="2" className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-200 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow custom-scrollbar resize-y" placeholder="SID WAYPOINT AWY WAYPOINT STAR..." />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2 uppercase tracking-wider">Dynamic Fuel Calculation (KGS)</h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <FormInput label="預估無油重量 (Est. ZFW)" name="zfw" value={formData.zfw} onChange={handleChange} placeholder="e.g. 62000" type="number" />
              <FormInput label="預估商載 (Est. Payload)" name="payload" value={formData.payload} onChange={handleChange} placeholder="e.g. 15000" type="number" />
              <div className="lg:col-span-2 flex items-center">
                 {matchingRoute && (
                   <span className="text-sm text-green-400 flex items-center gap-2 bg-green-900/20 px-3 py-2 rounded border border-green-800">
                     <CheckCircle className="w-4 h-4 shrink-0" /> 航線匹配成功！已自動帶入預設油量與航路。
                   </span>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 p-4 border border-slate-800 bg-slate-900/50 rounded-lg">
                <FormInput label="TRIP FUEL" name="trip" value={formData.trip} onChange={handleChange} type="number" required />
                <FormInput label="ALTN1 FUEL (計算基準)*" name="altn1Fuel" value={formData.altn1Fuel} onChange={handleChange} type="number" required />
                <FormInput label="ALTN2 FUEL" name="altn2Fuel" value={formData.altn2Fuel} onChange={handleChange} type="number" />
                <FormInput label="ALTN3 FUEL" name="altn3Fuel" value={formData.altn3Fuel} onChange={handleChange} type="number" />
                <FormInput label="CONT FUEL" name="cont" value={formData.cont} onChange={handleChange} type="number" required />
                <FormInput label="FINAL RES" name="finres" value={formData.finres} onChange={handleChange} type="number" required />
                <FormInput label="TAXI FUEL" name="taxi" value={formData.taxi} onChange={handleChange} type="number" required />
                <FormInput label="EXTRA FUEL" name="extra" value={formData.extra} onChange={handleChange} type="number" />
            </div>
            
            <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-900/50 flex justify-around flex-wrap gap-4 mt-4">
               <div className="text-center">
                 <p className="text-xs text-slate-400 font-medium mb-1">MIN FUEL</p>
                 <p className="text-xl font-mono text-blue-400 font-bold">{Math.round(minFuel).toLocaleString()}</p>
               </div>
               <div className="text-center">
                 <p className="text-xs text-slate-400 font-medium mb-1">MIN DIV</p>
                 <p className="text-xl font-mono text-yellow-400 font-bold">{Math.round(minDivFuel).toLocaleString()}</p>
               </div>
               <div className="text-center">
                 <p className="text-xs text-slate-400 font-medium mb-1">RAMP FUEL (BLOCK)</p>
                 <p className="text-2xl font-mono text-green-400 font-bold">{Math.round(rampFuel).toLocaleString()}</p>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-slate-800">
            <button type="button" onClick={onCancel} className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 sm:bg-transparent hover:bg-slate-700 sm:hover:bg-slate-800 rounded-md transition-colors border border-transparent sm:border-slate-700">取消 (Cancel)</button>
            <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20 border border-blue-500">
              <CheckCircle className="w-4 h-4" /> 產生飛行計畫 (Generate OFP)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DashboardView({ flights, onView }) {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatusCard title="總監控航班 (Total)" value={flights.length.toString()} color="text-blue-400" />
        <StatusCard title="已放行 (Disp. Cleared)" value={flights.filter(f => f.status === 'CLEARED' || f.status === 'ACCEPTED').length.toString()} color="text-green-400" />
        <StatusCard title="機長已確認 (Capt. Accepted)" value={flights.filter(f => f.status === 'ACCEPTED').length.toString()} color="text-indigo-400" />
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col w-full">
        <div className="px-4 lg:px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="font-semibold text-slate-200">當前航班清單 (Active Flights)</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="px-4 lg:px-6 py-4 font-medium">航班號</th>
                <th className="px-4 lg:px-6 py-4 font-medium">航機</th>
                <th className="px-4 lg:px-6 py-4 font-medium">航線</th>
                <th className="px-4 lg:px-6 py-4 font-medium">Block Out</th>
                <th className="px-4 lg:px-6 py-4 font-medium">狀態</th>
                <th className="px-4 lg:px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {flights.map((flight) => (
                <tr key={flight.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-4 lg:px-6 py-4">
                    <div className="font-bold text-slate-200">{flight.callsign}</div>
                    <div className="text-xs text-slate-500">{flight.airline}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm text-slate-300">{flight.aircraft}</div>
                    <div className="text-xs text-slate-500">{flight.registration}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300 font-mono">
                      <span>{flight.dep}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>{flight.arr}</span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm text-slate-300 font-mono">{flight.std}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      flight.status === 'ACCEPTED' ? 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20' :
                      flight.status === 'CLEARED' ? 'bg-green-400/10 text-green-400 border-green-400/20' : 
                      'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                    }`}>
                      {flight.status}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <button onClick={() => onView(flight)} className="text-sm text-blue-400 font-medium bg-blue-500/10 px-3 py-1.5 rounded transition-all opacity-80 hover:opacity-100 hover:bg-blue-500/20 whitespace-nowrap">
                      開啟計畫 &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OFPBriefingView({ flight, currentUser, onSign, onUpdateFlight, appSettings }) {
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  if (!flight) return null;

  const isDispatcher = currentUser.role === 'dispatcher';
  const isPilot = currentUser.role === 'pilot';

  const handlePrint = () => window.print();
  
  const f = flight.fuel;
  const w = flight.weights;
  const blockFuel = f.trip + f.cont + f.altn1 + f.finres + f.extra + f.taxi;
  const takeoffFuel = blockFuel - f.taxi;

  let formattedRoute = flight.route.trim();
  if (flight.dep && !formattedRoute.startsWith(flight.dep)) {
    formattedRoute = `${flight.dep} ${formattedRoute}`;
  }
  if (flight.arr && !formattedRoute.endsWith(flight.arr)) {
    formattedRoute = `${formattedRoute} ${flight.arr}`;
  }

  const mockWeather = (icao) => {
    if (!icao) return null;
    return {
      metar: `METAR ${icao} 280700Z 09008KT 9999 SCT030 22/15 Q1018 NOSIG=`,
      taf: `TAF ${icao} 280500Z 2806/0112 05010KT 9999 SCT025 BKN040=`
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
       return `${parts[2]}${months[parseInt(parts[1], 10) - 1]}${parts[0].slice(2)}`;
    }
    return dateStr;
  };

  const { airmetList, sigwxLowList, sigwxMidList, sigwxHighList } = useMemo(() => {
    return {
      airmetList: getDynamicAirmetUrls(flight.date, flight.std),
      sigwxLowList: getDynamicSigwxUrls('sig1', flight.date, flight.std),
      sigwxMidList: getDynamicSigwxUrls('sig2', flight.date, flight.std),
      sigwxHighList: getDynamicSigwxUrls('sig4', flight.date, flight.std)
    };
  }, [flight.date, flight.std]);

  const generateAIBriefing = async () => {
    if (!appSettings.geminiApiKey) {
      setAiError("⚠ 請先點擊右上角「齒輪圖示 (系統設定)」，輸入您的 Gemini API Key 以啟用分析功能。");
      return;
    }
    
    setAiLoading(true);
    setAiError(null);
    
    const altnsList = [flight.altn1, flight.altn2, flight.altn3].filter(Boolean).join(', ');
    
    const notamsPrompt = [
        { type: 'DEP', icao: flight.dep },
        { type: 'ARR', icao: flight.arr },
        { type: 'ALTN1', icao: flight.altn1 },
        { type: 'ALTN2', icao: flight.altn2 },
        { type: 'ALTN3', icao: flight.altn3 }
    ].filter(item => item.icao).map(item => {
        const nList = mockNotam(item.icao);
        const joinedNotams = nList.map(n => n.replace(/\n/g, ' ')).join('\n  - ');
        return `[${item.type}] ${item.icao}:\n  - ${joinedNotams}`;
    }).join('\n');

    try {
      const prompt = `請扮演資深的航空簽派員，根據以下營運飛行計畫(OFP)資料，產生一份給飛行員的「航班風險與注意事項簡報」。
要求：
1. 請以「繁體中文」輸出，排版使用 Markdown 條列式，重點清晰、語氣專業。
2. 內容需包含：油量充裕度評估、機況限制評估、航路潛在風險、起降場/備降場注意事項(含NOTAM)。
3. 【重要時間轉換】：飛行計畫中的 Block Out 與 Block In 時間均為 ZULU Time (UTC)。在評估日夜間操作風險或機場起降時間限制時，請務必先自行將 ZULU Time 轉換為該機場的 Local Time（當地時間）。例如從台灣 (UTC+8) 23:35Z 起飛，當地時間為隔日上午 07:35，屬於日間操作，切勿當作深夜航班評估。
4. 【NOTAM 注意事項】：飛航公告 (NOTAM) 內的時間皆為 UTC (ZULU Time)，評估時請特別留意跑道關閉或設施限制等對飛安或油量的影響。

【航班基礎資訊】
- 航班：${flight.callsign} (機型：${flight.aircraft} / ${flight.registration})
- 航線：${flight.dep} 飛往 ${flight.arr}
- 備降場列表：${altnsList || '無'}
- Block Out Time (Z)：${flight.std}
- Block In Time (Z)：${flight.sta}

【油量規劃 (KGS)】
- 航程油量 (Trip Fuel)：${f.trip}
- 備降場1 (${flight.altn1}) 油量：${f.altn1}
${flight.altn2 ? `- 備降場2 (${flight.altn2}) 油量：${f.altn2}` : ''}
${flight.altn3 ? `- 備降場3 (${flight.altn3}) 油量：${f.altn3}` : ''}
- 最低起飛油量 (Min Takeoff)：${takeoffFuel}
- 額外添加 (Extra Fuel)：${f.extra}

【重量規劃 (KGS)】
- 預估起飛重量 (TOW)：${w.tow}
- 無油重量 (ZFW)：${w.zfw}

【飛航公告 (NOTAM)】
${notamsPrompt}

【機況、航路與簽派備註】
- 機況 DD Items：${flight.ddItems || 'NIL'}
- ATC Route：${formattedRoute}
- Dispatcher Remarks：${flight.remarks || 'NIL'}
`;

      console.group("🤖 [AI 智能分析] 傳送給 Gemini 的 Prompt 內容：");
      console.log(prompt);
      console.groupEnd();

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${appSettings.aiModel}:generateContent?key=${appSettings.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API 連線失敗');
      }

      const data = await response.json();
      const reportText = data.candidates?.[0]?.content?.parts?.[0]?.text || '無法生成分析內容。';
      setAiReport(reportText);
    } catch (err) {
      console.error(err);
      setAiError(`生成失敗: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const allIcaosForNotam = [flight.dep, flight.arr, flight.altn1, flight.altn2, flight.altn3].filter(Boolean).join(',');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 print:pb-0 print:space-y-0 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-4 rounded-xl border border-slate-800 gap-4 print:hidden shadow-lg w-full">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`p-2 rounded-full shrink-0 ${flight.status === 'ACCEPTED' ? 'bg-indigo-500/20 text-indigo-400' : flight.status === 'CLEARED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {flight.status === 'ACCEPTED' ? <ShieldCheck className="w-6 h-6" /> : flight.status === 'CLEARED' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide truncate">{flight.callsign} <span className="text-slate-500 font-normal">| {flight.aircraft}</span></h2>
            <p className="text-xs sm:text-sm text-slate-400 truncate">DISPATCH RELEASE & OFP</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button onClick={handlePrint} className="flex-1 sm:flex-none justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-slate-700">
            <Printer className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">匯出/列印</span><span className="sm:hidden">列印</span>
          </button>
          
          {isDispatcher && !flight.dispatcherSign && (
            <button onClick={() => onSign(flight.id, 'dispatcher')} className="flex-1 sm:flex-none justify-center bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20">
              <CheckCircle className="w-4 h-4 shrink-0" /> 簽派放行 (Sign)
            </button>
          )}
          {isPilot && flight.dispatcherSign && !flight.captainSign && (
            <button onClick={() => onSign(flight.id, 'pilot')} className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20">
              <Plane className="w-4 h-4 shrink-0" /> 機長簽收 (Accept)
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700 rounded-lg p-4 sm:p-6 md:p-8 shadow-2xl font-mono text-xs sm:text-sm text-slate-300 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 w-full overflow-hidden">
        <div className="border-b-2 border-slate-600 print:border-black pb-4 mb-6 flex flex-col md:flex-row justify-between gap-4 md:gap-8">
           <div className="space-y-1">
              <p className="font-bold text-white print:text-black text-base sm:text-lg">{flight.airline} AERODISPATCH PRO - OFP</p>
              <p>FLIGHT: <span className="text-blue-400 print:text-blue-800 font-bold text-sm sm:text-base">{flight.callsign}</span>   DATE: {formatDate(flight.date)}</p>
              <p>ACFT: {flight.aircraft}      REG: {flight.registration}</p>
           </div>
           <div className="md:text-right space-y-1 bg-slate-900/50 print:bg-transparent p-3 md:p-0 rounded-md">
              <p>DEP: <span className="text-green-400 print:text-green-800 font-bold">{flight.dep}</span>  BLK OUT: {flight.std}</p>
              <p>ARR: <span className="text-green-400 print:text-green-800 font-bold">{flight.arr}</span>  BLK IN: {flight.sta}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 print:grid-cols-2 print:gap-10">
          <div className="bg-slate-900/30 print:bg-transparent p-4 md:p-6 rounded-lg border border-slate-800 print:border-none print:p-0">
             <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase text-sm sm:text-base">1. Fuel Plan (KGS)</h3>
             <div className="space-y-1.5">
                <FuelRow label="TRIP FUEL" value={f.trip} />
                <FuelRow label="CONT 5%" value={f.cont} />
                <FuelRow label={`ALTN1 (${flight.altn1})`} value={f.altn1} />
                {flight.altn2 && f.altn2 > 0 && <FuelRow label={`ALTN2 (${flight.altn2})`} value={f.altn2} />}
                {flight.altn3 && f.altn3 > 0 && <FuelRow label={`ALTN3 (${flight.altn3})`} value={f.altn3} />}
                <FuelRow label="FINAL RES" value={f.finres} />
                <div className="border-t border-dashed border-slate-600 print:border-black my-2"></div>
                <FuelRow label="MIN TAKEOFF" value={takeoffFuel} bold isBlue textLarge/>
                <FuelRow label="EXTRA" value={f.extra} />
                <FuelRow label="TAXI" value={f.taxi} />
                <div className="border-t-2 border-slate-600 print:border-black my-2"></div>
                <FuelRow label="BLOCK FUEL" value={blockFuel} bold textLarge isGreen/>
             </div>
          </div>
          <div className="bg-slate-900/30 print:bg-transparent p-4 md:p-6 rounded-lg border border-slate-800 print:border-none print:p-0">
             <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase text-sm sm:text-base">2. Weight Summary (KGS)</h3>
             <div className="space-y-1.5">
                <WtRow label="EST PAYLOAD" value={w.payload} />
                <WtRow label="EST ZFW" value={w.zfw} />
                <WtRow label="BLOCK FUEL" value={blockFuel} />
                <div className="border-t border-dashed border-slate-600 print:border-black my-2"></div>
                <WtRow label="EST TOW" value={w.tow} bold textLarge />
                <WtRow label="EST LAW" value={w.law} textLarge />
             </div>
             
             <div className="mt-6 bg-slate-900/80 print:bg-gray-100 p-3 sm:p-4 border border-slate-700 print:border-gray-400 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-slate-500 print:text-gray-600">DISPATCHER REMARKS:</p>
                  {isDispatcher && <span className="text-[10px] text-blue-400 print:hidden flex items-center gap-1"><Edit className="w-3 h-3"/> 可點擊編輯</span>}
                </div>
                {isDispatcher ? (
                  <textarea 
                    className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none text-yellow-400 print:text-black print:font-bold text-xs sm:text-sm custom-scrollbar resize-y mt-1"
                    value={flight.remarks || ''}
                    onChange={(e) => onUpdateFlight({ ...flight, remarks: e.target.value })}
                    rows={2}
                    placeholder="輸入簽派員備註..."
                  />
                ) : (
                  <p className="text-yellow-400 print:text-black print:font-bold text-xs sm:text-sm whitespace-pre-wrap">
                    {flight.remarks || 'NIL'}
                  </p>
                )}
             </div>
          </div>
        </div>

        <div className="mt-8">
           <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase flex items-center gap-2 text-sm sm:text-base">
             <Map className="w-4 h-4 print:hidden" /> 3. ATC Routing
           </h3>
           <div className="bg-slate-900 print:bg-transparent print:p-0 print:border-none p-3 sm:p-5 rounded-md border border-slate-700 leading-relaxed text-blue-200 print:text-black break-words font-mono text-xs sm:text-sm">
              {formattedRoute}
           </div>
        </div>

        <div className="mt-8">
           <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase flex items-center gap-2 text-sm sm:text-base">
             <CloudRain className="w-4 h-4 print:hidden" /> 4. Weather (METAR / TAF)
           </h3>
           <div className="bg-slate-900 print:bg-transparent print:p-0 print:border-none p-4 rounded-md border border-slate-700 text-xs sm:text-sm space-y-4">
              <div className="break-words">
                <span className="inline-block bg-slate-800 print:bg-gray-200 text-slate-300 print:text-gray-700 px-2 py-0.5 rounded text-xs mr-2 font-bold">[DEP]</span>
                <span className="text-green-400 print:text-black font-bold text-sm sm:text-base">{flight.dep}</span>
                <p className="text-slate-400 print:text-black mt-1.5">METAR {flight.dep} 280700Z 06012KT 9999 FEW020 BKN050 24/18 Q1015 NOSIG=</p>
                <p className="text-slate-400 print:text-black mt-0.5">TAF {flight.dep} 280500Z 2806/0112 05010KT 9999 SCT025 BKN040=</p>
              </div>
              <div className="border-t border-slate-700 print:border-gray-300 pt-3 break-words">
                <span className="inline-block bg-slate-800 print:bg-gray-200 text-slate-300 print:text-gray-700 px-2 py-0.5 rounded text-xs mr-2 font-bold">[ARR]</span>
                <span className="text-green-400 print:text-black font-bold text-sm sm:text-base">{flight.arr}</span>
                <p className="text-slate-400 print:text-black mt-1.5">{mockWeather(flight.arr)?.metar}</p>
                <p className="text-slate-400 print:text-black mt-0.5">{mockWeather(flight.arr)?.taf}</p>
              </div>
              
              {[flight.altn1, flight.altn2, flight.altn3].map((altnApt, idx) => {
                 if (!altnApt) return null;
                 return (
                   <div key={`altn-wx-${idx}`} className="border-t border-slate-700 print:border-gray-300 pt-3 break-words">
                     <span className="inline-block bg-slate-800 print:bg-gray-200 text-slate-300 print:text-gray-700 px-2 py-0.5 rounded text-xs mr-2 font-bold">[ALTN {idx+1}]</span>
                     <span className="text-yellow-400 print:text-black font-bold text-sm sm:text-base">{altnApt}</span>
                     <p className="text-slate-400 print:text-black mt-1.5">METAR {altnApt} 280700Z 18015G25KT 5000 -RA BR FEW015 BKN030 18/16 Q1008 NOSIG=</p>
                     <p className="text-slate-400 print:text-black mt-0.5">TAF {altnApt} 280500Z 2806/0112 19015KT 6000 -RA BKN020 PROB30 TEMPO 2808/2812 3000 TSRA=</p>
                   </div>
                 );
              })}
           </div>
        </div>

        <div className="mt-8 print:break-before-page">
           <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase flex items-center gap-2 text-sm sm:text-base">
             <CloudLightning className="w-4 h-4 print:hidden" /> 5. Enroute Weather Charts
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <BriefingChart title="SFC-10000FT SIGWX" srcList={sigwxLowList} auth={null} useAuth={false} />
              <BriefingChart title="10000-25000FT SIGWX" srcList={sigwxMidList} auth={null} useAuth={false} />
              <BriefingChart title="SFC-45000FT SIGWX" srcList={sigwxHighList} auth={null} useAuth={false} />
              <BriefingChart title="TPE AIRMET" srcList={airmetList} auth={appSettings} useAuth={true} />
           </div>
        </div>

        {/* 第 6 項 NOTAM 區塊 */}
        <div className="mt-8 print:break-before-page">
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-white print:text-black border-b border-slate-600 print:border-black pb-1 font-bold uppercase flex items-center gap-2 text-sm sm:text-base flex-1">
               <FileText className="w-4 h-4 print:hidden" /> 6. NOTAM (飛航公告)
             </h3>
             <a 
                href={`https://notams.aim.faa.gov/notamSearch/nsapp.html#/results?searchType=0&locIds=${allIcaosForNotam}`} 
                target="_blank" 
                rel="noreferrer" 
                className="ml-4 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors print:hidden shadow-lg shadow-blue-900/20"
                title="在 FAA 系統一次開啟本航班所有相關機場"
             >
                <ExternalLink className="w-3 h-3 shrink-0" /> <span className="hidden sm:inline">於 FAA 系統開啟全部</span><span className="sm:hidden">FAA 查詢</span>
             </a>
           </div>
           
           <div className="space-y-3">
              {[
                { type: 'DEP', icao: flight.dep },
                { type: 'ARR', icao: flight.arr },
                { type: 'ALTN 1', icao: flight.altn1 },
                { type: 'ALTN 2', icao: flight.altn2 },
                { type: 'ALTN 3', icao: flight.altn3 }
              ].map((item, idx) => {
                 if (!item.icao) return null;
                 const notamsList = mockNotam(item.icao);
                 return <NotamAccordion key={`notam-${idx}`} typeLabel={item.type} icao={item.icao} notams={notamsList} />;
              })}
           </div>
        </div>

        {/* 第 7 項 機況 DD Items */}
        <div className="mt-8 print:break-before-page">
           <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase flex items-center gap-2 text-sm sm:text-base">
             <Wrench className="w-4 h-4 print:hidden" /> 7. 機況 DD Items (Deferred Defects)
           </h3>
           <div className="bg-slate-900/80 print:bg-gray-100 p-3 sm:p-4 border border-slate-700 print:border-gray-400 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-slate-500 print:text-gray-600">MEL / CDL / OTHER DEFECTS:</p>
                {isDispatcher && <span className="text-[10px] text-blue-400 print:hidden flex items-center gap-1"><Edit className="w-3 h-3"/> 可點擊編輯</span>}
              </div>
              {isDispatcher ? (
                <textarea 
                  className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none text-red-400 print:text-black print:font-bold text-xs sm:text-sm custom-scrollbar resize-y mt-1"
                  value={flight.ddItems || ''}
                  onChange={(e) => onUpdateFlight({ ...flight, ddItems: e.target.value })}
                  rows={2}
                  placeholder="輸入機況、MEL 限制項目..."
                />
              ) : (
                <p className="text-red-400 print:text-black print:font-bold text-xs sm:text-sm whitespace-pre-wrap">
                  {flight.ddItems || 'NIL'}
                </p>
              )}
           </div>
        </div>

        {/* 第 8 項 AI 分析功能區塊 */}
        <div className="mt-8 print:break-before-page">
           <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase flex items-center gap-2 text-sm sm:text-base">
             <Sparkles className="w-4 h-4 print:hidden text-blue-400" /> 8. AI Flight Briefing Analysis
           </h3>
           <div className="bg-slate-900/60 print:bg-transparent print:p-0 print:border-none p-5 rounded-md border border-slate-700 text-xs sm:text-sm">
              {!aiReport && !aiLoading && (
                  <div className="text-center py-6 print:hidden">
                     <p className="text-slate-400 mb-4 leading-relaxed max-w-md mx-auto">
                       點擊下方按鈕，使用 Gemini AI 自動擷取上方飛行計畫的油量、航路與備註資料，產生專業的「航班風險與注意事項」簡報。
                     </p>
                     <button onClick={generateAIBriefing} className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 text-white px-5 py-2.5 rounded-md font-medium transition-colors flex items-center justify-center gap-2 mx-auto">
                        <Bot className="w-4 h-4" /> 產生 AI 分析報告 (Generate)
                     </button>
                     {aiError && (
                       <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-md text-red-400 flex items-center justify-center gap-2 text-xs">
                         <AlertTriangle className="w-4 h-4 shrink-0" /> {aiError}
                       </div>
                     )}
                  </div>
              )}
              {aiLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      <p className="font-medium animate-pulse">正在透過 Gemini 深入分析航路與氣象資料...</p>
                  </div>
              )}
              {aiReport && (
                  <div className="space-y-4">
                      <div className="text-slate-300 print:text-black whitespace-pre-wrap leading-relaxed font-sans text-[13px] sm:text-sm bg-slate-950/50 print:bg-transparent p-4 rounded-md border border-slate-800/50 print:border-none">
                          {aiReport}
                      </div>
                      <div className="print:hidden text-right pt-3 border-t border-slate-800/50 flex justify-end">
                         <button onClick={generateAIBriefing} className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700 hover:bg-slate-800 px-3 py-1.5 rounded">
                            <RefreshCw className="w-3 h-3" /> 重新分析 (Regenerate)
                         </button>
                      </div>
                  </div>
              )}
           </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row justify-between sm:justify-around border-t border-slate-600 print:border-black pt-8 gap-8">
           <div className="text-center w-full sm:w-56">
             <p className="border-b border-slate-500 print:border-black pb-2 h-10 flex items-end justify-center font-bold text-blue-400 print:text-blue-800 font-sans text-sm sm:text-base">
               {flight.dispatcherSign ? `E-SIGNED (${flight.dispatcherSign})` : ''}
             </p>
             <p className="text-xs sm:text-sm text-slate-500 print:text-black font-bold mt-2">DISPATCHER SIGNATURE</p>
           </div>
           <div className="text-center w-full sm:w-56">
             <p className="border-b border-slate-500 print:border-black pb-2 h-10 flex items-end justify-center font-bold text-indigo-400 print:text-indigo-800 font-sans text-sm sm:text-base">
                {flight.captainSign ? `E-SIGNED (${flight.captainSign})` : ''}
             </p>
             <p className="text-xs sm:text-sm text-slate-500 print:text-black font-bold mt-2">CAPTAIN SIGNATURE</p>
           </div>
        </div>
      </div>
    </div>
  );
}