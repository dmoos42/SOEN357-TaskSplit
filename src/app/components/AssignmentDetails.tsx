import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, Play, CheckCircle2, Sparkles, ChevronDown } from 'lucide-react';
import { useApp } from '../context';
import { DIFFICULTY_COLORS } from '../store';
import { motion, AnimatePresence } from 'motion/react';

// AI-generated micro-steps keyed by subtask id, with fallback generation
const MICRO_STEPS: Record<string, string[]> = {
  s1: ['Open Google Scholar and university database', 'Search 4–5 keywords related to your topic', 'Save at least 3 peer-reviewed sources', 'Skim abstracts and highlight key findings'],
  s2: ['Review assignment rubric and requirements', 'Draft section headings (Intro, Body, Conclusion)', 'Add bullet-point notes under each heading', 'Confirm outline covers all rubric criteria'],
  s3: ['Write a hook sentence to engage the reader', 'State the purpose and scope of the report', 'Briefly outline the structure of the paper', 'Proofread the intro for clarity and flow'],
  s4: ['Describe your research approach clearly', 'Explain data collection methods used', 'Justify why this methodology was chosen', 'Note any limitations of the approach'],
  s5: ['Present key data points or findings', 'Create tables or figures if applicable', 'Interpret the results in your own words', 'Compare findings with existing literature'],
  s6: ['Summarize the main findings in 2–3 sentences', 'Restate the significance of the work', 'Suggest future research directions'],
  s7: ['Read through the entire document out loud', 'Check formatting against the style guide', 'Verify all citations are properly formatted', 'Run a spell-check and grammar tool'],
  s8: ['Read each problem statement twice carefully', 'Highlight key constraints and edge cases', 'Write down inputs and expected outputs', 'Note which algorithms might apply'],
  s9: ['Choose the appropriate sorting algorithm', 'Write pseudocode before real code', 'Implement the solution step-by-step', 'Test with at least 3 edge-case inputs'],
  s10: ['Draw the graph on paper to visualize it', 'Choose BFS or DFS based on the problem', 'Implement traversal with a visited set', 'Trace through the algorithm by hand to verify'],
  s11: ['Identify the time complexity of each solution', 'Identify the space complexity of each solution', 'Write a short justification for each analysis', 'Compare with known optimal complexities'],
};

function getMicroSteps(subTaskId: string, subTaskName: string): string[] {
  if (MICRO_STEPS[subTaskId]) return MICRO_STEPS[subTaskId];
  // Fallback generated steps
  return [
    `Review the requirements for "${subTaskName}"`,
    'Break the work into smaller chunks',
    'Complete the first chunk and review',
    'Finalize and check for quality',
  ];
}

export function AssignmentDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks } = useApp();
  const [expandedSubTaskId, setExpandedSubTaskId] = useState<string | null>(null);

  const task = tasks.find(t => t.id === taskId);

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

  // Auto-expand the first incomplete subtask on mount
  const getInitialExpanded = () => {
    if (firstIncompleteIdx >= 0) return task.subTasks[firstIncompleteIdx].id;
    return null;
  };

  // Use a ref-like pattern: if expandedSubTaskId has never been set, use the initial
  const effectiveExpanded = expandedSubTaskId !== null ? expandedSubTaskId :
    (expandedSubTaskId === null && firstIncompleteIdx >= 0 ? task.subTasks[firstIncompleteIdx].id : null);

  const toggleExpand = (id: string) => {
    setExpandedSubTaskId(prev => {
      if (prev === null && firstIncompleteIdx >= 0 && task.subTasks[firstIncompleteIdx].id === id) {
        // Currently showing auto-expanded, collapse it
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
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-2 -ml-1 mb-4"
      >
        <ArrowLeft size={20} />
        <span className="text-[15px]">Back</span>
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h1 className="text-[24px] text-foreground mb-2">{task.name}</h1>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[13px] text-muted-foreground flex items-center gap-1.5">
            <Calendar size={13} />
            Due {dueDateFormatted}
            {daysLeft > 0 && <span className="text-primary ml-1">({daysLeft}d left)</span>}
            {daysLeft === 0 && <span className="text-amber-600 ml-1">(Today)</span>}
            {daysLeft < 0 && <span className="text-destructive ml-1">(Overdue)</span>}
          </span>
          <span className="text-[13px] text-muted-foreground flex items-center gap-1.5">
            <Clock size={13} /> ~{remainingMinutes}m left
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
          {Math.round(progress)}% complete &middot; ~{totalMinutes - remainingMinutes}m spent of ~{totalMinutes}m total
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
              const microSteps = getMicroSteps(st.id, st.name);

              return (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="relative pl-7"
                >
                  {/* Timeline dot */}
                  {st.completed ? (
                    <CheckCircle2
                      size={16}
                      className="absolute left-0 top-4 text-primary z-10"
                    />
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
                    {/* Collapsed header — always visible, acts as expand trigger */}
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
                              <Clock size={12} /> {st.estimatedMinutes} min
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
                            <motion.div
                              animate={{ rotate: expanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={16} className="text-muted-foreground/50" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded micro-step breakdown */}
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
                            {/* Divider */}
                            <div className="h-px bg-border mb-3" />

                            {/* Micro-step label */}
                            <p className="text-[11px] text-muted-foreground tracking-wide uppercase mb-2.5">
                              Micro-Step Breakdown
                            </p>

                            {/* Micro-steps list */}
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

                            {/* Start Focus Session CTA — primary action, only in expanded state */}
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
