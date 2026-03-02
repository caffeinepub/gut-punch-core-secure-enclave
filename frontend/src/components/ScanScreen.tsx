import React, { useState } from 'react';
import { useMenu } from '../contexts/MenuContext';
import { analyzeText } from '../lib/analyzer';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ScanLine, AlertTriangle, Shield, ChevronRight, Flame } from 'lucide-react';

export default function ScanScreen() {
  const { toggleMenu } = useMenu();
  const { identity } = useInternetIdentity();
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ReturnType<typeof analyzeText> | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    if (!inputText.trim()) return;
    setScanning(true);
    await new Promise(r => setTimeout(r, 800));
    const analysis = analyzeText(inputText, 'balanced');
    setResult(analysis);
    setScanning(false);
  };

  const getRiskColor = (level: string) => {
    if (level === 'critical' || level === 'high') return 'text-blood-red';
    if (level === 'medium') return 'text-ember-orange';
    return 'text-stone-400';
  };

  return (
    <div className="relative min-h-screen bg-void">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
          alt=""
          className="absolute bottom-8 right-8 w-48 h-48 object-contain opacity-5"
          draggable={false}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'url(/assets/generated/dragon-scale-texture.dim_512x512.png)',
            backgroundSize: '256px 256px',
          }}
        />
      </div>

      <div className="relative z-10 pt-16 px-4 pb-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ScanLine className="text-blood-red" size={28} />
            <h1 className="font-cinzel text-blood-red text-2xl font-bold tracking-widest">
              THREAT SCANNER
            </h1>
          </div>
          <p className="text-stone-500 font-mono text-sm tracking-wider">
            THE DRAGON DETECTS ALL DECEPTION
          </p>
        </div>

        {/* Input */}
        <div className="bg-stone-900/80 border border-stone-700 rounded-sm p-4 mb-4">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste the message you want to scan for threats..."
            rows={6}
            className="w-full bg-transparent text-stone-200 placeholder-stone-600 font-mono text-sm resize-none outline-none"
          />
        </div>

        <button
          onClick={handleScan}
          disabled={scanning || !inputText.trim()}
          className="w-full py-3 bg-blood-red/20 border border-blood-red/60 text-blood-red font-cinzel font-bold tracking-widest hover:bg-blood-red/30 transition-all duration-200 disabled:opacity-40 rounded-sm flex items-center justify-center gap-2"
        >
          {scanning ? (
            <>
              <div className="w-4 h-4 border-2 border-blood-red/60 border-t-blood-red rounded-full animate-spin" />
              SCANNING...
            </>
          ) : (
            <>
              <ScanLine size={18} />
              SCAN FOR THREATS
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Risk Level */}
            <div className="bg-stone-900/80 border border-stone-700 rounded-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-cinzel text-stone-400 text-sm tracking-wider">RISK LEVEL</span>
                <span className={`font-cinzel font-bold text-lg tracking-wider ${getRiskColor(result.riskLevel)}`}>
                  {result.riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blood-red transition-all duration-500"
                  style={{ width: `${Math.min(result.riskScore * 10, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-stone-600 text-xs font-mono">0</span>
                <span className="text-stone-600 text-xs font-mono">SCORE: {result.riskScore}/10</span>
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="bg-stone-900/80 border border-stone-700 rounded-sm p-4">
                <h3 className="font-cinzel text-stone-400 text-sm tracking-wider mb-2">ANALYSIS</h3>
                <p className="text-stone-300 font-mono text-sm leading-relaxed">{result.summary}</p>
              </div>
            )}

            {/* Patterns */}
            {result.patterns && result.patterns.length > 0 && (
              <div className="bg-stone-900/80 border border-stone-700 rounded-sm p-4">
                <h3 className="font-cinzel text-stone-400 text-sm tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-blood-red" />
                  DETECTED THREATS
                </h3>
                <div className="space-y-2">
                  {result.patterns.map((pattern: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm font-mono">
                      <ChevronRight size={14} className="text-blood-red mt-0.5 flex-shrink-0" />
                      <span className="text-stone-300">{typeof pattern === 'string' ? pattern : pattern.description || pattern.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.riskLevel === 'low' && (
              <div className="bg-stone-900/80 border border-stone-700 rounded-sm p-4 flex items-center gap-3">
                <Shield size={20} className="text-stone-400" />
                <p className="text-stone-400 font-mono text-sm">No significant threats detected. Stay vigilant.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
