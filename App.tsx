import React, { useState } from 'react';
import { Entry, ESGScores } from './types';
import { analyzeESGAction } from './services/geminiService';
import { InputSection } from './components/InputSection';
import { AnalysisCard } from './components/AnalysisCard';
import { ESGMap } from './components/ESGMap';
import { LayoutDashboard, History, Settings, Leaf } from 'lucide-react';

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Computed totals
  const totalScores = entries.reduce(
    (acc, entry) => {
      if (entry.analysis) {
        acc.environment += entry.analysis.scores.environment;
        acc.social += entry.analysis.scores.social;
        acc.governance += entry.analysis.scores.governance;
      }
      return acc;
    },
    { environment: 0, social: 0, governance: 0 } as ESGScores
  );

  const handleAnalyze = async (text: string, type: 'professional' | 'personal') => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      description: text,
      timestamp: new Date(),
      type,
      analysis: null, // Placeholder while loading
      loading: true
    };

    setEntries(prev => [newEntry, ...prev]);
    setIsAnalyzing(true);

    // Call API
    const analysis = await analyzeESGAction(text, type);

    setEntries(prev => 
      prev.map(e => e.id === newEntry.id ? { ...e, analysis, loading: false } : e)
    );
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 text-slate-900">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 md:top-0 md:left-0 w-full md:w-20 md:h-screen bg-white md:border-r border-t md:border-t-0 border-slate-200 z-50 flex md:flex-col justify-around md:justify-start items-center p-2 md:py-6">
         <div className="hidden md:block mb-8 p-2 bg-emerald-100 rounded-xl">
            <Leaf className="w-6 h-6 text-emerald-600" />
         </div>
         
         <button 
           onClick={() => setActiveTab('dashboard')}
           className={`p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
         >
           <LayoutDashboard className="w-6 h-6" />
         </button>
         
         <button 
           onClick={() => setActiveTab('history')}
           className={`p-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
         >
           <History className="w-6 h-6" />
         </button>
         
         <div className="hidden md:block mt-auto">
            <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-50">
              <Settings className="w-6 h-6" />
            </button>
         </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-20 p-4 md:p-8 max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">ESG Translator</h1>
            <p className="text-slate-500 mt-1">Transformez vos décisions en impact mesurable.</p>
          </div>
          
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-400">Score Global</p>
            <div className="text-2xl font-bold text-emerald-600">
              {(totalScores.environment + totalScores.social + totalScores.governance).toFixed(0)} pts
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Input and Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Activités Récentes</h3>
                <div className="space-y-4">
                  {entries.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                      <p className="text-slate-400">Aucune activité enregistrée.</p>
                      <p className="text-sm text-slate-300">Commencez par en ajouter une ci-dessus.</p>
                    </div>
                  ) : (
                    entries.slice(0, 5).map(entry => (
                      <AnalysisCard key={entry.id} entry={entry} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Visualization */}
            <div className="space-y-6">
              <ESGMap totalScores={totalScores} entryCount={entries.filter(e => !e.loading).length} />
              
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  Bilan Rapide
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-slate-300 text-sm">Entrées analysées</span>
                    <span className="font-mono">{entries.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-slate-300 text-sm">Alignement Taxonomie</span>
                    <span className="font-mono text-emerald-400">
                      {entries.filter(e => e.analysis?.taxonomyAlignment === 'Aligné').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Impact Net Env.</span>
                    <span className={`font-mono ${totalScores.environment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totalScores.environment > 0 ? '+' : ''}{totalScores.environment}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-2">Conseil du jour</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Pour améliorer votre score Social, pensez à vérifier les certifications éthiques de vos fournisseurs lors de vos prochains achats professionnels.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
             <h2 className="text-xl font-bold text-slate-800">Historique Complet</h2>
             {entries.length === 0 ? (
                <p className="text-slate-500">Aucun historique disponible.</p>
             ) : (
                entries.map(entry => (
                  <AnalysisCard key={entry.id} entry={entry} />
                ))
             )}
          </div>
        )}
      </main>
    </div>
  );
}
