import { useNavigate } from 'react-router';
import { Play, ChevronRight, Sparkles, Calendar, Clock } from 'lucide-react';
import { useApp } from '../context';
import { DIFFICULTY_COLORS } from '../store';
import { motion } from 'motion/react';

export function Dashboard() {
  const { tasks, getNextSubTask, sessions } = useApp();
  const navigate = useNavigate();
  const next = getNextSubTask();

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.completedAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const totalCompleted = tasks.reduce((acc, t) => acc + t.subTasks.filter(st => st.completed).length, 0);
  const totalSubTasks = tasks.reduce((acc, t) => acc + t.subTasks.length, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const ongoingTasks = tasks.filter(t => t.subTasks.some(st => !st.completed));

  return (
    <div className="max-w-md mx-auto px-5 pt-12 pb-4" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Gentle Greeting - Emotional Design */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-muted-foreground text-[14px] mb-1">{greeting}</p>
        <h1 className="text-[26px] text-foreground mb-1">You're doing great <span role="img" aria-label="sparkle">✨</span></h1>
        <p className="text-muted-foreground text-[13px] mb-6">
          {totalCompleted} of {totalSubTasks} steps completed across {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Progress Overview - Visibility of System Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-primary/8 rounded-2xl p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] text-primary flex items-center gap-1.5">
            <Sparkles size={14} /> Today's Progress
          </span>
          <span className="text-[13px] text-primary">{todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="w-full h-2 bg-primary/15 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalSubTasks > 0 ? (totalCompleted / totalSubTasks) * 100 : 0}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Up Next Card - Hick's Law: ONE focused action */}
      {next && (
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-card rounded-2xl p-5 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] text-muted-foreground tracking-wide uppercase">Up Next</h2>
            <span
              className="text-[11px] px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: DIFFICULTY_COLORS[next.subTask.difficulty].bg,
                color: DIFFICULTY_COLORS[next.subTask.difficulty].text,
              }}
            >
              {next.subTask.difficulty}
            </span>
          </div>
          <h3 className="text-[18px] text-foreground mb-1">{next.subTask.name}</h3>
          <p className="text-muted-foreground text-[13px] mb-4 flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar size={13} /> {next.taskName}</span>
            <span className="flex items-center gap-1"><Clock size={13} /> {next.subTask.estimatedMinutes} min</span>
          </p>
          <button
            onClick={() => navigate('/focus', { state: { subTask: next.subTask, taskName: next.taskName } })}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(124,182,157,0.4)] hover:shadow-[0_4px_20px_rgba(124,182,157,0.55)] active:scale-[0.98] transition-all duration-200"
          >
            <Play size={18} fill="currentColor" /> Start Focus Session
          </button>
        </motion.div>
      )}

      {/* Ongoing Assignments - Navigation Cards */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
        <h2 className="text-[13px] text-muted-foreground tracking-wide uppercase mb-3">Ongoing Assignments</h2>
        <div className="space-y-3">
          {ongoingTasks.map((task, taskIdx) => {
            const completedCount = task.subTasks.filter(st => st.completed).length;
            const totalCount = task.subTasks.length;
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <motion.button
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + taskIdx * 0.08 }}
                onClick={() => navigate(`/assignment/${task.id}`)}
                className="w-full text-left bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-[0_2px_12px_rgba(124,182,157,0.1)] active:scale-[0.98] transition-all duration-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-foreground truncate">{task.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                        <Calendar size={11} />
                        {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                      </span>
                      <span className="text-[12px] text-muted-foreground">
                        {completedCount}/{totalCount} steps
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground/60 ml-3 flex-shrink-0" />
                </div>
                {/* Mini progress bar */}
                <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </motion.button>
            );
          })}

          {ongoingTasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-[14px]">No ongoing assignments</p>
              <button
                onClick={() => navigate('/new-task')}
                className="mt-3 text-primary text-[14px] hover:underline"
              >
                Add your first assignment
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
