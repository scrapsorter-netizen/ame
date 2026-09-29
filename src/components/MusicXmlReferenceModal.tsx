import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  FileCode, 
  Tag, 
  ArrowRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  MUSIC_XML_REFERENCE, 
  MUSIC_XML_CATEGORIES, 
  MusicXmlTagDoc 
} from '../lib/musicXmlReference';

interface MusicXmlReferenceModalProps {
  onClose: () => void;
  onInsertSnippet: (snippet: string) => void;
}

export const MusicXmlReferenceModal: React.FC<MusicXmlReferenceModalProps> = ({
  onClose,
  onInsertSnippet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTagId, setSelectedTagId] = useState<string>(MUSIC_XML_REFERENCE[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  // Filter tags based on query and category
  const filteredTags = useMemo(() => {
    return MUSIC_XML_REFERENCE.filter((doc) => {
      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        doc.tag.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        (doc.arabicTip && doc.arabicTip.toLowerCase().includes(q)) ||
        doc.attributes.some((attr) => attr.name.toLowerCase().includes(q) || attr.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeDoc = useMemo(() => {
    return filteredTags.find((d) => d.id === selectedTagId) || filteredTags[0] || MUSIC_XML_REFERENCE[0];
  }, [filteredTags, selectedTagId]);

  const handleCopy = (doc: MusicXmlTagDoc) => {
    navigator.clipboard.writeText(doc.example);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleInsert = (doc: MusicXmlTagDoc) => {
    onInsertSnippet(doc.example);
    setInsertedId(doc.id);
    setTimeout(() => setInsertedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                MusicXML Tags &amp; Attributes Reference
                <span className="arabic-text text-amber-300 font-normal text-sm" dir="rtl">
                  دليل وسوم وخصائص ميوزيك إكس إم إل
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Official syntax, parent-child structures, and Arabic quarter-tone notation rules
              </p>
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

        {/* Search & Categories Bar */}
        <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-950/40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags, attributes (e.g. alter, slash-flat, clef, slur)..."
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips / Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {MUSIC_XML_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap font-medium ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Workspace */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Tag List Sidebar */}
          <div className="w-full md:w-80 border-r border-neutral-800 bg-neutral-950/30 overflow-y-auto p-3 space-y-1 shrink-0">
            {filteredTags.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500">
                No tags match "{searchQuery}"
              </div>
            ) : (
              filteredTags.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedTagId(doc.id)}
                    className={`w-full flex flex-col p-2.5 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-neutral-800/90 border border-amber-500/70 text-neutral-100 shadow-sm'
                        : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {doc.tag}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {doc.category.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5 font-sans">
                      {doc.summary}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Detailed Tag View & Code Inspector */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-neutral-900/60">
            {activeDoc && (
              <>
                {/* Tag Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-mono text-xl font-bold text-amber-300">
                        {activeDoc.tag}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {activeDoc.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                      {activeDoc.summary}
                    </p>
                  </div>

                  {/* Actions: Copy & Insert */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(activeDoc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors"
                      title="Copy snippet to clipboard"
                    >
                      {copiedId === activeDoc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      <span>{copiedId === activeDoc.id ? 'Copied!' : 'Copy XML'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInsert(activeDoc)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-all shadow-sm shadow-amber-500/20 active:scale-95"
                      title="Insert code directly into active score editor"
                    >
                      {insertedId === activeDoc.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>{insertedId === activeDoc.id ? 'Inserted!' : 'Insert to Score'}</span>
                    </button>
                  </div>
                </div>

                {/* Arabic / Violin Specific Tip Banner */}
                {activeDoc.arabicTip && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">Arabic &amp; Violin Practice Note:</strong>{' '}
                      <span>{activeDoc.arabicTip}</span>
                    </div>
                  </div>
                )}

                {/* Structure / Hierarchy Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      Parent Element:
                    </span>
                    <span className="font-mono text-neutral-200">{activeDoc.parent}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      Children or Value Type:
                    </span>
                    <span className="font-mono text-neutral-200 break-words">
                      {activeDoc.childrenOrValue}
                    </span>
                  </div>
                </div>

                {/* Common Attributes Table */}
                {activeDoc.attributes && activeDoc.attributes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                      Key Attributes
                    </h4>
                    <div className="rounded-lg border border-neutral-800 overflow-hidden bg-neutral-950 text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-800 text-[11px] text-neutral-400 bg-neutral-900/60">
                            <th className="py-2 px-3 font-semibold">Attribute</th>
                            <th className="py-2 px-3 font-semibold">Type / Allowed Values</th>
                            <th className="py-2 px-3 font-semibold">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60 font-mono">
                          {activeDoc.attributes.map((attr, aIdx) => (
                            <tr key={aIdx} className="hover:bg-neutral-900/40">
                              <td className="py-2 px-3 text-amber-300 font-semibold">
                                {attr.name}
                              </td>
                              <td className="py-2 px-3 text-neutral-400 text-[11px]">
                                {attr.type}
                              </td>
                              <td className="py-2 px-3 text-neutral-300 font-sans text-xs">
                                {attr.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Code Example Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Standard Code Example
                    </h4>
                    <span className="text-[11px] text-neutral-500 font-mono">XML 3.1 / 4.0</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-amber-200/90 overflow-x-auto selection:bg-amber-500/40 selection:text-white leading-relaxed">
                    <code>{activeDoc.example}</code>
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-950/70 text-xs text-neutral-400 shrink-0">
          <span>
            Showing <strong className="text-neutral-200">{filteredTags.length}</strong> of{' '}
            {MUSIC_XML_REFERENCE.length} MusicXML tags
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors text-xs font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
