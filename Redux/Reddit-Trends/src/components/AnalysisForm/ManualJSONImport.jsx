import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadFromRawJSON } from "../../redux/analysisSlice";

// Reddit's own fetch() from this app is blocked by CORS, but a real browser
// tab navigated directly to https://www.reddit.com/r/{subreddit}.json works.
// This lets a user paste that JSON in manually as a workaround.
export default function ManualJSONImport() {
  const [rawText, setRawText] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.api.error);

  const handleImport = () => {
    dispatch(loadFromRawJSON(rawText));
    navigate("/results");
  };

  return (
    <details className="manual-import">
      <summary>Or paste Reddit JSON data manually</summary>

      <p className="manual-import-help">
        Visit <code>https://www.reddit.com/r/&lt;subreddit&gt;.json</code> in a
        regular browser tab, copy the full page text, and paste it below.
      </p>

      <textarea
        id="manual-json-input"
        className="text-input manual-json-textarea"
        placeholder="Paste Reddit listing JSON here..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />

      {error && <div className="field-error">{error}</div>}

      <button
        type="button"
        id="import-json-btn"
        className="btn btn-secondary"
        disabled={!rawText.trim()}
        onClick={handleImport}
      >
        Analyze Pasted Data
      </button>
    </details>
  );
}
