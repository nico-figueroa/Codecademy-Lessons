import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DetailedChart({ title, data = [] }) {
  const chartData = data.map((value, index) => ({ name: `#${index + 1}`, value }));

  return (
    <div>
      <h3>{title}</h3>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
