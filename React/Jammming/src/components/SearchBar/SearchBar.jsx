// src/components/SearchBar/SearchBar.jsx
import React from 'react';
import "./SearchBar.css";

export default function SearchBar({ onSearch, editing }) {
  const [term, setTerm] = React.useState('');

  console.log("Executed SearchBar.jsx")

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !editing) {
      onSearch(term);
    }
  }

  return (
    <div className="SearchBar">
      <input
        placeholder="Enter a song, album, or artist"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={editing}
      />
      <button onClick={() => onSearch(term)} disabled={editing}>
        Search
      </button>
    </div>
  );
}