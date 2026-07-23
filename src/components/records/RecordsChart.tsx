"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { BodyRecordExercise, BodyRecordEntry } from "@/types";
import { getBodyRecordHistory } from "@/lib/storage";
import { getBodyRecordLabel, getBodyRecordUnit, formatBodyRecordValue } from "@/lib/utils";

interface RecordsChartProps {
  exerciseId: BodyRecordExercise;
  compact?: boolean;
}

export function RecordsChart({ exerciseId, compact = false }: RecordsChartProps) {
  const [history, setHistory] = useState<BodyRecordEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(!compact);

  useEffect(() => {
    setHistory(getBodyRecordHistory(exerciseId));
  }, [exerciseId]);

  const unit = getBodyRecordUnit(exerciseId);
  const label = getBodyRecordLabel(exerciseId);

  const chartData = history.map((entry, i) => ({
    name: new Date(entry.date).toLocaleDateString("uk-UA", { day: "numeric", month: "short" }),
    value: entry.value,
    index: i,
  }));

  if (chartData.length === 0) {
    return null;
  }

  const latestValue = chartData[chartData.length - 1]?.value || 0;
  const firstValue = chartData[0]?.value || 0;
  const change = latestValue - firstValue;
  const changePercent = firstValue > 0 ? Math.round((change / firstValue) * 100) : 0;

  if (compact) {
    return (
      <div className="mt-3 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 w-full text-left group"
        >
          <BarChart3 className="w-3.5 h-3.5 text-gray-500 group-hover:text-electric transition-colors" />
          <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">
            {isExpanded ? "Сховати графік" : "Показати графік"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-gray-600 ml-auto" />
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-600 ml-auto" />
          )}
        </button>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#555" 
                    fontSize={9}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#555" 
                    fontSize={9}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a20",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [formatBodyRecordValue(Number(value), unit), label]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#39FF14" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-electric/10">
            <BarChart3 className="w-5 h-5 text-electric" />
          </div>
          <div>
            <h3 className="font-medium text-white">{label}</h3>
            <p className="text-[10px] text-gray-500">Історія рекордів</p>
          </div>
        </div>
        {change !== 0 && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
            change > 0 ? "bg-lime/10 text-lime" : "bg-red-400/10 text-red-400"
          }`}>
            {change > 0 ? "+" : ""}{changePercent}%
          </span>
        )}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis 
              dataKey="name" 
              stroke="#555" 
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              stroke="#555" 
              fontSize={11}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a20",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "#fff",
              }}
              formatter={(value) => [formatBodyRecordValue(Number(value), unit), label]}
            />
            <Bar 
              dataKey="value" 
              fill="#39FF14" 
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
