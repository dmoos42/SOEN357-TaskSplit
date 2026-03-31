import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { Trophy, Flame, Clock, CheckCircle2, TrendingUp, Sprout, Award, CalendarCheck, Info, ArrowUpRight } from 'lucide-react';
import { formatTime } from '../store';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'overview' | 'history';

export function Analytics() {
  const { tasks, sessions } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showScoreInfo) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowScoreInfo(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showScoreInfo]);

  const totalCompleted = tasks.reduce((acc, t) => acc + t.subTasks.filter(st => st.completed).length, 0);
  const totalSubTasks = tasks.reduce((acc, t) => acc + t.subTasks.length, 0);
  const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === new Date().toDateString());

  // Today-scoped metrics
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const todayStepsDone = todaySessions.length;
  const todayFocusLabel = formatTime(todayMinutes);

  const streak = 3;

  const growthPercent = totalSubTasks > 0 ? (totalCompleted / totalSubTasks) * 100 : 0;
  const plantStage = growthPercent < 20 ? 0 : growthPercent < 40 ? 1 : growthPercent < 60 ? 2 : growthPercent < 80 ? 3 : 4;
  const plantEmojis = ['🌱', '🌿', '🪴', '🌳', '🌳'];

  const recentWins = sessions.slice(-5).reverse();

  const completedAssignments = tasks
    .filter(t => t.subTasks.length > 0 && t.subTasks.every(st => st.completed))
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const activeTasks = tasks.filter(t => t.subTasks.length > 0 && t.subTasks.some(st => !st.completed));

  // Standard stat cards (first 3)
  const standardStats = [
    { icon: Flame, label: 'Day Streak', value: `${streak} days`, color: '#E65100', bg: '#FFF3E0' },
    { icon: CheckCircle2, label: 'Steps Done Today', value: `${todayStepsDone}`, color: '#2E7D32', bg: '#E8F5E9' },
    { icon: Clock, label: 'Total Focus Today', value: todayFocusLabel, color: '#1565C0', bg: '#E3F2FD' },
  ];

  return (
    <div className="max-w-md mx-auto px-5 pt-12 pb-4" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[26px] text-foreground mb-1">Your Progress</h1>
        <p className="text-muted-foreground text-[13px] mb-5">Focus on what you've accomplished</p>
      </motion.div>

      {/* Tab Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-secondary/60 rounded-xl p-1 flex mb-6"
      >
        {([
          { key: 'overview' as Tab, label: 'Overview' },
          { key: 'history' as Tab, label: 'History' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-[14px] transition-all duration-200 relative ${
              activeTab === tab.key
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {/* Growth Visualization */}
            <div className="bg-card rounded-2xl p-6 mb-5 border border-border text-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 150 }}
                className="text-[56px] mb-3"
              >
                {plantEmojis[plantStage]}
              </motion.div>
              <h3 className="text-[16px] text-foreground mb-1">Your Focus Garden</h3>
              <p className="text-[13px] text-muted-foreground mb-4">Complete tasks to watch it grow</p>
              <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#A8D5BA] to-[#7CB69D] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${growthPercent}%` }}
                  transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[12px] text-muted-foreground mt-2">{Math.round(growthPercent)}% complete</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* First 3 standard cards */}
              {standardStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style={{ backgroundColor: stat.bg }}>
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <p className="text-[17px] text-foreground">{stat.value}</p>
                  <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}

              {/* Bottom-right: Productivity Score card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + 3 * 0.06 }}
                className="bg-card rounded-xl p-4 border border-border relative"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style={{ backgroundColor: '#F3E5F5' }}>
                  <TrendingUp size={18} style={{ color: '#7B1FA2' }} />
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[17px] text-foreground">85</p>
                  <ArrowUpRight size={14} className="text-[#2E7D32]" />
                  <span className="text-[12px] text-[#2E7D32]">+12</span>
                </div>
                <div className="relative" ref={infoRef}>
                  <p className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    Productivity Score
                    <span className="relative inline-flex">
                      <button
                        onClick={() => setShowScoreInfo(prev => !prev)}
                        className="inline-flex"
                        aria-label="What is Productivity Score?"
                      >
                        <Info size={12} className="text-muted-foreground" />
                      </button>
                      <AnimatePresence>
                        {showScoreInfo && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full right-0 mb-2.5 w-48 bg-foreground text-background rounded-lg px-3 py-2.5 shadow-lg z-50"
                          >
                            <p className="text-[11px]">Your score is based on focus session consistency, steps completed, and streak length. Keep showing up daily to raise it!</p>
                            <div className="absolute bottom-0 right-2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-foreground" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Task Progress Bars */}
            {activeTasks.length > 0 && (
              <div className="bg-card rounded-2xl p-5 mb-5 border border-border">
                <h3 className="text-[14px] text-foreground mb-4 flex items-center gap-2"><Sprout size={16} className="text-primary" /> Task Progress</h3>
                <div className="space-y-4">
                  {activeTasks.map(task => {
                    const done = task.subTasks.filter(st => st.completed).length;
                    const total = task.subTasks.length;
                    const pct = total > 0 ? (done / total) * 100 : 0;
                    return (
                      <div key={task.id}>
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-[13px] text-foreground truncate flex-1">{task.name}</p>
                          <span className="text-[12px] text-muted-foreground ml-2">{done}/{total}</span>
                        </div>
                        <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Wins */}
            <div>
              <h3 className="text-[13px] text-muted-foreground tracking-wide uppercase mb-3 flex items-center gap-1.5">
                <Trophy size={14} className="text-[#E65100]" /> Recent Wins
              </h3>
              <div className="space-y-2">
                {recentWins.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground py-4 text-center">Complete a task to see your wins here!</p>
                ) : (
                  recentWins.map((win, i) => (
                    <motion.div
                      key={win.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      className="bg-card rounded-xl px-4 py-3 flex items-center gap-3 border border-border"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-[#2E7D32]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground truncate">{win.subTaskName}</p>
                        <p className="text-[11px] text-muted-foreground">{formatTime(win.duration)} session</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Award size={18} className="text-primary" />
              <div>
                <p className="text-[15px] text-foreground">
                  {completedAssignments.length} assignment{completedAssignments.length !== 1 ? 's' : ''} completed
                </p>
                <p className="text-[12px] text-muted-foreground">Every finish line is proof you can do it again</p>
              </div>
            </div>

            <div className="space-y-4">
              {completedAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-[40px] mb-3">🏆</div>
                  <p className="text-[15px] text-muted-foreground">Your trophy case is waiting</p>
                  <p className="text-[13px] text-muted-foreground/70 mt-1">Completed assignments will appear here</p>
                </div>
              ) : (
                completedAssignments.map((task, i) => {
                  const totalSteps = task.subTasks.length;
                  const totalFocusMin = sessions
                    .filter(s => task.subTasks.some(st => st.id === s.subTaskId))
                    .reduce((acc, s) => acc + s.duration, 0);
                  const focusLabel = formatTime(totalFocusMin);
                  const completedDate = new Date(task.dueDate);
                  const dateFormatted = completedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.08 }}
                      className="bg-card rounded-2xl border border-primary/20 overflow-hidden"
                    >
                      <div className="h-1 bg-gradient-to-r from-[#A8D5BA] to-[#7CB69D]" />
                      <div className="p-5">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 size={22} className="text-[#2E7D32]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[16px] text-foreground mb-1">{task.name}</h3>
                            <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                              <CalendarCheck size={12} />
                              Completed {dateFormatted}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-border/60">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                              <CheckCircle2 size={13} className="text-primary" />
                            </div>
                            <span className="text-[13px] text-foreground/80">{totalSteps} steps</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-md bg-[#E3F2FD] flex items-center justify-center">
                              <Clock size={13} className="text-[#1565C0]" />
                            </div>
                            <span className="text-[13px] text-foreground/80">{focusLabel} focused</span>
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                              Done
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {completedAssignments.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-[12px] text-muted-foreground/60 mt-8 pb-4"
              >
                Each completed assignment is a step forward. Keep going!
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}