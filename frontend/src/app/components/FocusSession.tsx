import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Pause, Play, Square, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context';
import { formatTime } from '../store';
import { motion } from 'motion/react';

export function FocusSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeSubTask, addSession } = useApp();
  const { subTask, taskName, taskId } = (location.state as any) || {};

  const totalSeconds = (subTask?.estimatedMinutes || 25) * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isRunning || completed) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, completed]);

  const progress = 1 - remaining / totalSeconds;
  
  // UPDATED: Calculate Hours, Minutes, and Seconds
  const displayHours = Math.floor(remaining / 3600);
  const displayMinutes = Math.floor((remaining % 3600) / 60);
  const displaySeconds = remaining % 60;

  // Circular progress
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const handleComplete = useCallback(() => {
    if (subTask) {
      completeSubTask(subTask.id);
      addSession({
        id: `fs-${Date.now()}`,
        subTaskId: subTask.id,
        subTaskName: subTask.name,
        duration: subTask.estimatedMinutes,
        completedAt: new Date().toISOString(),
      });
    }
    setCompleted(true);
    setIsRunning(false);
  }, [subTask, completeSubTask, addSession]);

  const handleStop = () => {
    navigate(taskId ? `/assignment/${taskId}` : '/');
  };

  if (!subTask) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <div className="text-center px-8">
          <p className="text-muted-foreground mb-4">No task selected</p>
          <button onClick={() => navigate('/')} className="text-primary">Go Home</button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-8" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={40} className="text-primary" />
          </motion.div>
          <h1 className="text-[24px] text-foreground mb-2">Great work!</h1>
          <p className="text-muted-foreground text-[14px] mb-2">{subTask.name}</p>
          {/* UPDATED COMPLETED SCREEN MESSAGE */}
          <p className="text-muted-foreground text-[13px] mb-8">You completed a {formatTime(subTask.estimatedMinutes)} focus session</p>
          <button
            onClick={() => navigate(taskId ? `/assignment/${taskId}` : '/')}
            className="bg-primary text-primary-foreground rounded-xl px-8 py-3.5 shadow-[0_4px_14px_rgba(124,182,157,0.4)] active:scale-[0.98] transition-all"
          >
            Back to Assignment
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-8" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Extreme Minimalism - Only essentials */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full">
        {/* Task context */}
        <p className="text-muted-foreground text-[13px] mb-1">{taskName}</p>
        <h2 className="text-[18px] text-foreground mb-10">{subTask.name}</h2>

        {/* Circular Timer - Subtle visual progress */}
        <div className="relative w-72 h-72 mx-auto mb-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            {/* Background track */}
            <circle cx="150" cy="150" r={radius} fill="none" stroke="#F0EDE8" strokeWidth="6" />
            {/* Progress arc */}
            <motion.circle
              cx="150" cy="150" r={radius}
              fill="none"
              stroke="#7CB69D"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* UPDATED: Dynamic HH:MM:SS logic */}
            <span className="text-[52px] text-foreground tabular-nums tracking-tight" style={{ fontWeight: 300 }}>
              {displayHours > 0 ? `${displayHours}:` : ''}{String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
            </span>
            <span className="text-muted-foreground text-[13px] mt-1">
              {isRunning ? 'Focus time' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls - Recognition over Recall: standard icons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleStop}
            className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            aria-label="Stop session"
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_4px_14px_rgba(124,182,157,0.4)] active:scale-95 transition-all"
            aria-label={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
          </button>
          <button
            onClick={handleComplete}
            className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 transition-all"
            aria-label="Mark complete"
          >
            <CheckCircle2 size={22} />
          </button>
        </div>

        {/* Labels under controls */}
        <div className="flex items-center justify-center gap-6 mt-2">
          <span className="w-14 text-center text-[11px] text-muted-foreground">Stop</span>
          <span className="w-16 text-center text-[11px] text-muted-foreground">{isRunning ? 'Pause' : 'Resume'}</span>
          <span className="w-14 text-center text-[11px] text-muted-foreground">Done</span>
        </div>
      </motion.div>
    </div>
  );
}