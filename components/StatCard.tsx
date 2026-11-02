
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, color }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-cyan-200 transition-colors">
      <div>
        <p className="text-slate-500 text-sm mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <p className="text-xs text-green-600 mt-2 font-medium">
            {trend} <span className="text-slate-400">منذ الشهر الماضي</span>
          </p>
        )}
      </div>
      <div className={`${color} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

export default StatCard;
