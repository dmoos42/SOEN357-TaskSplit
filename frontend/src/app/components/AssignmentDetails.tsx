import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, Play, CheckCircle2, Sparkles, ChevronDown, Trash2, Check, X, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context';
import { DIFFICULTY_COLORS, formatTime } from '../store';
import { motion, AnimatePresence } from 'motion/react';

export function AssignmentDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, deleteTask, updateTaskDueDate, updateTaskName } = useApp();
  const [expandedSubTaskId, setExpandedSubTaskId] = useState<string | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState('');
  const [draftName, setDraftName] = useState('');

  const task = tasks.find(t => t.id === taskId);

  useEffect(() => {
    if (task) {
      setDraftDueDate(task.dueDate);
      setDraftName(task.name);
    }
  }, [task]);

  if (!task) {
    return (
      <div className="max-w-md mx-auto px-5 pt-12 text-center" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
        <p className="text-muted-foreground text-[15px] mb-4">Assignment not found</p>
        <button onClick={() => navigate('/')} className="text-primary text-[14px] hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entire assignment?')) {
      deleteTask(task.id);
      navigate('/');
    }
  };

  const handleSaveDueDate = () => {
    if (!draftDueDate) return;
    updateTaskDueDate(task.id, draftDueDate);
    setIsEditingDueDate(false);
  };

  const handleSaveName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    updateTaskName(task.id, trimmed);
    setIsEditingName(false);
  };

  const openNameEdit = () => {
    setDraftName(task.name);
    setIsEditingDueDate(false);
    setIsEditingName(true);
    setShowActionsMenu(false);
  };

  const openDueDateEdit = () => {
    setDraftDueDate(task.dueDate);
    setIsEditingName(false);
    setIsEditingDueDate(true);
    setShowActionsMenu(false);
  };

  const completedCount = task.subTasks.filter(st => st.completed).length;
  const totalCount = task.subTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const totalMinutes = task.subTasks.reduce((a, st) => a + st.estimatedMinutes, 0);
  const remainingMinutes = task.subTasks.filter(st => !st.completed).reduce((a, st) => a + st.estimatedMinutes, 0);

  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const dueDateFormatted = dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const firstIncompleteIdx = task.subTasks.findIndex(st => !st.completed);

  const toggleExpand = (id: string) => {
    setExpandedSubTaskId(prev => {
      if (prev === null && firstIncompleteIdx >= 0 && task.subTasks[firstIncompleteIdx].id === id) {
        return '__none__';
      }
      return prev === id ? '__none__' : id;
    });
  };

  const isExpanded = (id: string) => {
    if (expandedSubTaskId === '__none__') return false;
    if (expandedSubTaskId === null && firstIncompleteIdx >= 0) return task.subTasks[firstIncompleteIdx].id === id;
    return expandedSubTaskId === id;
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-8" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Top Navigation - User Control & Freedom */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-2 -ml-1"
        >
          <ArrowLeft size={20} />
          <span className="text-[15px]">Back</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowActionsMenu(prev => !prev)}
              className="p-2.5 rounded-xl text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors"
              aria-label="Task options"
            >
              <MoreHorizontal size={18} />
            </motion.button>
            <AnimatePresence>
              {showActionsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-[0_6px_22px_rgba(0,0,0,0.12)] p-1.5 z-30"
                >
                  <button
                    onClick={openNameEdit}
                    className="w-full text-left px-3 py-2 text-[13px] rounded-lg hover:bg-secondary transition-colors"
                  >
                    Edit assignment name
                  </button>
                  <button
                    onClick={openDueDateEdit}
                    className="w-full text-left px-3 py-2 text-[13px] rounded-lg hover:bg-secondary transition-colors"
                  >
                    Edit due date
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleDelete}
            className="p-2.5 rounded-xl text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Delete assignment"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {isEditingName ? (
          <div className="flex items-center gap-2 mb-2">
            <input
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-[20px] text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Assignment name"
            />
            <button
              onClick={handleSaveName}
              disabled={!draftName.trim()}
              className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Save assignment name"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setDraftName(task.name);
                setIsEditingName(false);
              }}
              className="w-8 h-8 rounded-md bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
              aria-label="Cancel assignment name edit"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <h1 className="text-[24px] text-foreground mb-2">{task.name}</h1>
        )}

        <div className="flex items-center gap-4 mb-6">
          {isEditingDueDate ? (
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-muted-foreground" />
              <input
                type="date"
                value={draftDueDate}
                onChange={e => setDraftDueDate(e.target.value)}
                className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-[13px] text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button
                onClick={handleSaveDueDate}
                disabled={!draftDueDate}
                className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Save due date"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setDraftDueDate(task.dueDate);
                  setIsEditingDueDate(false);
                }}
                className="w-7 h-7 rounded-md bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
                aria-label="Cancel due date edit"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span className="text-[13px] text-muted-foreground flex items-center gap-1.5">
              <Calendar size={13} />
              Due {dueDateFormatted}
              {daysLeft > 0 && <span className="text-primary ml-1">({daysLeft}d left)</span>}
              {daysLeft === 0 && <span className="text-amber-600 ml-1">(Today)</span>}
              {daysLeft < 0 && <span className="text-destructive ml-1">(Overdue)</span>}
            </span>
          )}
          <span className="text-[13px] text-muted-foreground flex items-center gap-1.5">
            <Clock size={13} /> ~{formatTime(remainingMinutes)} left
          </span>
        </div>
      </motion.div>

      {/* Progress Visual */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-primary/8 rounded-2xl p-4 mb-7"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] text-primary flex items-center gap-1.5">
            <Sparkles size={14} /> Progress
          </span>
          <span className="text-[13px] text-primary">{completedCount} of {totalCount} steps</span>
        </div>
        <div className="w-full h-2.5 bg-primary/15 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[12px] text-muted-foreground mt-2">
          {Math.round(progress)}% complete &middot; ~{formatTime(totalMinutes - remainingMinutes)} spent of ~{formatTime(totalMinutes)} total
        </p>
      </motion.div>

      {/* Sub-Task List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-[13px] text-muted-foreground tracking-wide uppercase mb-3">Action Plan</h2>

        <div className="relative ml-3">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-primary/15 rounded-full" />

          <div className="space-y-3">
            {task.subTasks.map((st, i) => {
              const isFirstIncomplete = i === firstIncompleteIdx;
              const expanded = isExpanded(st.id);

              const microSteps = st.microSteps && st.microSteps.length > 0
                ? st.microSteps
                : ['Review the requirements for this step', 'Break the work into smaller chunks', 'Complete and check for quality'];

              return (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="relative pl-7"
                >
                  {st.completed ? (
                    <CheckCircle2 size={16} className="absolute left-0 top-4 text-primary z-10" />
                  ) : (
                    <div
                      className={`absolute left-0 top-4 w-4 h-4 rounded-full border-2 bg-background z-10 ${
                        isFirstIncomplete ? 'border-primary shadow-[0_0_0_3px_rgba(124,182,157,0.2)]' : 'border-muted-foreground/30'
                      }`}
                    />
                  )}

                  <div
                    className={`rounded-xl border transition-all overflow-hidden ${
                      st.completed
                        ? 'bg-primary/4 border-primary/10 opacity-60'
                        : expanded
                        ? isFirstIncomplete
                          ? 'bg-card border-primary/30 shadow-[0_2px_16px_rgba(124,182,157,0.15)]'
                          : 'bg-card border-primary/20 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                        : isFirstIncomplete
                        ? 'bg-card border-primary/30 shadow-[0_2px_12px_rgba(124,182,157,0.12)]'
                        : 'bg-card border-border'
                    }`}
                  >
                    <button
                      onClick={() => !st.completed && toggleExpand(st.id)}
                      disabled={st.completed}
                      className={`w-full text-left p-4 ${!st.completed ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] ${st.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {st.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                              <Clock size={12} /> {formatTime(st.estimatedMinutes)}
                            </span>
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: DIFFICULTY_COLORS[st.difficulty].bg,
                                color: DIFFICULTY_COLORS[st.difficulty].text,
                              }}
                            >
                              {st.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <span className="text-[12px] text-muted-foreground/40">#{i + 1}</span>
                          {!st.completed && (
                            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown size={16} className="text-muted-foreground/50" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expanded && !st.completed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4">
                            <div className="h-px bg-border mb-3" />

                            <p className="text-[11px] text-muted-foreground tracking-wide uppercase mb-2.5">
                              Micro-Step Breakdown
                            </p>

                            <div className="space-y-2 mb-4">
                              {microSteps.map((step, stepIdx) => (
                                <div key={stepIdx} className="flex items-start gap-2.5">
                                  <span
                                    className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5"
                                  >
                                    {stepIdx + 1}
                                  </span>
                                  <p className="text-[13px] text-foreground/80 leading-relaxed">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/focus', { state: { subTask: st, taskName: task.name } });
                              }}
                              className={`w-full rounded-xl py-3 flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 ${
                                isFirstIncomplete
                                  ? 'bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(124,182,157,0.4)] hover:shadow-[0_4px_20px_rgba(124,182,157,0.55)]'
                                  : 'bg-primary/10 text-primary hover:bg-primary/15'
                              }`}
                            >
                              <Play size={16} fill="currentColor" /> Start Focus Session
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
