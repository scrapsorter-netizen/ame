import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface PaneCardProps {
  id: 'input' | 'preview';
  title: string;
  arabicTitle?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  isExpanded: boolean;
  isActive: boolean;
  isHidden?: boolean;
  onToggleExpand: () => void;
  onFocus: () => void;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PaneCard: React.FC<PaneCardProps> = ({
  title,
  arabicTitle,
  subtitle,
  icon,
  isExpanded,
  isActive,
  isHidden = false,
  onToggleExpand,
  onFocus,
  headerActions,
  children,
  footer,
}) => {
  if (isHidden) return null;

  return (
    <motion.div
      layout
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={onFocus}
      className={`relative flex flex-col rounded-xl overflow-hidden border transition-shadow duration-200 ${
        isExpanded
          ? 'fixed inset-3 z-40 bg-neutral-900/98 border-neutral-700 shadow-2xl backdrop-blur-xl'
          : 'h-[calc(100vh-148px)] min-h-[520px] bg-neutral-900/90 backdrop-blur-sm'
      } ${
        isActive
          ? 'border-neutral-700 ring-1 ring-amber-500/30 shadow-lg shadow-black/40'
          : 'border-neutral-800/80 hover:border-neutral-700/80'
      }`}
    >
      {/* Pane Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-neutral-950/60 shrink-0 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-amber-400 shrink-0">{icon}</span>}
          <div className="flex items-baseline gap-2 truncate">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-100 whitespace-nowrap">
              {title}
            </h2>
            {arabicTitle && (
              <span className="arabic-text text-xs text-amber-300/80 font-medium" dir="rtl">
                {arabicTitle}
              </span>
            )}
            {subtitle && (
              <span className="hidden sm:inline text-xs text-neutral-400 truncate">
                · {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right header actions + expand toggle */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {headerActions}

          <button
            type="button"
            onClick={onToggleExpand}
            title={isExpanded ? 'Restore View (F)' : 'Expand Fullscreen (F)'}
            aria-label={isExpanded ? 'Restore view' : 'Expand fullscreen'}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Pane Body */}
      <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </div>

      {/* Optional Pane Footer */}
      {footer && (
        <div className="border-t border-neutral-800/80 bg-neutral-950/60 px-4 py-2 shrink-0">
          {footer}
        </div>
      )}
    </motion.div>
  );
};
