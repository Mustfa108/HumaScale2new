import {
  Radar,
  RadarChart as ReRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PILLAR_LABELS_AR } from '../../utils/constants';

export function PillarRadarChart({
  data = [],
  height = 320,
  fillColor = '#1f3ff5',
  strokeColor = '#1f3ff5',
  showLabels = true,
}) {
  // Map pillar_key -> arabic label; fall back to whatever the API sent
  const chartData = data.map((d) => ({
    pillar: d.pillar_ar || PILLAR_LABELS_AR[d.pillar_key] || d.pillar_key,
    value: Number(d.percentage) || 0,
  }));

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer>
        <ReRadar data={chartData} outerRadius="75%">
          <PolarGrid stroke="#e2e8f0" />
          {showLabels && (
            <PolarAngleAxis
              dataKey="pillar"
              tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
            />
          )}
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            stroke="#cbd5e1"
          />
          <Tooltip
            contentStyle={{
              direction: 'rtl',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              fontFamily: 'Cairo, Tajawal, system-ui',
            }}
            formatter={(value) => [`${value}%`, 'النسبة']}
          />
          <Radar
            name="النسبة"
            dataKey="value"
            stroke={strokeColor}
            fill={fillColor}
            fillOpacity={0.35}
            isAnimationActive
          />
        </ReRadar>
      </ResponsiveContainer>
    </div>
  );
}
