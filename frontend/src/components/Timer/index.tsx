"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconRefresh,
  IconClock,
} from "@tabler/icons-react";

interface TimerProps {
  className?: string;
}

// 定数定義
const CYCLE_DURATION_SECONDS = 60;

const Timer: React.FC<TimerProps> = ({ className = "" }) => {
  const [time, setTime] = useState(0); // 経過時間（秒）
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setTime(elapsed);
        }
      }, 16);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // 一時停止時の時間を保存
  useEffect(() => {
    if (!isRunning) {
      pausedTimeRef.current = time;
    }
  }, [isRunning, time]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / CYCLE_DURATION_SECONDS);
    const secs = Math.floor(seconds % CYCLE_DURATION_SECONDS);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
  };

  // 円形プログレスバーの計算
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = (time % CYCLE_DURATION_SECONDS) / CYCLE_DURATION_SECONDS;
  const strokeDashoffset = circumference - progress * circumference;

  // 周回数に応じた色変更（2色のみ）
  const cycleCount = Math.floor(time / CYCLE_DURATION_SECONDS);
  const colors = ["text-interactive", "text-warning"];
  const currentColor = colors[cycleCount % colors.length];

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gradient-to-br from-surface via-surface-variant to-surface p-4 sm:p-6 ${className}`}
    >
      {/* メインタイマー表示 */}
      <div className="relative mb-8">
        {/* 背景の円 */}
        <svg
          width="280"
          height="280"
          className="transform -rotate-90 w-64 h-64 sm:w-72 sm:h-72"
          viewBox="0 0 280 280"
        >
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-border opacity-30"
          />
          {/* 過去の周回を表示 */}
          {Array.from({ length: cycleCount }).map((_, index) => (
            <circle
              key={index}
              cx="140"
              cy="140"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              className={colors[index % colors.length]}
              strokeLinecap="round"
            />
          ))}
          {/* 現在の周回 */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={currentColor}
            strokeLinecap="round"
          />
        </svg>

        {/* 時間表示 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-mono font-bold text-text mb-2">
              {formatTime(time)}
            </div>
            <div className="text-sm text-text-muted flex items-center justify-center gap-1">
              <IconClock size={16} />
              <span>経過時間</span>
            </div>
            {cycleCount > 0 && (
              <div className="text-xs text-text-muted mt-1">
                {cycleCount}周目
              </div>
            )}
          </div>
        </div>
      </div>

      {/* コントロールボタン */}
      <div className="flex gap-6 mb-6">
        <button
          onClick={handleStartStop}
          className={`
            flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95
            ${
              isRunning
                ? "bg-warning hover:bg-warning-hover text-text-inverse shadow-lg shadow-warning/25"
                : "bg-interactive hover:bg-interactive-hover text-text-inverse shadow-lg shadow-interactive/25"
            }
          `}
        >
          {isRunning ? (
            <IconPlayerPause size={24} />
          ) : (
            <IconPlayerPlay size={24} />
          )}
        </button>

        <button
          onClick={handleReset}
          className="
            flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95
            bg-surface-hover hover:bg-surface-pressed text-text-muted hover:text-text border-2 border-border hover:border-interactive
          "
        >
          <IconRefresh size={24} />
        </button>
      </div>

      {/* 状態表示 */}
      <div className="text-center">
        <div
          className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${
            isRunning
              ? "bg-interactive/10 text-interactive border border-interactive/20"
              : "bg-surface-hover text-text-muted border border-border"
          }
        `}
        >
          <div
            className={`
            w-2 h-2 rounded-full transition-all duration-200
            ${isRunning ? "bg-interactive animate-pulse" : "bg-text-muted"}
          `}
          />
          <span>{isRunning ? "実行中" : "停止中"}</span>
        </div>
      </div>

      {/* 装飾的な要素 */}
      <div className="absolute top-8 right-8 w-12 h-12 bg-interactive/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-8 left-8 w-8 h-8 bg-warning/10 rounded-full blur-lg"></div>
    </div>
  );
};

export default Timer;
