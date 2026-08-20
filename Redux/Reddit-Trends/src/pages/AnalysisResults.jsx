import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TopicCountChart from "../components/AnalysisResults/TopicCountChart";
import TopicParetoChart from "../components/AnalysisResults/TopicParetoChart";
import InsightsList from "../components/AnalysisResults/InsightsList";
import DescriptiveStatisticsList from "../components/AnalysisResults/DescriptiveStatisticsList";
import ResultsHeader from "../components/AnalysisResults/ResultsHeader";
import NewAnalysisButton from "../components/AnalysisResults/ResultsActions/NewAnalysisButton";
import SaveToPDFButton from "../components/AnalysisResults/ResultsActions/SaveToPDFButton";
import ErrorMessage from "../components/SharedComponents/ErrorMessage";
import LoadingSpinner from "../components/SharedComponents/LoadingSpinner";
import { exportElementToPDF } from "../utils/exportToPDF";

const AnalysisResults = () => {
  const results = useSelector((state) => state.analysis.results);
  const loading = useSelector((state) => state.api.loading);
  const error = useSelector((state) => state.api.error);
  const usingDemoData = useSelector((state) => state.api.usingDemoData);
  const startDate = useSelector((state) => state.analysis.startDate);
  const endDate = useSelector((state) => state.analysis.endDate);
  const options = useSelector((state) => state.analysis.options);
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredTopics = useMemo(() => {
    if (!results?.topics) return [];
    if (category === "insights" || category === "statistics") return results.topics;
    return results.topics.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [results, search, category]);

  const filteredInsights = useMemo(() => {
    if (!results?.insights) return [];
    if (category === "topics" || category === "statistics") return results.insights;
    return results.insights.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));
  }, [results, search, category]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={`Error: ${error}`} onRetry={() => navigate("/analysis")} />;
  }

  if (!results || !results.topics || results.topics.length === 0) {
    return <div className="empty-state">No results yet. Run an analysis to see data.</div>;
  }

  return (
    <div className="results-page">
      {usingDemoData && (
        <div id="demo-data-banner" className="demo-banner">
          Showing sample demo data — Reddit's live API is unavailable right now.
        </div>
      )}

      <ResultsHeader
        startDate={startDate ? new Date(startDate * 1000).toLocaleDateString() : null}
        endDate={endDate ? new Date(endDate * 1000).toLocaleDateString() : null}
        analysisType={options?.join(", ")}
      />

      <div className="results-toolbar">
        <NewAnalysisButton onClick={() => navigate("/analysis")} />
        <SaveToPDFButton onClick={() => exportElementToPDF(contentRef.current, "reddit-trends-analysis.pdf")} />
      </div>

      <div ref={contentRef} className="results-content">
        <div className="results-filters">
          <input
            id="search-input"
            className="text-input"
            placeholder="Search insights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            id="category-filter"
            className="select-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All</option>
            <option value="topics">Topics</option>
            <option value="insights">Insights</option>
            <option value="statistics">Statistics</option>
          </select>
        </div>

        <section className="card">
          <h3>Topic Count</h3>
          <TopicCountChart data={filteredTopics} />
        </section>

        <section className="card">
          <h3>Pareto Distribution</h3>
          <TopicParetoChart data={results.pareto} />
        </section>

        <section className="card">
          <h3>Insights</h3>
          <InsightsList
            insights={filteredInsights}
            onSelect={(id) => navigate(`/details/${id}`)}
          />
        </section>

        <section className="card">
          <h3>Descriptive Statistics</h3>
          <DescriptiveStatisticsList statistics={results.statistics} />
        </section>
      </div>
    </div>
  );
};

export default AnalysisResults;
