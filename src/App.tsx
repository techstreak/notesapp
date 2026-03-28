/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Bold, 
  Italic, 
  List, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  CheckCircle2, 
  Plus,
  Trash2,
  Search,
  Maximize2,
  Minimize2,
  Clock
} from 'lucide-react';
import { Note, View } from './types';

const STORAGE_KEY = 'sanctuary_notes_data_v2';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notes', e);
      }
    }
    setIsAuthReady(true);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (isAuthReady) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isAuthReady]);

  const currentNote = notes.find(n => n.id === currentNoteId);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      tags: ['DRAFT'],
      lastSaved: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setCurrentNoteId(newNote.id);
    setView('edit');
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, lastSaved: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (currentNoteId === id) {
      setCurrentNoteId(null);
      setView('list');
    }
  };

  const handleBackToList = () => {
    // Cleanup: Remove current note if it's empty (no title and no content)
    if (currentNoteId) {
      const note = notes.find(n => n.id === currentNoteId);
      if (note && !note.title.trim() && !note.content.trim()) {
        setNotes(prev => prev.filter(n => n.id !== currentNoteId));
      }
    }
    setCurrentNoteId(null);
    setView('list');
    setIsFocusMode(false);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container/30 transition-colors duration-700">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-5xl mx-auto px-8 pt-24 pb-32"
          >
            <header className="flex flex-col gap-12 mb-20">
              <div className="flex items-center justify-between">
                <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface">Sanctuary</h1>
                <button
                  onClick={createNote}
                  className="group relative bg-primary hover:bg-primary/90 text-white p-5 rounded-full shadow-2xl shadow-primary/30 transition-all active:scale-95"
                >
                  <Plus size={28} />
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest font-bold">
                    New Thought
                  </span>
                </button>
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
                <input
                  type="text"
                  placeholder="Search your sanctuary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
                />
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredNotes.length === 0 ? (
                <div className="col-span-full text-center py-32 opacity-20">
                  <p className="text-2xl font-light italic tracking-tight">
                    {searchQuery ? 'No matches found in your thoughts.' : 'Your sanctuary is waiting for a spark.'}
                  </p>
                </div>
              ) : (
                filteredNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setCurrentNoteId(note.id);
                      setView('edit');
                    }}
                    className="group relative bg-surface-container-low hover:bg-surface-container-lowest p-10 rounded-[2rem] cursor-pointer transition-all duration-700 hover:ambient-shadow border border-transparent hover:border-outline-variant"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors duration-500">
                        {note.title || 'Untitled Thought'}
                      </h2>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-20 hover:!opacity-100 transition-opacity p-2 text-on-surface"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-on-surface-variant/70 line-clamp-3 font-light leading-relaxed mb-8 text-lg">
                      {note.content || 'A silent reflection...'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {getTimeAgo(note.lastSaved)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {note.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-surface-dim/10 text-on-surface-variant/60 text-[9px] rounded-full font-black uppercase tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Header */}
            <AnimatePresence>
              {!isFocusMode && (
                <motion.header 
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  exit={{ y: -100 }}
                  className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl pt-6 h-24"
                >
                  <div className="flex items-center justify-between w-full px-8 max-w-7xl mx-auto">
                    <button 
                      onClick={handleBackToList}
                      className="group flex items-center gap-3 p-2 -ml-2 hover:bg-surface-container-low transition-all duration-500 rounded-xl"
                    >
                      <ArrowLeft className="text-primary group-hover:-translate-x-1 transition-transform" size={20} />
                      <span className="text-lg font-bold tracking-tight text-on-surface">Sanctuary</span>
                    </button>
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-widest">Last Sync</span>
                        <span className="text-on-surface-variant/60 text-xs font-medium">
                          {getTimeAgo(currentNote?.lastSaved || Date.now())}
                        </span>
                      </div>
                      <button 
                        onClick={handleBackToList}
                        className="bg-primary hover:bg-primary-dim text-white px-10 py-3 rounded-full font-bold text-sm transition-all active:scale-95 shadow-2xl shadow-primary/20"
                      >
                        Save Thought
                      </button>
                      <button 
                        onClick={() => setIsFocusMode(true)}
                        className="p-3 hover:bg-surface-container-low rounded-full text-on-surface-variant/60 transition-colors"
                        title="Focus Mode"
                      >
                        <Maximize2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.header>
              )}
            </AnimatePresence>

            {/* Focus Mode Exit Button */}
            <AnimatePresence>
              {isFocusMode && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFocusMode(false)}
                  className="fixed top-8 right-8 z-[60] p-4 bg-surface-container-lowest/50 backdrop-blur hover:bg-surface-container-lowest rounded-full text-on-surface-variant/40 hover:text-primary transition-all duration-500 ambient-shadow"
                >
                  <Minimize2 size={24} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={`min-h-screen transition-all duration-1000 ${isFocusMode ? 'pt-24' : 'pt-40'} pb-40 max-w-4xl mx-auto px-8 md:px-24`}>
              <article className="space-y-16">
                {/* Title Input */}
                <div className="relative group">
                  <input
                    autoFocus
                    value={currentNote?.title || ''}
                    onChange={(e) => updateNote(currentNote!.id, { title: e.target.value })}
                    className="w-full bg-transparent border-none p-0 text-6xl font-black tracking-tighter text-on-surface placeholder:text-surface-dim focus:ring-0 transition-all duration-700"
                    placeholder="Note Title"
                    type="text"
                  />
                  <motion.div 
                    layoutId="underline"
                    className="absolute -bottom-6 left-0 w-24 h-1 bg-primary rounded-full"
                  />
                </div>

                {/* Content Area */}
                <div className="relative min-h-[600px]">
                  <textarea
                    value={currentNote?.content || ''}
                    onChange={(e) => updateNote(currentNote!.id, { content: e.target.value })}
                    className="w-full bg-transparent border-none p-0 text-xl leading-[1.8] text-on-surface/80 placeholder:text-surface-dim focus:ring-0 min-h-[600px] resize-none no-scrollbar font-light"
                    placeholder="Start writing your masterpiece..."
                  />
                </div>

                {/* Optional Attachment Image */}
                {currentNote?.attachmentUrl && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                  >
                    <div className="aspect-[16/7] w-full rounded-[2.5rem] overflow-hidden bg-surface-container-low group ambient-shadow">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                        src={currentNote.attachmentUrl} 
                        alt="Attachment"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-6 flex items-center justify-between px-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/40 font-black">
                        Visual Context: Workspace_Inspiration.jpg
                      </p>
                      <button 
                        onClick={() => updateNote(currentNote!.id, { attachmentUrl: undefined })}
                        className="text-[10px] uppercase tracking-widest text-error/40 hover:text-error font-bold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                )}
              </article>
            </main>

            {/* Sidebar Metadata (Desktop Only) */}
            <AnimatePresence>
              {!isFocusMode && (
                <motion.aside 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="fixed right-16 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-12 opacity-20 hover:opacity-100 transition-all duration-700"
                >
                  <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black">Characters</span>
                    <span className="text-4xl font-extralight tracking-tighter text-on-surface">
                      {(currentNote?.content || '').length.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black">Read Time</span>
                    <span className="text-4xl font-extralight tracking-tighter text-on-surface">
                      {calculateReadTime(currentNote?.content || '')}m
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black">Tags</span>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {currentNote?.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-primary/5 text-primary text-[9px] rounded-full font-black uppercase tracking-widest border border-primary/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Floating Formatting Bar */}
            <nav className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-50 transition-all duration-1000 ${isFocusMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
              <div className="flex items-center gap-3 p-3 glass rounded-[2rem] ambient-shadow">
                <div className="flex items-center gap-1">
                  <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-on-surface/40 hover:text-primary hover:bg-primary/5 transition-all duration-300">
                    <Bold size={20} />
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-on-surface/40 hover:text-primary hover:bg-primary/5 transition-all duration-300">
                    <Italic size={20} />
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-on-surface/40 hover:text-primary hover:bg-primary/5 transition-all duration-300">
                    <List size={20} />
                  </button>
                </div>
                <div className="w-px h-8 bg-on-surface/5 mx-1" />
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      if (currentNote) {
                        updateNote(currentNote.id, { 
                          attachmentUrl: 'https://picsum.photos/seed/workspace/1600/700' 
                        });
                      }
                    }}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl text-on-surface/40 hover:text-primary hover:bg-primary/5 transition-all duration-300"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-on-surface/40 hover:text-primary hover:bg-primary/5 transition-all duration-300">
                    <LinkIcon size={20} />
                  </button>
                </div>
                <div className="w-px h-8 bg-on-surface/5 mx-1" />
                <button 
                  onClick={handleBackToList}
                  className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dim transition-all duration-500 active:scale-90"
                >
                  <CheckCircle2 size={24} />
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
