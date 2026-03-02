import React, { useState } from 'react';
import { useMenu } from '../contexts/MenuContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Brain, Flame, ChevronRight, Lock } from 'lucide-react';

const DRAGONFLIES_TIPS = [
  { title: 'D – Detach', body: 'Step back from the emotional charge. Observe the situation as the Dragon observes from above — with clarity, not reaction.' },
  { title: 'R – Recognize', body: 'Name the pattern. Financial pressure? Urgency manipulation? Coercion? Naming it strips its power.' },
  { title: 'A – Assess', body: 'What is the actual risk? Separate the real threat from the manufactured fear.' },
  { title: 'G – Ground', body: 'Return to your body. Breathe. The Dragon does not act from panic — it acts from power.' },
  { title: 'O – Options', body: 'List your choices. You always have more than one. The cage is often unlocked.' },
  { title: 'N – Navigate', body: 'Choose the path that serves your long-term sovereignty, not short-term relief.' },
  { title: 'F – Fortify', body: 'Strengthen your boundaries. Document everything. The Dragon leaves no evidence trail for others to exploit.' },
  { title: 'L – Learn', body: 'Extract the lesson. Every gut punch is data. Use it to evolve your armor.' },
  { title: 'I – Integrate', body: 'Absorb the experience into your identity. You are not the victim — you are the forge.' },
  { title: 'E – Emerge', body: 'Rise from the encounter stronger. The Dragon is not broken by fire — it is made of it.' },
  { title: 'S – Sovereign', body: 'Reclaim your autonomy. Your decisions, your timeline, your terms. Always.' },
];

export default function ConsultantScreen() {
  const { toggleMenu } = useMenu();
  const { identity } = useInternetIdentity();
  const [activeStep, setActiveStep] = useState<number | null>(null);

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
            <Brain className="text-blood-red" size={28} />
            <h1 className="font-cinzel text-blood-red text-2xl font-bold tracking-widest">
              CONSULTANT
            </h1>
          </div>
          <p className="text-stone-500 font-mono text-sm tracking-wider">
            DRAGONFLIES PROTOCOL · RESOLUTION FRAMEWORK
          </p>
        </div>

        {!identity ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Lock size={40} className="text-stone-600 mb-4" />
            <p className="text-stone-500 font-mono text-sm">LOGIN TO ACCESS DRAGON WISDOM</p>
          </div>
        ) : (
          <>
            {/* Intro */}
            <div className="bg-stone-900/80 border border-blood-red/30 rounded-sm p-5 mb-6">
              <div className="flex items-start gap-3">
                <Flame size={20} className="text-ember-orange mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="font-cinzel text-stone-200 font-bold tracking-wider mb-2">
                    THE DRAGONFLIES PROTOCOL
                  </h2>
                  <p className="text-stone-400 font-mono text-sm leading-relaxed">
                    Eleven steps to transform emotional gut punches into sovereign power. 
                    Each letter is a weapon. Master them all.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {DRAGONFLIES_TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="bg-stone-900/80 border border-stone-700 rounded-sm overflow-hidden"
                >
                  <button
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-stone-800/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-sm bg-blood-red/20 border border-blood-red/40 flex items-center justify-center flex-shrink-0">
                      <span className="font-cinzel text-blood-red font-bold text-sm">
                        {tip.title[0]}
                      </span>
                    </div>
                    <span className="font-cinzel text-stone-200 text-sm tracking-wider flex-1">
                      {tip.title}
                    </span>
                    <ChevronRight
                      size={16}
                      className={`text-stone-600 transition-transform duration-200 ${
                        activeStep === i ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {activeStep === i && (
                    <div className="px-4 pb-4 pt-1 border-t border-stone-800">
                      <p className="text-stone-400 font-mono text-sm leading-relaxed">
                        {tip.body}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
