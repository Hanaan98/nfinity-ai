// src/components/InsightCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const insightTypes = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: '✓',
    iconColor: 'text-green-400'
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: '!',
    iconColor: 'text-yellow-400'
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'i',
    iconColor: 'text-blue-400'
  },
  urgent: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: '!',
    iconColor: 'text-red-400'
  }
};

export default function InsightCard({ type = 'info', title, description, action }) {
  const style = insightTypes[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`${style.bg} border ${style.border} rounded-lg p-4 backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className={`w-8 h-8 rounded-full ${style.bg} border ${style.border} flex items-center justify-center font-bold ${style.iconColor}`}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {style.icon}
        </motion.div>
        
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-100 mb-1">{title}</h4>
          <p className="text-xs text-gray-400">{description}</p>
          
          {action && (
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={`mt-2 text-xs font-medium ${style.iconColor} hover:underline inline-flex items-center gap-1`}
            >
              {action.label}
              <span>→</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
