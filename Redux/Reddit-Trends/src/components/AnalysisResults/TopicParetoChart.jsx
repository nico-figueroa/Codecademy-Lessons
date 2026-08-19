import React from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TopicParetoChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div data-testid="pareto-chart">No pareto data available.</div>;
  }

  return (
    <div data-testid="pareto-chart">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="percentage" fill="#4f46e5" />
          <Line type="monotone" dataKey="cumulativePercent" stroke="#f97316" />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Text fallback kept for tests / accessibility */}
      <ul>
        {data.map((item) => (
          <li key={item.name}>
            {item.name}: {item.percentage}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicParetoChart;
