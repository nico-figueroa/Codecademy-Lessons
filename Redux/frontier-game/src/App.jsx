import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import {
  gather,
  travel,
  tippedWagon,
  theft,
  buy,
  sell,
  reset
} from './Redux_road_refactored.js';

import "./App.css";

export default function App() {
  const wagon = useSelector(state => state.journey);
  const dispatch = useDispatch();
  const [log, setLog] = useState([]);

  function addLog(message) {
    setLog(prev => [...prev, `Day ${wagon.days}: ${message}`]);
  }

  function restartJourney() {
    dispatch(reset());
    setLog([]);
  }

  return (
    <div className="app-container">
      
      {/* LEFT SIDE */}
      <div className="left-panel">
        <h1 className="title">🌄 Frontier Journey</h1>

        <h3 className="current-day">Current Day: {wagon.days}</h3>

        {/* Progress Bar */}
        <div className="progress-section">
          <label className="progress-label">Distance Progress</label>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${wagon.distance}%` }}
            ></div>
          </div>
        </div>

        <pre className="wagon-state">
          {JSON.stringify(wagon, null, 2)}
        </pre>

        <div className="button-grid">
          <button className="btn" onClick={() => { dispatch(travel(1)); addLog("Traveled 1 day."); }}>
            Travel 1 day
          </button>

          <button className="btn" onClick={() => { dispatch(travel(3)); addLog("Traveled 3 days."); }}>
            Travel 3 days
          </button>

          <button className="btn" onClick={() => { dispatch(gather()); addLog("Gathered supplies."); }}>
            Gather supplies
          </button>

          <button className="btn" onClick={() => { dispatch(tippedWagon()); addLog("The wagon tipped over!"); }}>
            Wagon tips over
          </button>

          <button className="btn" onClick={() => { dispatch(theft()); addLog("Robbers stole half your cash."); }}>
            Robbery
          </button>

          <button className="btn" onClick={() => { dispatch(buy()); addLog("Bought supplies."); }}>
            Buy supplies
          </button>

          <button className="btn" onClick={() => { dispatch(sell()); addLog("Sold supplies."); }}>
            Sell supplies
          </button>

          <button className="btn restart-btn" onClick={restartJourney}>
            Restart Journey
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">
        <h2 className="log-title">📜 Story Log</h2>
        {log.length === 0 && <p className="no-events">No events yet.</p>}
        <ul className="log-list">
          {log.map((entry, index) => (
            <li key={index} className="log-item">{entry}</li>
          ))}
        </ul>
      </div>

    </div>
  );
}
