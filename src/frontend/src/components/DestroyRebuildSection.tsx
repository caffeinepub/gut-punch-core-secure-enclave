import { Flame, Music, RotateCcw, Wind, Zap } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import SonicSignatureModule from "./SonicSignatureModule";
import SymbicortCheckModal from "./SymbicortCheckModal";

export default function DestroyRebuildSection() {
  const { sanctuaryMode } = useApp();
  const [breathConfirmed, setBreathConfirmed] = useState(false);

  const isInnerForge = sanctuaryMode === "INNER_FORGE";

  return (
    <div className="relative min-h-screen bg-void">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/gargoyle-dragon-hero.dim_1920x1080.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void/90 to-void" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(/assets/generated/void-metal-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      {/* Symbicort Check — blocks access until confirmed */}
      <SymbicortCheckModal onConfirmed={() => setBreathConfirmed(true)} />

      <div className="relative z-10 pt-8 px-4 pb-12 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Flame className="text-blood-red" size={28} />
            <h1 className="font-cinzel text-blood-red text-2xl font-bold tracking-widest">
              DESTROY & REBUILD
            </h1>
            <Flame className="text-blood-red" size={28} />
          </div>
          <p className="text-stone-500 font-mono text-sm tracking-wider">
            SOVEREIGN AUDIO WORK · FOREVERRAW FORGE
          </p>

          {/* Inner Forge mode indicator */}
          {isInnerForge && (
            <div
              className="inline-flex items-center gap-2 mt-2 px-3 py-1"
              style={{
                background: "oklch(0.55 0.22 300 / 0.08)",
                border: "1px solid oklch(0.55 0.22 300 / 0.3)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "oklch(0.55 0.22 300)" }}
              />
              <span
                className="font-mono text-xs tracking-widest"
                style={{ color: "oklch(0.55 0.22 300)" }}
              >
                INNER FORGE · SILENT MODE ACTIVE
              </span>
            </div>
          )}

          {breathConfirmed && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Wind size={14} className="text-ember-orange" />
              <span className="text-ember-orange font-mono text-xs">
                BREATH SECURED · READY TO FORGE
              </span>
            </div>
          )}
        </div>

        {/* Content — only fully interactive after breath confirmed */}
        <div
          className={`space-y-6 transition-opacity duration-500 ${breathConfirmed ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        >
          {/* Sovereign Declaration */}
          <div
            className="p-5"
            style={{
              border: "1px solid oklch(0.38 0.18 25 / 0.4)",
              background: "oklch(0.09 0.006 270)",
              boxShadow: "0 0 20px oklch(0.38 0.18 25 / 0.1)",
            }}
          >
            <div className="flex items-start gap-3">
              <Zap
                size={18}
                className="text-ember-orange mt-0.5 flex-shrink-0"
              />
              <div>
                <h2 className="font-cinzel text-stone-200 font-bold tracking-wider mb-2 text-sm">
                  THE FORGE PROTOCOL
                </h2>
                <p className="text-stone-400 font-mono text-sm leading-relaxed">
                  This is your sovereign audio workspace. Destroy the patterns
                  that no longer serve you. Rebuild from the forge. No filters.
                  No nannies. Pure resolution.
                </p>
                {isInnerForge && (
                  <p
                    className="font-mono text-xs mt-2"
                    style={{ color: "oklch(0.55 0.22 300)" }}
                  >
                    ◆ ANXIETY TOOLS ACTIVE · SILENT MODE — no alerts, no
                    auto-audio
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sonic Signature Module — silent mode in Inner Forge */}
          <SonicSignatureModule silentMode={isInnerForge} />

          {/* Audio Work Area */}
          <div
            className="p-5"
            style={{
              border: "1px solid oklch(0.22 0.01 270)",
              background: "oklch(0.09 0.006 270)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Music size={18} className="text-stone-400" />
              <h3 className="font-cinzel text-stone-300 text-sm font-bold tracking-wider">
                AUDIO WORK SESSION
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  phase: "DESTROY",
                  desc: "Release the old patterns. Let the metal strip them away.",
                  color: "text-blood-red",
                  borderColor: "oklch(0.38 0.18 25 / 0.3)",
                },
                {
                  phase: "PROCESS",
                  desc: "Sit in the fire. Feel the transformation happening.",
                  color: "text-ember-orange",
                  borderColor: "oklch(0.62 0.18 45 / 0.3)",
                },
                {
                  phase: "REBUILD",
                  desc: "Forge the new identity. Stronger. Sovereign. Unbreakable.",
                  color: "text-stone-300",
                  borderColor: "oklch(0.22 0.01 270)",
                },
              ].map(({ phase, desc, color, borderColor }) => (
                <div
                  key={phase}
                  className="p-3"
                  style={{
                    border: `1px solid ${borderColor}`,
                    background: "oklch(0.08 0.005 270)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <RotateCcw size={12} className={color} />
                    <span
                      className={`font-cinzel text-xs font-bold tracking-widest ${color}`}
                    >
                      {phase}
                    </span>
                  </div>
                  <p className="text-stone-500 font-mono text-xs leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Journaling prompt — no audio, no alerts */}
          <div
            className="p-5"
            style={{
              border: "1px solid oklch(0.16 0.008 270)",
              background: "oklch(0.08 0.005 270)",
            }}
          >
            <h3 className="font-cinzel text-stone-400 text-xs font-bold tracking-wider mb-3">
              POST-SESSION REFLECTION
            </h3>
            <textarea
              placeholder="What did you destroy today? What are you rebuilding?..."
              rows={4}
              className="w-full bg-transparent text-stone-300 placeholder-stone-700 font-mono text-sm resize-none outline-none border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
