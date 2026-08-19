import React from "react";

const InsightsList = ({ insights, onSelect }) => {
  if (!insights || insights.length === 0) {
    return <div>No insights available.</div>;
  }

  return (
    <ul className="insights-list">
      {insights.map((insight) => (
        <li
          key={insight.id}
          className="result-item"
          onClick={() => onSelect && onSelect(insight.id)}
        >
          {insight.title}
        </li>
      ))}
    </ul>
  );
};

export default InsightsList;
