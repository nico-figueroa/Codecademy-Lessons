// src/components/SearchResults/SearchResults.jsx
import React from 'react';
import Tracklist from '../Tracklist/Tracklist';

export default function SearchResults({ searchResults, onAddTrack, editing, hasSearched }) {
  const noResults = hasSearched && searchResults.length === 0;

  return (
    <div className="SearchResults">
      <h2>Results</h2>

      {noResults ? (
        <p className="no-results">No search results meet the search criteria</p>
      ) : (
        <Tracklist 
          tracks={searchResults} 
          onAddTrack={onAddTrack} 
          editing={editing}
        />
      )}
    </div>
  );
}

