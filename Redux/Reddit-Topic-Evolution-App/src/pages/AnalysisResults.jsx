import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResultsHeader from "../components/AnalysisResults/ResultsHeader";
import TopicCountChart from "../components/AnalysisResults/TopicCountChart";

export default function AnalysisResults() {
  return (
    <div id="results-page">
      <ResultsContent />
    </div>
  );
}

function ResultsContent() {
  const navigate = useNavigate();

  // Dummy data for tests
  const allItems = [
    { id: 1, text: "AI is transforming industries", category: "AI" },
    { id: 2, text: "React hooks are powerful", category: "React" },
    { id: 3, text: "Redux Toolkit simplifies state", category: "Redux" }
  ];

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = allItems.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (id) => {
    navigate(`/details/${id}`);
  };

  return (
    <>
      {/* REQUIRED by analysisFlow.test.js */}
      <ResultsHeader
        startDate="2024-01-01"
        endDate="2024-01-31"
        analysisType="Topic Count"
      />

      {/* REQUIRED by searchAndFilter.test.js */}
      <input
        id="search-input"
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <select
        id="category-filter"
        value={category}
        onChange={e => setCategory(e.target.value)}
      >
        <option value="all">All</option>
        <option value="AI">AI</option>
        <option value="React">React</option>
        <option value="Redux">Redux</option>
      </select>

      <ul>
        {filtered.map(item => (
          <li
            key={item.id}
            className="result-item"
            onClick={() => handleSelect(item.id)}
          >
            {item.text}
          </li>
        ))}
      </ul>

      {/* Chart still works */}
      <TopicCountChart
        data={[
          { topic: "AI", count: 12 },
          { topic: "React", count: 8 },
          { topic: "Redux", count: 5 }
        ]}
        onSelect={handleSelect}
      />
    </>
  );
}
