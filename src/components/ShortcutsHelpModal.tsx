import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { KeyboardShortcut } from '../types';

interface ShortcutsHelpModalProps {
  onClose: () => void;
}

export const SHORTCUTS_REGISTRY: KeyboardShortcut[] = [
  { key: 'Space', label: 'Play / Pause', description: 'Toggle playback of the score audio', category: 'Playback' },
  { key: '[ / ]', label: 'Tempo Down / Up', description: 'Decrease or increase tempo by 4 BPM', category: 'Playback' },
  { key: '← / →', label: 'Step Cursor', description: 'Step score playback cursor backwards or forwards', category: 'Navigation' },
  { key: '1', label: 'Focus Input', description: 'Activate and highlight the MusicXML editor pane', category: 'View' },
  { key: '2', label: 'Focus Preview', description: 'Activate and highlight the score sheet preview pane', category: 'View' },
  { key: 'F', label: 'Expand / Restore', description: 'Toggle fullscreen expansion of the currently active pane', category: 'View' },
  { key: '⌘ / Ctrl + N', label: 'New Document', description: 'Create a new blank or templated score with custom meter and key', category: 'Editor' },
  { key: '⌘ / Ctrl + K', label: 'Key Signature', description: 'Set or change key signature and Arabic quarter-tone accidentals', category: 'Editor' },
  { key: '⌘ / Ctrl + Enter', label: 'Force Re-render', description: 'Re-parse MusicXML and redraw the score canvas', category: 'Editor' },
  { key: '⌘ / Ctrl + O', label: 'Open File', description: 'Open local .musicxml, .xml, or .mxl archive', category: 'Editor' },
  { key: '⌘ / Ctrl + S', label: 'Export Menu', description: 'Open export modal for sheet music, WAV, or MIDI', category: 'Editor' },
  { key: '?', label: 'Shortcuts Help', description: 'Display this keyboard shortcuts reference sheet', category: 'View' },
];

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ onClose }) => {
  const categories = ['Playback', 'Navigation', 'Editor', 'View'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                Studio Keyboard Shortcuts
                <span className="arabic-text text-amber-300 font-normal text-sm" dir="rtl">
                  اختصارات لوحة المفاتيح
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Master the editor workflow with high-velocity key bindings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list grouped by category */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {categories.map((cat) => {
            const items = SHORTCUTS_REGISTRY.filter((s) => s.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                  {cat}
                </h3>
                <div className="bg-neutral-950/60 rounded-lg border border-neutral-800/80 divide-y divide-neutral-800/60">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3.5 py-2.5 text-xs">
                      <div>
                        <div className="font-medium text-neutral-200">{item.label}</div>
                        <div className="text-[11px] text-neutral-400">{item.description}</div>
                      </div>
                      <kbd className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 font-mono text-[11px] text-amber-300 font-semibold shadow-inner">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 text-xs text-neutral-400">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-neutral-300">Esc</kbd> anytime to close dialogs</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
