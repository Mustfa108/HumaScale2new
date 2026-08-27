import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { readinessFromScore } from '../../utils/constants';

/**
 * Vertical bar chart of pillar percentages. Bars are colored by
 * their score band so the chart "reads" like a readiness overview.
 */
export function PillarBarChart({ data = [], height = 280, locale = 'ar' }) {
  const chartData = data.map((d) => {
    const cfg = readinessFromScore(Number(d.percentage) || 0);
    return {
      name: d.pillar_en && locale === 'en' ? d.pillar_en : d.pillar_ar || d.pillar_name_ar,
      value: Number(d.percentage) || 0,
      color: cfg.color,
      isWeak: d.is_weak,
    };
  });

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#334155', fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.08)' }}
            contentStyle={{
              direction: 'rtl',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              fontFamily: 'Cairo, Tajawal, system-ui',
            }}
            formatter={(value) => [`${value}%`, 'النسبة']}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
