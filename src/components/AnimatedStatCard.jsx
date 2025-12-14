// src/components/AnimatedStatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import Sparkline from './charts/Sparkline';

const cardBase =
  "bg-[#1d2328] border border-[#293239] rounded-lg transition-all duration-300 hover:border-[#3a434a] hover:shadow-xl hover:shadow-blue-500/10";

export default function AnimatedStatCard({ 
  label, 
  value, 
  sub, 
  trend, 
  sparklineData = null,
  icon = null,
  isLoading = false,
  color = "#3b82f6"
}) {
  if (isLoading) {
    return (
      <div className={`${cardBase} p-6 h-full`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-2/3 mb-4"></div>
          <div className="h-8 bg-gray-600 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const numericValue = parseInt(value?.toString().replace(/[^0-9]/g, '') || '0');
  const isPercentage = value?.toString().includes('%');
  const isCurrency = value?.toString().includes('$');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={`${cardBase} p-6 relative overflow-hidden group cursor-pointer h-full flex flex-col`}
    >
      {/* Animated gradient background on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-500"
        style={{
          backgroundImage: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`
        }}
      />

      {/* Top accent bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <p className="text-sm text-gray-400 font-medium mb-2">{label}</p>

        <div className="flex items-end gap-3 mb-2">
          <div className="text-3xl font-bold text-white">
            {isCurrency && '$'}
            <CountUp
              end={numericValue}
              duration={2}
              separator=","
              decimals={0}
            />
            {isPercentage && '%'}
          </div>

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`text-sm font-semibold flex items-center gap-1 px-2 py-1 rounded-full ${
                trend.type === "up"
                  ? "text-green-400 bg-green-500/10"
                  : trend.type === "down"
                  ? "text-red-400 bg-red-500/10"
                  : "text-yellow-400 bg-yellow-500/10"
              }`}
            >
              {trend.type === "up" ? "↗" : trend.type === "down" ? "↙" : "→"}
              <span>{trend.value}</span>
            </motion.div>
          )}
        </div>

        {sub && (
          <p className="text-xs text-gray-500 mb-3">{sub}</p>
        )}

        {/* Sparkline - fixed height container to maintain consistent card height */}
        <div className="mt-auto pt-3">
          {sparklineData && sparklineData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="h-8"
            >
              <Sparkline data={sparklineData} color={color} height={32} />
            </motion.div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
