'use client';

import { motion } from 'motion/react';

const tailwindColorToHex: Record<string, string> = {
  'text-blue-500': '#3b82f6',
  'text-purple-500': '#a855f7',
  'text-green-500': '#22c55e',
  'text-orange-500': '#f97316',
  'text-cyan-500': '#06b6d4',
  'text-pink-500': '#ec4899',
};

interface SkillBarProps {
  name: string;
  level: number;
  color: string;
  delay?: number;
}

export default function SkillBar({ name, level, color, delay = 0 }: SkillBarProps) {
  const hexColor = tailwindColorToHex[color] ?? '#6366f1';

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-foreground">{name}</span>
        <span className="text-xs font-semibold" style={{ color: hexColor }}>{level}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: hexColor }}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
