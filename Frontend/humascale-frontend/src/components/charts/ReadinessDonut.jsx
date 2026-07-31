import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = {
  low: '#DC2626',
  medium: '#F59E0B',
  good: '#16A34A',
};

const LABELS = {
  low: 'منخفضة',
  medium: 'متوسطة',
  good: 'جيدة',
};

export function ReadinessDonut({ data = [], height = 240 }) {
  // data: [{ key, count, percentage, label_ar }]
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: d.label_ar || LABELS[d.key] || d.key,
      value: d.count,
      key: d.key,
    }));

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate-400"
        style={{ height }}
      >
        لا توجد بيانات بعد.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            isAnimationActive
            label={({ value }) => value}
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              direction: 'rtl',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              fontFamily: 'Cairo, Tajawal, system-ui',
            }}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ direction: 'rtl', fontFamily: 'Cairo' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
