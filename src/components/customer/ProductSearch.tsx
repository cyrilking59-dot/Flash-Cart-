import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Store, Tag, Sparkles, Filter, CheckCircle2, Mic, MicOff, Volume2 } from 'lucide-react';

interface ProductSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchTarget: 'ALL' | 'NAME' | 'TRADER';
  setSearchTarget: (target: 'ALL' | 'NAME' | 'TRADER') => void;
  totalProductsCount: number;
  filteredCount: number;
  matchedTradersCount: number;
  traderNames: string[];
  selectedTrader: string;
  setSelectedTrader: (trader: string) => void;
  onReset: () => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  searchQuery,
  setSearchQuery,
  searchTarget,
  setSearchTarget,
  totalProductsCount,
  filteredCount,
  matchedTradersCount,
  traderNames,
  selectedTrader,
  setSelectedTrader,
  onReset
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice search is not supported in your current browser. Please try Chrome, Edge, or Safari.");
      setSpeechSupported(false);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setSpeechTranscript(currentTranscript);
        setSearchQuery(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const quickSearches = [
    { label: 'Akatsi Gari', query: 'Gari' },
    { label: 'Dabala Tilapia', query: 'Tilapia' },
    { label: 'Agbozume Kente', query: 'Kente' },
    { label: 'Mama Mawusi', query: 'Mama Mawusi' },
    { label: 'Fresh Yam', query: 'Yam' },
    { label: 'Afiwa Fish', query: 'Afiwa' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      
      {/* Header & Target Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Global Product & Trader Search</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                Real-Time
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Filter Volta market produce live by item name, trader store, or market category
            </p>
          </div>
        </div>

        {/* Search Mode Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSearchTarget('ALL')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition-all ${
              searchTarget === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Fields
          </button>
          <button
            type="button"
            onClick={() => setSearchTarget('NAME')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              searchTarget === 'NAME'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Product Name
          </button>
          <button
            type="button"
            onClick={() => setSearchTarget('TRADER')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              searchTarget === 'TRADER'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Trader Store
          </button>
        </div>
      </div>

      {/* Main Search Input & Trader Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* Search Field */}
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              isListening
                ? "Listening... Speak produce or store name (e.g. Akatsi Gari)..."
                : searchTarget === 'TRADER'
                ? "Type trader or store name (e.g. Mama Mawusi, Afiwa Fresh Fish)..."
                : searchTarget === 'NAME'
                ? "Type produce name (e.g. Akatsi Gari, Tilapia, Kente)..."
                : "Search by product name or trader store across Volta markets..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full bg-slate-950 border rounded-xl pl-10 ${
              isListening ? 'pr-20 border-amber-500 ring-2 ring-amber-500/30' : 'pr-16 border-slate-800'
            } py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all`}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              title={isListening ? "Stop listening" : "Search with Voice Command"}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className={`w-4 h-4 ${!speechSupported ? 'opacity-40' : ''}`} />
              )}
            </button>
          </div>

          {/* Voice Listening Active Indicator Banner */}
          {isListening && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg animate-fadeIn">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Listening to your voice... Speak produce or trader store name
              </span>
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Specific Trader Filter Dropdown */}
        <div className="md:col-span-4 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Store className="w-4 h-4 text-emerald-400" />
          </div>
          <select
            value={selectedTrader}
            onChange={e => setSelectedTrader(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
          >
            <option value="ALL">All Trader Stores ({traderNames.length})</option>
            {traderNames.map(trader => (
              <option key={trader} value={trader}>
                {trader}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

      </div>

      {/* Quick Search Tags & Match Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs">
        
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Quick Tags:
          </span>
          {quickSearches.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setSearchQuery(item.query);
                setSearchTarget('ALL');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                searchQuery.toLowerCase() === item.query.toLowerCase()
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center gap-3 self-end sm:self-auto text-[11px]">
          <div className="text-slate-400 font-mono">
            Matching <strong className="text-amber-400 font-bold">{filteredCount}</strong> of {totalProductsCount} items
            {searchQuery && (
              <span className="text-emerald-400 ml-1">({matchedTradersCount} traders)</span>
            )}
          </div>

          {(searchQuery || selectedTrader !== 'ALL' || searchTarget !== 'ALL') && (
            <button
              type="button"
              onClick={onReset}
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 border-l border-slate-800 pl-3"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
