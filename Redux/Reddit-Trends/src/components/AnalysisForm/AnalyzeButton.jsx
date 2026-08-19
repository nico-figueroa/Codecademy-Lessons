import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadRedditData } from "../../redux/analysisSlice";

const AnalyzeButton = ({ selectedSubreddit, startDate, endDate, disabled = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAnalyze = () => {
    // 1. Trigger full analysis pipeline
    dispatch(
      loadRedditData(selectedSubreddit, {
        start: Number(startDate),
        end: Number(endDate)
      })
    );

    // 2. Navigate immediately (loading spinner will show)
    navigate("/results");
  };

  return (
    <button id="analyze-btn" className="btn btn-primary" onClick={handleAnalyze} disabled={disabled}>
      Analyze
    </button>
  );
};

export default AnalyzeButton;
