import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// Env configuration (use .env in real projects, direct inject for KAVIA context)
const SUPABASE_URL = 'https://qgmcdylmdodofjpuuklq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWNkeWxtZG9kb2ZqcHV1a2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNjkzMzAsImV4cCI6MjA2Njc0NTMzMH0.Q3dbZtBZOZXwPL73kF1TR-asuum7vAcBMqbo-ihaN7k';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COLORS = {
  accent: "#ff4081",
  primary: "#1976d2",
  secondary: "#424242"
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// PUBLIC_INTERFACE
function App() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load notes from Supabase
  useEffect(() => {
    fetchNotes();
    // Listen to realtime changes (optional)
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Search filter logic
    setFilteredNotes(
      notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          (n.body && n.body.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [notes, search]);

  // PUBLIC_INTERFACE
  async function fetchNotes() {
    setLoading(true);
    setError('');
    let { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) setError('Failed to load notes');
    else setNotes(data || []);
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  function handleSelectNote(note) {
    setCurrentNote(note);
    setTitle(note.title);
    setBody(note.body || '');
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleNewNote() {
    setCurrentNote(null);
    setTitle('');
    setBody('');
    setIsEditing(true);
  }

  // PUBLIC_INTERFACE
  function handleEditNote() {
    setIsEditing(true);
  }

  // PUBLIC_INTERFACE
  async function handleSaveNote(e) {
    e && e.preventDefault();
    setSaving(true);
    setError('');
    let result;
    if (currentNote) {
      // Update
      const { data, error } = await supabase
        .from('notes')
        .update({ title, body, updated_at: new Date().toISOString() })
        .eq('id', currentNote.id)
        .select();
      if (error) setError('Failed to save changes');
      else {
        setNotes((prev) =>
          prev.map((n) => (n.id === currentNote.id ? data[0] : n))
        );
        setCurrentNote(data[0]);
        setIsEditing(false);
      }
      result = { data, error };
    } else {
      // Create
      const created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title, body, created_at, updated_at: created_at }])
        .select();
      if (error) setError('Failed to create note');
      else {
        setNotes((prev) => [data[0], ...prev]);
        setCurrentNote(data[0]);
        setIsEditing(false);
      }
      result = { data, error };
    }
    setSaving(false);
    return result;
  }

  // PUBLIC_INTERFACE
  async function handleDeleteNote() {
    if (!currentNote) return;
    setError('');
    const { error } = await supabase.from('notes').delete().eq('id', currentNote.id);
    if (error) setError('Failed to delete note');
    else {
      setNotes(notes.filter((n) => n.id !== currentNote.id));
      setCurrentNote(null);
      setTitle('');
      setBody('');
      setIsEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  // Minimalistic theme applied via CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', COLORS.accent);
    document.documentElement.style.setProperty('--primary', COLORS.primary);
    document.documentElement.style.setProperty('--secondary', COLORS.secondary);
    document.body.style.backgroundColor = "#fafbfe";
  }, []);

  // PUBLIC_INTERFACE
  function NoteList() {
    if (loading) return <div className="note-list-loading">Loading...</div>;
    return (
      <div className="note-list">
        <div className="note-list-header">
          <input
            type="text"
            className="search-input"
            placeholder="Search notes..."
            value={search}
            onChange={handleSearchChange}
          />
          <button
            className="new-note-btn"
            title="Create new note"
            onClick={handleNewNote}
          >
            ＋
          </button>
        </div>
        <ul>
          {filteredNotes.length === 0 && !loading ? (
            <li className="note-list-empty">No notes</li>
          ) : (
            filteredNotes.map((note) => (
              <li
                key={note.id}
                className={classNames(
                  'note-list-item',
                  currentNote && note.id === currentNote.id && 'active'
                )}
                onClick={() => handleSelectNote(note)}
              >
                <div className="note-list-title">{note.title || <em>Untitled</em>}</div>
                <div className="note-list-date">
                  {note.updated_at
                    ? new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : ''}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function NoteEditor() {
    return (
      <form className="note-editor" onSubmit={handleSaveNote}>
        <input
          required
          className="note-title-input"
          placeholder="Note title"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
        />
        <textarea
          className="note-body-input"
          placeholder="Write your note here..."
          value={body}
          rows={10}
          onChange={(e) => setBody(e.target.value)}
          disabled={saving}
        />
        <div className="editor-actions">
          <button
            type="submit"
            className="button primary"
            disabled={saving}
            aria-label="Save note"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {currentNote && (
            <button
              type="button"
              className="button secondary"
              onClick={() => { setIsEditing(false); setTitle(currentNote.title); setBody(currentNote.body); }}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    );
  }

  // PUBLIC_INTERFACE
  function NoteViewer() {
    if (!currentNote) {
      return (
        <div className="note-blank">
          <span role="img" aria-label="note">📝</span>
          <p>Select a note, or create one.</p>
        </div>
      );
    }
    return (
      <div className="note-viewer">
        <h2>{currentNote.title || <em>Untitled</em>}</h2>
        <div className="note-viewer-date">
          Last edited:&nbsp;
          {currentNote.updated_at
            ? new Date(currentNote.updated_at).toLocaleString()
            : ''}
        </div>
        <div className="note-content">
          {currentNote.body ? currentNote.body : <em>No content.</em>}
        </div>
        <div className="viewer-actions">
          <button className="button accent" onClick={handleEditNote}>Edit</button>
          <button className="button secondary" onClick={handleDeleteNote}>Delete</button>
        </div>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function TopBar() {
    return (
      <header className="topbar" role="banner">
        <span className="logo-dot" />
        <span className="app-title">NoteNest</span>
        <span className="topbar-spacer" />
        <a
          className="github-link"
          href="https://supabase.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Supabase
        </a>
      </header>
    );
  }

  return (
    <div className="notenest-app">
      <TopBar />
      <main className="main-container">
        <aside className="sidebar">
          <NoteList />
        </aside>
        <section className="main-content">
          {error && <div className="error-message">{error}</div>}
          {isEditing ? (
            <NoteEditor />
          ) : (
            <NoteViewer />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
