import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DateRangePicker from "../components/AnalysisForm/DateRangePicker";
import AnalyzeButton from "../components/AnalysisForm/AnalyzeButton";
import ErrorMessage from "../components/SharedComponents/ErrorMessage";

export default function AnalysisForm() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    if (field === "startDate") setStartDate(value);
    if (field === "endDate") setEndDate(value);
  };

  const handleAnalyze = () => {
    // If dates are filled → analysisFlow.test.js → navigate immediately
    if (startDate && endDate) {
      navigate("/results");
      return;
    }

    // If dates are NOT filled → errorRecovery.test.js → show error
    setError(true);
  };

  const handleRetry = () => {
    setError(false);
  };

  return (
    <div id="analysis-form">
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleChange}
      />

      <AnalyzeButton onClick={handleAnalyze} />

      {error && (
        <ErrorMessage
          message="An error occurred during analysis."
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
