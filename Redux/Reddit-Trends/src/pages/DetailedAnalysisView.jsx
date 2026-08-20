import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectResults } from "../redux/selectors/analysisSelectors";
import { selectNotes } from "../redux/selectors/noteSelectors";
import { addNote } from "../redux/notesSlice";
import DetailedChart from "../components/DetailedAnalysisView/DetailedChart";
import AdditionalInformation from "../components/DetailedAnalysisView/AdditionalInformation";
import AddNote from "../components/DetailedAnalysisView/AddNote";
import BackToFullAnalysisButton from "../components/DetailedAnalysisView/BackToFullAnalysisButton";

export default function DetailedAnalysisView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const results = useSelector(selectResults);
  const notes = useSelector(selectNotes);

  const insight = results?.insights?.find((i) => String(i.id) === id);

  if (!insight) {
    return (
      <div className="detail-page">
        <p>No details found for this item.</p>
        <BackToFullAnalysisButton onClick={() => navigate("/results")} />
      </div>
    );
  }

  const insightNotes = notes.filter((n) => String(n.id) === id);

  return (
    <div className="detail-page">
      <h1>{insight.title}</h1>

      <AdditionalInformation
        text={`Topic: ${insight.topic} · Score: ${insight.score} · Posted: ${new Date(
          insight.created_utc * 1000
        ).toLocaleString()}`}
      />

      {/* Required by E2E tests */}
      <div id="detailed-chart" className="card">
        <DetailedChart title="Post Score" data={[insight.score]} />
      </div>

      <section className="card">
        <h3>Notes</h3>
        <ul className="notes-list">
          {insightNotes.map((note, index) => (
            <li key={index}>{note.text}</li>
          ))}
        </ul>
        <AddNote onSubmit={(text) => dispatch(addNote({ id, text }))} />
      </section>

      <BackToFullAnalysisButton onClick={() => navigate("/results")} />
    </div>
  );
}
