import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlaneTakeoff, PlaneLanding, FileText, CloudRain, Clock, 
  Settings, ChevronRight, ChevronLeft, Plus, Map, Info, AlertTriangle, 
  CheckCircle, Navigation, Printer, CloudLightning, RefreshCw, ZoomIn,
  Menu, X, LogOut, User, KeyRound, ShieldCheck, Plane, Database, Trash2
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
  { icao: 'VMMC', name: 'MACAU INTL' },
  { icao: 'RJAA', name: 'TOKYO NARITA' },
  { icao: 'RCKH', name: 'KAOHSIUNG INTL' },
  { icao: 'RCQC', name: 'MAKUNG' }
];

const initialRoutes = [
  {
    id: 'r1', dep: 'RCTP', arr: 'KJFK', altnApt: 'KBOS', acftType: 'B777-300ER', distance: 6800,
    trip: 105000, altn: 4500, finres: 3200, cont: 5250, taxi: 800, extra: 2000,
    minFuel: 118750, minDivFuel: 7750, rampFuel: 120750
  },
  {
    id: 'r2', dep: 'RCTP', arr: 'VHHH', altnApt: 'VMMC', acftType: 'A330-300', distance: 430,
    trip: 12500, altn: 2100, finres: 1800, cont: 625, taxi: 400, extra: 0,
    minFuel: 17425, minDivFuel: 3950, rampFuel: 17425
  },
  {
    id: 'r3', dep: 'RCKH', arr: 'RCQC', altnApt: 'RCKH', acftType: 'ATR72-600', distance: 122,
    trip: 460, altn: 430, finres: 300, cont: 200, taxi: 100, extra: 0,
    minFuel: 1490, minDivFuel: 780, rampFuel: 1490
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
    altn: 'KBOS',
    std: '23:35Z',
    sta: '14:15Z',
    status: 'CLEARED',
    dispatcherSign: 'DP_AUTH_01',
    captainSign: null,
    route: 'SID CHALI M750 ENVAR OTR8 SEALS 50N160E 50N170E 49N180E 47N170W 45N160W 43N150W 40N140W 38N130W 35N120W STAR',
    weights: { zfw: 220500, payload: 52000, tow: 335000, law: 245000 },
    fuel: { trip: 105000, cont: 5250, altn: 4500, finres: 3200, extra: 2000, taxi: 800 }
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
    altn: 'VMMC',
    std: '04:00Z',
    sta: '05:45Z',
    status: 'PREFLIGHT',
    dispatcherSign: null,
    captainSign: null,
    route: 'SID CHALI T1 KADAP M750 ENVAR V512 ABBEY STAR',
    weights: { zfw: 165000, payload: 38000, tow: 195000, law: 182000 },
    fuel: { trip: 12500, cont: 625, altn: 2100, finres: 1800, extra: 0, taxi: 400 }
  }
];

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

  if (targetDate.getTime() > now.getTime() + 4 * 3600 * 1000) {
    targetDate = new Date(now.getTime() + 4 * 3600 * 1000);
  }

  const addSequence = (dateObj, count) => {
    const currentHour = dateObj.getUTCHours();
    let startHour;
    let daysOffset = 0;

    if (currentHour >= 21) { startHour = 21; daysOffset = 0; }
    else if (currentHour >= 17) { startHour = 17; daysOffset = 0; }
    else if (currentHour >= 13) { startHour = 13; daysOffset = 0; }
    else if (currentHour >= 9) { startHour = 9; daysOffset = 0; }
    else if (currentHour >= 5) { startHour = 5; daysOffset = 0; }
    else if (currentHour >= 1) { startHour = 1; daysOffset = 0; }
    else { startHour = 21; daysOffset = -1; }

    const baseDate = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate() + daysOffset, startHour, 0, 0));
    const startCheckDate = new Date(baseDate.getTime() + 4 * 60 * 60 * 1000);

    for (let i = 0; i < count; i++) {
      const start = new Date(startCheckDate.getTime() - i * 4 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

      const formatDDHHMM = (d) => {
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        return `${dd}${hh}00`;
      };

      const startStr = formatDDHHMM(start);
      const endStr = formatDDHHMM(end);
      
      urls.push(`https://aoaws.anws.gov.tw/data/tamc/typh/airmet_03_${startStr}_${endStr}.jpg`);
      urls.push(`https://aoaws.anws.gov.tw/data/tamc/typh/airmet_02_${startStr}_${endStr}.jpg`);
      urls.push(`https://aoaws.anws.gov.tw/data/tamc/typh/airmet_01_${startStr}_${endStr}.jpg`);
    }
  };

  addSequence(targetDate, 8); 
  addSequence(now, 8);
  
  return [...new Set(urls)];
};

