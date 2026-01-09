import React, { useState } from 'react';
import { Plus, Trash2, Book, User, MapPin, Hash } from 'lucide-react';
import { GlossaryItem } from '../types';

interface GlossaryManagerProps {
  items: GlossaryItem[];
  onUpdate: (items: GlossaryItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const GlossaryManager: React.FC<GlossaryManagerProps> = ({ items, onUpdate, isOpen, onClose }) => {
  const [newItem, setNewItem] = useState<Partial<GlossaryItem>>({ type: 'term', term: '', translation: '' });

  const handleAdd = () => {
    if (!newItem.term || !newItem.translation) return;
    const item: GlossaryItem = {
      id: Date.now().toString(),
      term: newItem.term,
      translation: newItem.translation,
      type: newItem.type as any,
    };
    onUpdate([...items, item]);
    setNewItem({ type: 'term', term: '', translation: '' });
  };

  const handleDelete = (id: string) => {
    onUpdate(items.filter((i) => i.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'name': return <User size={14} className="text-blue-400" />;
      case 'location': return <MapPin size={14} className="text-green-400" />;
      case 'pronoun': return <Hash size={14} className="text-purple-400" />;
      default: return <Book size={14} className="text-gray-400" />;
    }
  };

  const getPlaceholders = (type: string) => {
    switch(type) {
        case 'pronoun': return { term: 'e.g. I (Empress)', translation: 'e.g. We / This Seat' };
        case 'name': return { term: 'e.g. Wei Wuxian', translation: 'e.g. Wei Ying' };
        case 'location': return { term: 'e.g. Cloud Recesses', translation: 'e.g. Cloud Recesses' };
        default: return { term: 'e.g. Qi', translation: 'e.g. Spiritual Energy' };
    }
  };

  const placeholders = getPlaceholders(newItem.type || 'term');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-gray-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Book className="text-primary" /> Glossary & Pronoun Mapping
            </h2>
            <p className="text-sm text-gray-400 mt-1">Define specific rules for the AI to follow.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Input Row */}
          <div className="grid grid-cols-12 gap-2 items-end bg-slate-900/50 p-4 rounded-lg border border-gray-700">
            <div className="col-span-3">
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select
                className="w-full bg-surface text-white text-sm border border-gray-600 rounded px-2 py-2 focus:ring-1 focus:ring-primary outline-none"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
              >
                <option value="term">Term</option>
                <option value="name">Name</option>
                <option value="pronoun">Pronoun</option>
                <option value="location">Location</option>
              </select>
            </div>
            <div className="col-span-4">
              <label className="text-xs text-gray-500 mb-1 block">Original Term</label>
              <input
                type="text"
                className="w-full bg-surface text-white text-sm border border-gray-600 rounded px-3 py-2 focus:ring-1 focus:ring-primary outline-none"
                placeholder={placeholders.term}
                value={newItem.term}
                onChange={(e) => setNewItem({ ...newItem, term: e.target.value })}
              />
            </div>
            <div className="col-span-4">
              <label className="text-xs text-gray-500 mb-1 block">Target Translation</label>
              <input
                type="text"
                className="w-full bg-surface text-white text-sm border border-gray-600 rounded px-3 py-2 focus:ring-1 focus:ring-primary outline-none"
                placeholder={placeholders.translation}
                value={newItem.translation}
                onChange={(e) => setNewItem({ ...newItem, translation: e.target.value })}
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <button
                onClick={handleAdd}
                className="bg-primary hover:bg-indigo-600 text-white p-2 rounded-md transition-colors"
                title="Add Rule"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {items.length === 0 && (
              <div className="text-center text-gray-500 py-8 italic">No glossary rules defined yet.</div>
            )}
            {items.map((item) => (
              <div key={item.id} className="flex items-center bg-surface border border-gray-700/50 p-3 rounded-md group hover:border-gray-600 transition-all">
                <div className="w-8 flex justify-center" title={item.type}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4 px-4 text-sm">
                  <span className="text-gray-300 font-medium">{item.term}</span>
                  <span className="text-primary">{item.translation}</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-slate-900/50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-surface hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlossaryManager;