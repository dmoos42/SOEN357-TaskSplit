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
  
  // Take the task info passed from the previous screen
  const { subTask, taskName, taskId } = (location.state as any) || {};

  const totalSeconds = (subTask?.estimatedMinutes || 25) * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [completed, setCompleted] = useState(false);

  // The actual timer logic
  useEffect(() => {
    if (!isRunning || completed) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0; // Stop at zero
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval); // Cleanup so it doesn't leak memory
  }, [isRunning, completed]);

  // Math for the circular progress ring
  const progress = 1 - remaining / totalSeconds;
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Format the clock display
  const displayHours = Math.floor(remaining / 3600);
  const displayMinutes = Math.floor((remaining % 3600) / 60);
  const displaySeconds = remaining % 60;

  // Save everything when user finish the session
  const handleComplete = useCallback(() => {
    if (subTask) {
      completeSubTask(subTask.id);
      addSession({
        id: `fs-${Date.now()}`,
        subTaskId: subTask.id,
        subTaskName: subTask.name,
        duration: Math.round((totalSeconds - remaining) / 60), // Save how long user actually worked
        completedAt: new Date().toISOString(),
      });
    }
    setCompleted(true);
    setIsRunning(false);
  }, [subTask, completeSubTask, addSession, totalSeconds, remaining]);

  const handleStop = () => navigate(taskId ? `/assignment/${taskId}` : '/');

  // Safety catch just in case the user navigated here weirdly
  if (!subTask) return <div className="min-h-screen bg-background flex justify-center items-center"><p>No task selected</p></div>;

  // The success screen when user finish
  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-8" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <h1 className="text-[24px] mb-2">Great work!</h1>
          <p className="text-muted-foreground text-[14px] mb-2">{subTask.name}</p>
          <p className="text-muted-foreground text-[13px] mb-8">You completed a {formatTime(Math.round((totalSeconds - remaining) / 60))} focus session</p>
          <button onClick={handleStop} className="bg-primary text-primary-foreground rounded-xl px-8 py-3.5 shadow-md">
            Back to Assignment
          </button>
        </motion.div>
      </div>
    );
  }

  // The main active timer view
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full">
        <p className="text-muted-foreground text-[13px] mb-1">{taskName}</p>
        <h2 className="text-[18px] mb-10">{subTask.name}</h2>

        {/* SVG Circle for the progress ring */}
        <div className="relative w-72 h-72 mx-auto mb-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r={radius} fill="none" stroke="#F0EDE8" strokeWidth="6" />
            <motion.circle
              cx="150" cy="150" r={radius} fill="none" stroke="#7CB69D" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[52px] tabular-nums tracking-tight font-light">
              {displayHours > 0 ? `${displayHours}:` : ''}{String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
            </span>
            <span className="text-muted-foreground text-[13px] mt-1">{isRunning ? 'Focus time' : 'Paused'}</span>
          </div>
        </div>

        {/* Play/Pause/Done Controls */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={handleStop} className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"><Square size={20} /></button>
          <button onClick={() => setIsRunning(!isRunning)} className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            {isRunning ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
          </button>
          <button onClick={handleComplete} className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary"><CheckCircle2 size={22} /></button>
        </div>
      </motion.div>
    </div>
  );
}