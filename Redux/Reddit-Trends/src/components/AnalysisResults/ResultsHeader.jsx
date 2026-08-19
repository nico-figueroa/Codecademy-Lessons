import React from "react";

const ResultsHeader = ({ startDate, endDate, analysisType }) => {
  return (
    <header className="results-header">
      <h2 id="results-header">Analysis Results</h2>
      {startDate && endDate && (
        <p className="results-header-range">
          {startDate} - {endDate}
        </p>
      )}
      {analysisType && <p className="results-header-type">{analysisType}</p>}
    </header>
  );
};

export default ResultsHeader;
