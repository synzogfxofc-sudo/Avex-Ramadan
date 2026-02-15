import React, { useState, useEffect, useMemo } from 'react';
import { X, Lock, Save, AlertTriangle, CheckCircle, RefreshCw, Search, ChevronLeft, Clock, Calendar, Edit2, Globe, Sparkles, Loader2 } from 'lucide-react';
import { PrayerTime } from '../types';
import { parseCalendarText } from '../services/geminiService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSchedule: (newSchedule: PrayerTime[]) => void;
  currentSchedule: PrayerTime[];
  bypassAuth?: boolean;
}

const ADMIN_PIN = "2026";

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onUpdateSchedule, currentSchedule, bypassAuth = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  // Local state for editing
  const [localSchedule, setLocalSchedule] = useState<PrayerTime[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'import'>('list');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PrayerTime | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // AI Import State
  const [importText, setImportText] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize local schedule when opening
  useEffect(() => {
    if (isOpen) {
      setLocalSchedule(JSON.parse(JSON.stringify(currentSchedule)));
      setError(null);
      setSuccess(null);
      setViewMode('list');
      setEditingIndex(null);
      setEditForm(null);
      setSearchTerm("");
      
      // Handle Authentication
      if (bypassAuth) {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
      setPinInput("");
    }
  }, [isOpen, currentSchedule, bypassAuth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError("Incorrect PIN");
      setPinInput("");
    }
  };

  const handleResetToDhaka = () => {
    if (confirm("Reset to Live Dhaka Time? This will remove your custom Ramadan calendar and fetch data from the internet.")) {
      onUpdateSchedule([]); // Empty array signals App to switch to API mode
      setSuccess("Switched to Live Dhaka Time.");
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleGlobalSave = () => {
    onUpdateSchedule(localSchedule);
    setSuccess("Ramadan Calendar updated successfully!");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // --- AI Import Logic ---
  const handleAIImport = async () => {
    if (!importText.trim()) {
      setError("Please paste some text first.");
      return;
    }
    
    setIsProcessingAI(true);
    setError(null);
    
    try {
      const parsedSchedule = await parseCalendarText(importText);
      if (parsedSchedule && parsedSchedule.length > 0) {
        setLocalSchedule(parsedSchedule);
        setSuccess(`Successfully imported ${parsedSchedule.length} days!`);
        setViewMode('list');
        setImportText("");
      } else {
        setError("AI could not find any valid schedule data.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process text.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  // --- Edit Mode Logic ---

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...localSchedule[index] });
    setViewMode('edit');
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditForm(null);
    setViewMode('list');
  };

  const saveDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm && editingIndex !== null) {
      const updated = [...localSchedule];
      updated[editingIndex] = editForm;
      setLocalSchedule(updated);
      cancelEditing();
      setSuccess("Day updated. Don't forget to Save All Changes.");
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleFormChange = (field: keyof PrayerTime, value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleDateChange = (dateString: string) => {
     if (!editForm) return;
     const dateObj = new Date(dateString);
     if (!isNaN(dateObj.getTime())) {
         setEditForm({ ...editForm, date: dateObj.toDateString() });
     }
  };

  const formatDateForInput = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
  };

  const filteredSchedule = useMemo(() => {
    return localSchedule.filter(day => 
      day.day.toString().includes(searchTerm) || 
      day.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localSchedule, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] h-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isAuthenticated ? 'bg-lime-500/10 text-lime-400' : 'bg-red-500/10 text-red-400'}`}>
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Ramadan Calendar</h2>
              <p className="text-xs text-zinc-500">
                  {isAuthenticated ? (viewMode === 'edit' ? `Editing Day ${editForm?.day}` : viewMode === 'import' ? 'AI Auto-Import' : 'Manage Schedule') : 'Security Check'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <p className="text-zinc-400 mb-6 text-center">Enter security PIN to manage schedule.</p>
              <form onSubmit={handleLogin} className="w-full max-w-xs flex flex-col gap-4">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN"
                  className="w-full bg-black border border-zinc-700 rounded-2xl px-4 py-3 text-center text-white tracking-[0.5em] focus:outline-none focus:border-lime-500 transition-colors"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="w-full bg-white text-black font-bold py-3 rounded-2xl hover:bg-zinc-200 transition-colors"
                >
                  Unlock
                </button>
              </form>
              {error && <p className="text-red-400 text-sm mt-4 animate-pulse">{error}</p>}
            </div>
          ) : viewMode === 'import' ? (
             // AI IMPORT VIEW
             <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-4 duration-300">
                <button 
                 onClick={() => setViewMode('list')}
                 className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors text-sm w-fit"
               >
                 <ChevronLeft className="w-4 h-4" /> Back to list
               </button>
               
               <div className="bg-lime-500/10 border border-lime-500/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Smart Import</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Paste your entire calendar text below. The AI will automatically extract dates, Sehri, and Iftar times.
                      Works with copied text from websites, PDFs, or Excel.
                    </p>
                  </div>
               </div>

               <div className="flex-1 relative mb-4">
                 <textarea
                   value={importText}
                   onChange={(e) => setImportText(e.target.value)}
                   placeholder="Paste your calendar text here..."
                   className="w-full h-full bg-black border border-zinc-700 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-lime-500 resize-none leading-relaxed custom-scrollbar"
                   spellCheck={false}
                 />
                 {isProcessingAI && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-xl z-10">
                       <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
                       <span className="text-lime-400 text-sm font-medium animate-pulse">Reading Schedule...</span>
                    </div>
                 )}
               </div>

               {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

               <button 
                  onClick={handleAIImport}
                  disabled={isProcessingAI || !importText.trim()}
                  className="w-full py-4 bg-lime-500 text-black font-bold rounded-xl hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2"
               >
                  <Sparkles className="w-4 h-4" /> Process with AI
               </button>
             </div>
          ) : viewMode === 'edit' && editForm ? (
            // EDIT FORM VIEW
            <div className="h-full overflow-y-auto p-6 animate-in slide-in-from-right-4 duration-300">
               <button 
                 onClick={cancelEditing}
                 className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors text-sm"
               >
                 <ChevronLeft className="w-4 h-4" /> Back to list
               </button>

               <form onSubmit={saveDay} className="space-y-6">
                  {/* Date Section */}
                  <div className="bg-zinc-800/30 rounded-2xl p-5 border border-zinc-700/50">
                     <label className="flex items-center gap-2 text-lime-400 text-xs font-bold uppercase tracking-wider mb-3">
                        <Calendar className="w-4 h-4" /> Date
                     </label>
                     <input 
                        type="date"
                        required
                        value={formatDateForInput(editForm.date)}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500 transition-colors"
                     />
                  </div>

                  {/* Times Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                        { label: 'Sehri (Fajr)', key: 'sehri' },
                        { label: 'Dhuhr', key: 'dhuhr' },
                        { label: 'Asr', key: 'asr' },
                        { label: 'Iftar (Maghrib)', key: 'iftar' },
                        { label: 'Isha', key: 'isha' },
                     ].map((field) => (
                        <div key={field.key} className="bg-zinc-800/30 rounded-2xl p-4 border border-zinc-700/50">
                           <label className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
                              <Clock className="w-3 h-3" /> {field.label}
                           </label>
                           <input 
                              type="time"
                              required
                              value={editForm[field.key as keyof PrayerTime] as string}
                              onChange={(e) => handleFormChange(field.key as keyof PrayerTime, e.target.value)}
                              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-lime-500 transition-colors"
                           />
                        </div>
                     ))}
                  </div>

                  <div className="pt-4 flex gap-3">
                     <button 
                        type="button" 
                        onClick={cancelEditing}
                        className="flex-1 py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors font-medium"
                     >
                        Cancel
                     </button>
                     <button 
                        type="submit"
                        className="flex-1 py-4 bg-lime-500 text-black font-bold rounded-xl hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20"
                     >
                        Update Day
                     </button>
                  </div>
               </form>
            </div>
          ) : (
            // LIST VIEW
            <div className="flex flex-col h-full animate-in slide-in-from-left-4 duration-300">
               {/* Toolbar */}
               <div className="p-4 border-b border-zinc-800 flex gap-3 shrink-0">
                  <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                     <input 
                        type="text"
                        placeholder="Search day or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-500 transition-colors"
                     />
                  </div>
                  <button 
                    onClick={() => setViewMode('import')}
                    className="p-2.5 bg-lime-500/10 text-lime-400 rounded-xl hover:bg-lime-500/20 transition-colors flex items-center gap-2"
                    title="Update with AI"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold hidden sm:inline">Update with AI</span>
                  </button>
                  <button 
                    onClick={handleResetToDhaka}
                    className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors"
                    title="Use Live Dhaka Time"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
               </div>

               {/* List */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {filteredSchedule.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-zinc-500 text-center px-4">
                          <p>No custom days found.</p>
                          <p className="text-xs mt-2 text-zinc-600">You are currently using live API mode or no schedule is set.</p>
                      </div>
                  ) : (
                      filteredSchedule.map((day, idx) => (
                        <div 
                           key={idx}
                           onClick={() => startEditing(localSchedule.indexOf(day))}
                           className="flex items-center justify-between p-4 mb-2 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400 group-hover:bg-lime-500 group-hover:text-black transition-colors">
                                 {day.day}
                              </div>
                              <div>
                                 <h4 className="text-white font-medium text-sm">{day.date}</h4>
                                 <div className="text-xs text-zinc-500 font-mono mt-1">
                                    Sehri: {day.sehri} • Iftar: {day.iftar}
                                 </div>
                              </div>
                           </div>
                           <div className="p-2 text-zinc-600 group-hover:text-lime-400 transition-colors">
                              <Edit2 className="w-4 h-4" />
                           </div>
                        </div>
                      ))
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Only in List View) */}
        {isAuthenticated && viewMode === 'list' && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex flex-col gap-3 shrink-0">
             {success && (
               <div className="flex items-center gap-2 text-lime-400 text-sm bg-lime-500/10 p-3 rounded-lg mb-2">
                  <CheckCircle className="w-4 h-4" /> {success}
               </div>
             )}
             <div className="flex gap-3">
                 <button onClick={onClose} className="flex-1 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors font-medium">
                   Close
                 </button>
                 <button 
                  onClick={handleGlobalSave}
                  className="flex-[2] py-3 bg-white text-black font-bold rounded-xl hover:bg-lime-400 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                 >
                   <Save className="w-4 h-4" /> Save Calendar
                 </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;