const getDynamicSigwxUrls = (basePrefix, targetDateStr = null, targetHourStr = null) => {
  const urls = [];
  const now = new Date();
  let targetDate = targetDateStr ? parseTargetDate(targetDateStr, targetHourStr) : now;

  const addSequence = (dateObj, count) => {
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();
    const totalHours = hours + minutes / 60;

    let bestIssueHour = 0;
    let dayOffset = 0;

    if (totalHours >= 21) { bestIssueHour = 0; dayOffset = 1; }
    else if (totalHours >= 15) bestIssueHour = 18;
    else if (totalHours >= 9) bestIssueHour = 12;
    else if (totalHours >= 3) bestIssueHour = 6;
    else { bestIssueHour = 0; }

    const validDate = new Date(dateObj.getTime());
    validDate.setUTCDate(validDate.getUTCDate() + dayOffset);
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

  addSequence(targetDate, 4);
  addSequence(now, 4);
  
  return [...new Set(urls)];
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [currentView, setCurrentView] = useState('dashboard'); 
  
  // App Data State
  const [flights, setFlights] = useState(initialFlights);
  const [aircrafts, setAircrafts] = useState(initialAircrafts);
  const [airports, setAirports] = useState(initialAirports);
  const [routes, setRoutes] = useState(initialRoutes);
  
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [zuluTime, setZuluTime] = useState('');
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aoawsAuth, setAoawsAuth] = useState({ username: '', password: '' });

  // ZULU Clock Effect
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
          {currentView === 'view' && <OFPBriefingView flight={selectedFlight} currentUser={currentUser} onSign={handleSignFlight} aoawsAuth={aoawsAuth} />}
          {currentView === 'weather' && <WeatherView zuluTime={zuluTime} aoawsAuth={aoawsAuth} />}
        </main>
      </div>
      
      {/* Global styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1cm; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
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
          auth={aoawsAuth} 
          onSave={(auth) => { setAoawsAuth(auth); setIsSettingsOpen(false); }} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}

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

function FormInput({ label, name, value, onChange, placeholder, type = "text", readonly = false }) {
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
        required={!readonly} 
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options, defaultOption }) {
  return (
    <div className="w-full flex flex-col min-w-0">
      <label className="block text-xs font-medium text-slate-400 mb-1.5 truncate" title={label}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono transition-colors"
        required
      >
        <option value="" disabled className="text-slate-500">{defaultOption}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>{opt.label}</option>
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

function BriefingChart({ title, srcList, auth }) {
  return (
    <div className="border border-slate-700 print:border-gray-400 rounded-md p-2 lg:p-3 bg-slate-900/30 print:bg-white flex flex-col h-[300px] sm:h-[350px] print:h-[450px]">
       <h4 className="text-xs font-bold text-slate-300 print:text-black mb-2 text-center tracking-widest">{title}</h4>
       <div className="flex-1 relative overflow-hidden bg-[#0f172a] print:bg-transparent rounded flex items-center justify-center p-1">
         <WeatherImage srcList={srcList} alt={title} auth={auth} isBriefing={true} />
       </div>
    </div>
  );
}

// --- Weather Image Component ---
function WeatherImage({ srcList, alt, auth, isBriefing = false }) {
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

        // Try 1: Secure Auth
        if (auth && auth.username) {
          try {
            console.log(`-> 嘗試 HTTP Basic Auth 網址: ${baseUrl}`);
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
          console.log('-> [方法1] 未設定帳密，跳過 Auth Fetch。');
        }

        // Try 2: Direct Image Load
        try {
          console.log(`-> 嘗試公開直連 網址: ${baseUrl}`);
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

        // Try 3: Proxy
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

        console.groupEnd(); // 結束此 URL 的群組
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
  }, [srcList, auth, alt]);

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

// --- Views ---
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

function DatabaseView({ aircrafts, setAircrafts, airports, setAirports, routes, setRoutes }) {
  const [activeTab, setActiveTab] = useState('aircraft');
  
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

  const [rtForm, setRtForm] = useState({
    dep: '', arr: '', altnApt: '', acftType: '', distance: '',
    trip: '', altn: '', finres: '', cont: '', taxi: '', extra: ''
  });

  const tF = Number(rtForm.trip) || 0;
  const aF = Number(rtForm.altn) || 0;
  const frF = Number(rtForm.finres) || 0;
  const cF = Number(rtForm.cont) || 0;
  const txF = Number(rtForm.taxi) || 0;
  const exF = Number(rtForm.extra) || 0;

  const minFuel = tF + aF + frF + cF + txF;
  const minDivFuel = aF + frF + 50;
  const rampFuel = minFuel + exF;

  const handleRtSubmit = (e) => {
    e.preventDefault();
    if (rtForm.dep && rtForm.arr && rtForm.altnApt && rtForm.acftType) {
      setRoutes([...routes, { 
        ...rtForm, 
        id: Date.now().toString(), 
        distance: Number(rtForm.distance),
        trip: tF, altn: aF, finres: frF, cont: cF, taxi: txF, extra: exF,
        minFuel, minDivFuel, rampFuel 
      }]);
      setRtForm({ dep: '', arr: '', altnApt: '', acftType: '', distance: '', trip: '', altn: '', finres: '', cont: '', taxi: '', extra: '' });
    }
  };

  const uniqueAcftTypes = [...new Set(aircrafts.map(a => a.type))];
  const aptOptions = airports.map(a => ({ value: a.icao, label: `${a.icao} - ${a.name}` }));
  const acftTypeOptions = uniqueAcftTypes.map(t => ({ value: t, label: t }));

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
              <FormInput label="註冊編號 (Registration)" name="registration" value={acftForm.registration} onChange={e => setAcftForm({...acftForm, registration: e.target.value})} placeholder="e.g. B-16722" />
              <FormInput label="機型 (Type)" name="type" value={acftForm.type} onChange={e => setAcftForm({...acftForm, type: e.target.value})} placeholder="e.g. B777-300ER" />
              <FormInput label="航空公司 (Airline)" name="airline" value={acftForm.airline} onChange={e => setAcftForm({...acftForm, airline: e.target.value})} placeholder="e.g. BR" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md text-sm font-medium transition-colors">加入資料庫</button>
            </form>
          </div>
          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
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
      )}

      {activeTab === 'airport' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg h-fit">
            <h3 className="font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">新增機場 (Add Airport)</h3>
            <form onSubmit={handleAptSubmit} className="space-y-4">
              <FormInput label="ICAO 代碼" name="icao" value={aptForm.icao} onChange={e => setAptForm({...aptForm, icao: e.target.value})} placeholder="e.g. RCTP" />
              <FormInput label="機場名稱 (Name)" name="name" value={aptForm.name} onChange={e => setAptForm({...aptForm, name: e.target.value})} placeholder="e.g. TAIPEI TAOYUAN" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md text-sm font-medium transition-colors">加入資料庫</button>
            </form>
          </div>
          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider sticky top-0">
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
      )}

      {activeTab === 'route' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg h-fit max-h-[800px] overflow-y-auto custom-scrollbar">
            <h3 className="font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">新增航線 (Add Route)</h3>
            <form onSubmit={handleRtSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <FormSelect label="起飛 (DEP)" name="dep" value={rtForm.dep} onChange={e => setRtForm({...rtForm, dep: e.target.value})} options={aptOptions} defaultOption="-- DEP --" />
                  <FormSelect label="降落 (ARR)" name="arr" value={rtForm.arr} onChange={e => setRtForm({...rtForm, arr: e.target.value})} options={aptOptions} defaultOption="-- ARR --" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormSelect label="備降 (ALTN)" name="altnApt" value={rtForm.altnApt} onChange={e => setRtForm({...rtForm, altnApt: e.target.value})} options={aptOptions} defaultOption="-- ALTN --" />
                  <FormSelect label="適用機型 (Type)" name="acftType" value={rtForm.acftType} onChange={e => setRtForm({...rtForm, acftType: e.target.value})} options={acftTypeOptions} defaultOption="-- TYPE --" />
                </div>
                <FormInput label="距離 (Distance NM)" name="distance" value={rtForm.distance} onChange={e => setRtForm({...rtForm, distance: e.target.value})} placeholder="e.g. 6800" type="number" />
              </div>
              
              <h4 className="text-xs font-semibold text-slate-400 border-b border-slate-800 pb-1 mt-4 mb-2">燃油政策 Fuel Policy (KGS)</h4>
              <div className="grid grid-cols-2 gap-2">
                <FormInput label="TRIP FUEL" name="trip" value={rtForm.trip} onChange={e => setRtForm({...rtForm, trip: e.target.value})} type="number" />
                <FormInput label="ALTN FUEL" name="altn" value={rtForm.altn} onChange={e => setRtForm({...rtForm, altn: e.target.value})} type="number" />
                <FormInput label="FINAL RES" name="finres" value={rtForm.finres} onChange={e => setRtForm({...rtForm, finres: e.target.value})} type="number" />
                <FormInput label="CONT FUEL" name="cont" value={rtForm.cont} onChange={e => setRtForm({...rtForm, cont: e.target.value})} type="number" />
                <FormInput label="TAXI FUEL" name="taxi" value={rtForm.taxi} onChange={e => setRtForm({...rtForm, taxi: e.target.value})} type="number" />
                <FormInput label="EXTRA FUEL" name="extra" value={rtForm.extra} onChange={e => setRtForm({...rtForm, extra: e.target.value})} type="number" />
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-1.5 mt-2">
                <FuelRow label="MIN FUEL" value={minFuel} bold isBlue />
                <FuelRow label="MIN DIV" value={minDivFuel} />
                <div className="border-t border-slate-700 my-1"></div>
                <FuelRow label="RAMP FUEL" value={rampFuel} bold isGreen textLarge />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md text-sm font-medium transition-colors mt-4">加入航線資料庫</button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg max-h-[800px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                  <th className="px-4 py-3">航線 (Route)</th>
                  <th className="px-4 py-3">機型 (Type)</th>
                  <th className="px-4 py-3">距離</th>
                  <th className="px-4 py-3">MIN FUEL</th>
                  <th className="px-4 py-3">RAMP FUEL</th>
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
                        <span className="text-yellow-400 text-xs ml-1">({rt.altnApt})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{rt.acftType}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{rt.distance} NM</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-400">{rt.minFuel.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-green-400">{rt.rampFuel.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setRoutes(routes.filter(r => r.id !== rt.id))} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    dep: '', arr: '', altn: '', std: '', route: '', zfw: '', payload: ''
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // 游標無縫自動格式化機制 (徹底解決跳字/游標迷失問題)
    if (name === 'std') {
      let val = value.toUpperCase().replace(/[^0-9Z:]/g, ''); // 僅允許數字、Z與冒號
      
      // 若使用者正在刪除冒號 (例如從 "12:" 刪除成 "12")，我們允許他保留 "12"
      if (formData.std.endsWith(':') && formData.std.length === 3 && val.length === 2 && !val.includes(':')) {
        value = val;
      } else {
        let raw = val.replace(/:/g, ''); // 提取純字元
        
        // ★ 關鍵防呆：只有在剛好輸入完 2 個字元時，才「在尾巴」補上冒號
        // 這樣輸入第 3 個數字時，是順理成章接在冒號後面，瀏覽器游標就不會錯亂！
        if (raw.length >= 3) {
          value = raw.slice(0, 2) + ':' + raw.slice(2, 5); 
        } else if (raw.length === 2 && !val.includes(':')) {
          value = raw + ':';
        } else {
          value = val; 
        }
      }
    } else if (name !== 'date') {
      value = value.toUpperCase();
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

  const matchingRoute = useMemo(() => {
    return routes.find(r => 
      r.dep === formData.dep && 
      r.arr === formData.arr && 
      r.altnApt === formData.altn && 
      r.acftType === formData.aircraft
    );
  }, [routes, formData.dep, formData.arr, formData.altn, formData.aircraft]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const zfwNum = parseInt(formData.zfw) || 60000;
    
    let trip, cont, altn, finres, taxi, extra;

    if (matchingRoute) {
      trip = matchingRoute.trip;
      cont = matchingRoute.cont;
      altn = matchingRoute.altn;
      finres = matchingRoute.finres;
      taxi = matchingRoute.taxi;
      extra = matchingRoute.extra || 0;
    } else {
      trip = Math.floor(zfwNum * 0.15);
      cont = Math.floor(trip * 0.05);
      altn = 2500;
      finres = 1500;
      taxi = 300;
      extra = 0;
    }

    const totalFuel = trip + cont + altn + finres + extra + taxi;
    
    const newFlight = {
      ...formData,
      status: 'PREFLIGHT', sta: 'TBD',
      dispatcherSign: null, captainSign: null,
      weights: { zfw: zfwNum, payload: parseInt(formData.payload) || 15000, tow: zfwNum + totalFuel, law: zfwNum + totalFuel - trip },
      fuel: { trip, cont, altn, finres, extra, taxi }
    };
    onSubmit(newFlight);
  };

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
              <FormInput label="航班號 (Callsign)" name="callsign" value={formData.callsign} onChange={handleChange} placeholder="e.g. CAL101" />
              
              <FormSelect 
                label="註冊編號 (Registration)" 
                name="registration" 
                value={formData.registration} 
                onChange={handleAircraftChange} 
                options={aircrafts.map(a => ({ value: a.registration, label: `${a.registration} (${a.type})` }))}
                defaultOption="-- 選擇航機 --"
              />

              <FormInput label="機型 (Aircraft)" name="aircraft" value={formData.aircraft} onChange={handleChange} placeholder="Auto-filled" readonly />
              <FormInput label="航空公司 (Airline)" name="airline" value={formData.airline} onChange={handleChange} placeholder="Auto-filled" readonly />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2 uppercase tracking-wider flex items-center gap-2"><Map className="w-4 h-4"/> Routing & Schedule</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              <FormInput label="預計起飛日期 (Date)" name="date" value={formData.date} onChange={handleChange} type="date" />
              
              <FormSelect 
                label="起飛機場 (DEP)" name="dep" value={formData.dep} onChange={handleChange} 
                options={airports.map(a => ({ value: a.icao, label: `${a.icao} - ${a.name}` }))} defaultOption="-- DEP --"
              />
              <FormSelect 
                label="降落機場 (ARR)" name="arr" value={formData.arr} onChange={handleChange} 
                options={airports.map(a => ({ value: a.icao, label: `${a.icao} - ${a.name}` }))} defaultOption="-- ARR --"
              />
              <FormSelect 
                label="備降機場 (ALTN)" name="altn" value={formData.altn} onChange={handleChange} 
                options={airports.map(a => ({ value: a.icao, label: `${a.icao} - ${a.name}` }))} defaultOption="-- ALTN --"
              />
              
              <FormInput label="預計起飛時間 (STD)" name="std" value={formData.std} onChange={handleChange} placeholder="HH:MMZ" />
            </div>
            <div className="w-full mt-4">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">ATC 航路 (ATC Route)</label>
              <textarea name="route" value={formData.route} onChange={handleChange} rows="3" className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-200 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow custom-scrollbar resize-y" placeholder="SID WAYPOINT AWY WAYPOINT STAR..." />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2 uppercase tracking-wider">Load (KGS)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormInput label="預估無油重量 (Est. ZFW)" name="zfw" value={formData.zfw} onChange={handleChange} placeholder="e.g. 62000" type="number" />
              <FormInput label="預估商載 (Est. Payload)" name="payload" value={formData.payload} onChange={handleChange} placeholder="e.g. 15000" type="number" />
            </div>
            
            <div className={`p-3 rounded-md border text-sm flex items-center gap-2 mt-4 ${matchingRoute ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-yellow-900/20 border-yellow-800 text-yellow-400'}`}>
              {matchingRoute ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>
                {matchingRoute 
                  ? `已自動套用公司航線燃油政策 (MIN FUEL: ${matchingRoute.minFuel.toLocaleString()} KGS)`
                  : '未找到符合的航線、備降場與機型設定，將使用系統標準公式估算燃油'
                }
              </span>
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
                <th className="px-4 lg:px-6 py-4 font-medium">預計起飛</th>
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

function OFPBriefingView({ flight, currentUser, onSign, aoawsAuth }) {
  if (!flight) return null;

  const isDispatcher = currentUser.role === 'dispatcher';
  const isPilot = currentUser.role === 'pilot';

  const handlePrint = () => window.print();
  
  const f = flight.fuel;
  const w = flight.weights;
  const blockFuel = f.trip + f.cont + f.altn + f.finres + f.extra + f.taxi;
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
              <p>DEP: <span className="text-green-400 print:text-green-800 font-bold">{flight.dep}</span>  STD: {flight.std}</p>
              <p>ARR: <span className="text-green-400 print:text-green-800 font-bold">{flight.arr}</span>  STA: {flight.sta}</p>
              <p>ALT: <span className="text-yellow-400 print:text-black font-bold">{flight.altn}</span></p>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 print:grid-cols-2 print:gap-10">
          <div className="bg-slate-900/30 print:bg-transparent p-4 md:p-6 rounded-lg border border-slate-800 print:border-none print:p-0">
             <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase text-sm sm:text-base">1. Fuel Plan (KGS)</h3>
             <div className="space-y-1.5">
                <FuelRow label="TRIP FUEL" value={f.trip} />
                <FuelRow label="CONT 5%" value={f.cont} />
                <FuelRow label="ALTN FUEL" value={f.altn} />
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
                <p className="text-xs text-slate-500 print:text-gray-600 mb-1">DISPATCHER REMARKS:</p>
                <p className="text-yellow-400 print:text-black print:font-bold text-xs sm:text-sm">NIL SIG WX ENROUTE. CHECK NOTAM FOR {flight.arr} RWY CLOSURE.</p>
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
              {flight.altn && (
                <div className="border-t border-slate-700 print:border-gray-300 pt-3 break-words">
                  <span className="inline-block bg-slate-800 print:bg-gray-200 text-slate-300 print:text-gray-700 px-2 py-0.5 rounded text-xs mr-2 font-bold">[ALTN]</span>
                  <span className="text-yellow-400 print:text-black font-bold text-sm sm:text-base">{flight.altn}</span>
                  <p className="text-slate-400 print:text-black mt-1.5">METAR {flight.altn} 280700Z 18015G25KT 5000 -RA BR FEW015 BKN030 18/16 Q1008 NOSIG=</p>
                  <p className="text-slate-400 print:text-black mt-0.5">TAF {flight.altn} 280500Z 2806/0112 19015KT 6000 -RA BKN020 PROB30 TEMPO 2808/2812 3000 TSRA=</p>
                </div>
              )}
           </div>
        </div>

        <div className="mt-8 print:break-before-page">
           <h3 className="text-white print:text-black border-b border-slate-600 print:border-black mb-3 pb-1 font-bold uppercase flex items-center gap-2 text-sm sm:text-base">
             <CloudLightning className="w-4 h-4 print:hidden" /> 5. Enroute Weather Charts
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <BriefingChart title="SFC-10000FT SIGWX" srcList={sigwxLowList} auth={aoawsAuth} />
              <BriefingChart title="10000-25000FT SIGWX" srcList={sigwxMidList} auth={aoawsAuth} />
              <BriefingChart title="SFC-45000FT SIGWX" srcList={sigwxHighList} auth={aoawsAuth} />
              <BriefingChart title="TPE AIRMET" srcList={airmetList} auth={aoawsAuth} />
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