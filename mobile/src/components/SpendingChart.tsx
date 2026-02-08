import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle,
  Rect,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

interface DataPoint {
  label: string;
  value: number;
}

interface SpendingChartProps {
  data: DataPoint[];
  height?: number;
  hidden?: boolean;
}

const formatValue = (v: number): string => {
  if (v >= 1000) return `R$${(v / 1000).toFixed(1)}k`;
  return `R$${v.toFixed(0)}`;
};

const SpendingChart: React.FC<SpendingChartProps> = ({ data, height = 160, hidden = false }) => {
  const { colors } = useTheme();
  const width = Dimensions.get('window').width - 80;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleTap = useCallback(
    (index: number) => {
      setSelectedIndex((prev) => (prev === index ? null : index));
    },
    [],
  );

  if (hidden) {
    return (
      <View style={[styles.hiddenContainer, { height }]}>
        <Text style={[styles.hiddenText, { color: colors.textMuted }]}>Oculto</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={[styles.hiddenContainer, { height }]}>
        <Text style={[styles.hiddenText, { color: colors.textMuted }]}>Sem dados</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const paddingTop = 28; // espaço para tooltip
  const paddingBottom = 28;
  const chartHeight = height - paddingTop - paddingBottom;
  const stepX = width / (data.length - 1 || 1);

  // Build points
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: paddingTop + chartHeight - (d.value / maxValue) * chartHeight,
  }));

  // Smooth curve using cubic bezier
  const buildPath = () => {
    if (points.length < 2) {
      const p = points[0];
      return `M ${p.x} ${p.y} L ${p.x} ${p.y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cpx1 = current.x + stepX * 0.4;
      const cpy1 = current.y;
      const cpx2 = next.x - stepX * 0.4;
      const cpy2 = next.y;
      path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = buildPath();
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Tooltip helpers
  const getTooltipX = (px: number) => {
    const tooltipW = 64;
    let tx = px - tooltipW / 2;
    if (tx < 0) tx = 0;
    if (tx + tooltipW > width) tx = width - tooltipW;
    return tx;
  };

  return (
    <View style={{ height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((frac) => {
          const y = paddingTop + chartHeight * (1 - frac);
          return (
            <Line
              key={frac}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke={colors.surfaceBorder}
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Selected vertical line */}
        {selectedIndex !== null && (
          <Line
            x1={points[selectedIndex].x}
            y1={paddingTop}
            x2={points[selectedIndex].x}
            y2={height - paddingBottom}
            stroke={colors.primary}
            strokeWidth={1}
            strokeDasharray="3,3"
            opacity={0.5}
          />
        )}

        {/* Dots */}
        {points.map((p, i) => {
          const isSelected = selectedIndex === i;
          return (
            <G key={i}>
              {isSelected && (
                <Circle cx={p.x} cy={p.y} r={10} fill={colors.primary} opacity={0.15} />
              )}
              <Circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 5 : 3.5}
                fill={isSelected ? '#fff' : colors.primary}
                stroke={colors.primary}
                strokeWidth={isSelected ? 2.5 : 0}
              />
            </G>
          );
        })}

        {/* Tooltip */}
        {selectedIndex !== null && (
          <G>
            <Rect
              x={getTooltipX(points[selectedIndex].x)}
              y={0}
              width={64}
              height={22}
              rx={6}
              fill={colors.primary}
            />
            <SvgText
              x={getTooltipX(points[selectedIndex].x) + 32}
              y={15}
              fill="#fff"
              fontSize={10}
              fontWeight="700"
              textAnchor="middle"
            >
              {formatValue(data[selectedIndex].value)}
            </SvgText>
          </G>
        )}

        {/* Labels */}
        {data.map((d, i) => (
          <SvgText
            key={i}
            x={points[i].x}
            y={height - 6}
            fill={selectedIndex === i ? colors.primary : colors.textMuted}
            fontSize={9}
            fontWeight={selectedIndex === i ? '700' : '500'}
            textAnchor="middle"
          >
            {d.label}
          </SvgText>
        ))}

        {/* Touch areas (invisible rectangles) */}
        {points.map((p, i) => (
          <Rect
            key={`touch-${i}`}
            x={p.x - stepX / 2}
            y={0}
            width={stepX}
            height={height}
            fill="transparent"
            onPress={() => handleTap(i)}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenText: {
    fontSize: 14,
  },
});

export default SpendingChart;
