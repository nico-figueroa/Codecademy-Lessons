import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TopicCountChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div data-testid="topic-count-chart">No topic data available.</div>;
  }

  return (
    <div data-testid="topic-count-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>

      {/* Text fallback kept for tests / accessibility */}
      <ul>
        {data.map((topic) => (
          <li key={topic.name}>
            {topic.name}: {topic.count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicCountChart;
