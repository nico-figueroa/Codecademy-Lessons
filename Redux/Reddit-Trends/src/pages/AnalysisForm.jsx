import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadSubreddits } from "../redux/subredditsSlice";
import { setDateRange, setOptions } from "../redux/analysisSlice";
import AnalyzeButton from "../components/AnalysisForm/AnalyzeButton";
import AnalysisOptions from "../components/AnalysisForm/AnalysisOptions";
import DateRangePicker from "../components/AnalysisForm/DateRangePicker";
import validateDateRange from "../utils/dateRangeValidation";

// Calendar inputs give "YYYY-MM-DD" strings; the rest of the app works in UTC seconds.
const toUnixSeconds = (dateStr) => {
  const ms = new Date(dateStr).getTime();
  return Number.isNaN(ms) ? "" : String(Math.floor(ms / 1000));
};

const AnalysisForm = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSubreddits());
  }, [dispatch]);

  const subreddits = useSelector((state) => state.subreddits.list);

  const [selectedSubreddit, setSelectedSubreddit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [options, setSelectedOptions] = useState([]);

  const isDateRangeValid =
    startDate !== "" && endDate !== "" && validateDateRange(startDate, endDate);

  const handleDateFieldChange = (field, value) => {
    const nextStart = field === "startDate" ? value : startDate;
    const nextEnd = field === "endDate" ? value : endDate;

    if (field === "startDate") setStartDate(value);
    else setEndDate(value);

    if (nextStart && nextEnd) {
      dispatch(
        setDateRange({ start: Number(toUnixSeconds(nextStart)), end: Number(toUnixSeconds(nextEnd)) })
      );
    }
  };

  const handleOptionsChange = (option) => {
    const next = options.includes(option)
      ? options.filter((o) => o !== option)
      : [...options, option];

    setSelectedOptions(next);
    dispatch(setOptions(next));
  };

  return (
    <div id="analysis-form" className="form-card">
      <h2>Analysis Form</h2>

      <div className="field-group">
        <label htmlFor="subreddit-select">Subreddit</label>
        <select
          id="subreddit-select"
          aria-label="subreddit"
          className="select-input"
          value={selectedSubreddit}
          onChange={(e) => setSelectedSubreddit(e.target.value)}
        >
          <option value="">Select a subreddit</option>
          {subreddits.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <DateRangePicker startDate={startDate} endDate={endDate} onChange={handleDateFieldChange} />

      <AnalysisOptions selected={options} onChange={handleOptionsChange} />

      {startDate && endDate && !isDateRangeValid && (
        <div id="date-range-error" className="field-error">
          Please enter a valid date range (start must be before end).
        </div>
      )}

      <AnalyzeButton
        selectedSubreddit={selectedSubreddit}
        startDate={toUnixSeconds(startDate)}
        endDate={toUnixSeconds(endDate)}
        disabled={!selectedSubreddit || !isDateRangeValid}
      />
    </div>
  );
};

export default AnalysisForm;
