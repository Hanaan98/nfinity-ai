// src/components/charts/BarChart.jsx
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1d2328] border border-[#3a434a] rounded-lg p-3 shadow-xl"
      >
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold text-sm">
          ${payload[0].value.toLocaleString()}
        </p>
      </motion.div>
    );
  }
  return null;
};

export default function BarChart({ data, dataKey, height = 200 }) {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#293239" opacity={0.3} />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#293239' }}
        />
        <YAxis
          stroke="#6b7280"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#293239' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
        <Bar
          dataKey={dataKey}
          radius={[6, 6, 0, 0]}
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
