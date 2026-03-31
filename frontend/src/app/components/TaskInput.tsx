import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Calendar, ArrowLeft, Clock, Pencil, Upload, FileText, X } from 'lucide-react';
import { useApp } from '../context';
import { DIFFICULTY_COLORS, formatTime } from '../store';
import type { Task, SubTask } from '../store';
import { motion, AnimatePresence } from 'motion/react';

export function TaskInput() {
  const navigate = useNavigate();
  const { addTask, startGeneration, resetGeneration, isGenerating, generatedPlan, generatedTaskName, generatedDueDate } = useApp();
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editSubTasks, setEditSubTasks] = useState<Omit<SubTask, 'parentTaskId'>[]>([]);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.txt')) {
      setUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleGenerate = async () => {
    await startGeneration(taskName, uploadedFile, dueDate);
  };

  const handleSave = () => {
    const taskId = `task-${Date.now()}`;
    const subTasks: SubTask[] = (editSubTasks.length > 0 ? editSubTasks : generatedPlan!).map(st => ({ ...st, parentTaskId: taskId }));
    const task: Task = {
      id: taskId,
      name: generatedTaskName,
      dueDate: generatedDueDate,
      difficulty: 'Medium',
      subTasks,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addTask(task);
    resetGeneration();
    navigate('/');
  };

  const openEdit = () => {
    setEditSubTasks([...(generatedPlan || [])]);
    setShowEdit(true);
  };

  const updateSubTaskField = (idx: number, field: string, value: any) => {
    setEditSubTasks(prev => prev.map((st, i) => i === idx ? { ...st, [field]: value } : st));
  };

  const deleteSubTask = (idx: number) => {
    setEditSubTasks(prev => prev.filter((_, i) => i !== idx));
  };

  const moveSubTask = (fromIdx: number, dir: -1 | 1) => {
    const toIdx = fromIdx + dir;
    if (toIdx < 0 || toIdx >= editSubTasks.length) return;
    setEditSubTasks(prev => {
      const arr = [...prev];
      [arr[fromIdx], arr[toIdx]] = [arr[toIdx], arr[fromIdx]];
      return arr;
    });
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-10 pb-4" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[22px]">New Assignment</h1>
      </div>

      <AnimatePresence mode="wait">
        {!generatedPlan ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
            {/* Task Name Input */}
            <div className="mb-5">
              <label className="text-[13px] text-muted-foreground mb-2 block">Assignment Name</label>
              <input
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
                placeholder="e.g., SOEN 357 Final Report"
                className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-[15px] placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            {/* Due Date */}
            <div className="mb-5">
              <label className="text-[13px] text-muted-foreground mb-2 block flex items-center gap-1.5"><Calendar size={13} /> Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            {/* File Upload Drop Zone - Replaces Difficulty Selector */}
            <div className="mb-8">
              <label className="text-[13px] text-muted-foreground mb-2 block flex items-center gap-1.5">
                <Upload size={13} /> Upload Assignment
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
              />
              {!uploadedFile ? (
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl py-8 px-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-primary bg-primary/8 scale-[1.01]'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-primary/4'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isDragging ? 'bg-primary/20' : 'bg-secondary'
                  }`}>
                    <Upload size={22} className={isDragging ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] text-foreground">
                      {isDragging ? 'Drop your file here' : 'Tap to upload or drag & drop'}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1">PDF, DOCX, or TXT â€” syllabus, rubric, or brief</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full bg-primary/8 border border-primary/25 rounded-2xl px-4 py-3.5 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-foreground truncate">{uploadedFile.name}</p>
                    <p className="text-[12px] text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </div>

            {/* Generate Button - Error Prevention */}
            <div className="space-y-2">
              <button
                onClick={handleGenerate}
                disabled={!taskName.trim() || !dueDate || !uploadedFile || isGenerating}
                className="w-full bg-primary text-primary-foreground rounded-xl py-4 flex items-center justify-center gap-2.5 shadow-[0_4px_14px_rgba(124,182,157,0.4)] disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all duration-200"
              >
                {isGenerating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Sparkles size={18} />
                  </motion.div>
                ) : (
                  <Sparkles size={18} />
                )}
                {isGenerating ? 'Generating Action Plan...' : 'Generate Action Plan'}
              </button>
              
              {(!taskName.trim() || !dueDate || !uploadedFile) && !isGenerating && (
                <p className="text-[12px] text-muted-foreground text-center">
                  Please provide a name, due date, and file to continue.
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Generated Plan - Stepped Timeline */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px]">Your Action Plan</h2>
                <p className="text-[13px] text-muted-foreground">{generatedPlan.length} steps &middot; ~{formatTime(generatedPlan.reduce((a, s) => a + s.estimatedMinutes, 0))} total</p>
              </div>
              <button
                onClick={openEdit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-[13px] text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>

            {/* Timeline Cards */}
            <div className="relative ml-3">
              <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-primary/20 rounded-full" />
              <div className="space-y-3">
                {(editSubTasks.length > 0 ? editSubTasks : generatedPlan).map((st, i) => (
                  <motion.div
                    key={st.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative pl-7"
                  >
                    <div className="absolute left-0 top-4 w-4 h-4 rounded-full border-2 border-primary bg-background z-10" />
                    <div className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-[14px] text-foreground">{st.name}</p>
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
                        <span className="text-[12px] text-muted-foreground/50 ml-2">#{i + 1}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full mt-6 bg-primary text-primary-foreground rounded-xl py-4 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(124,182,157,0.4)] active:scale-[0.98] transition-all duration-200"
            >
              Save & Start Working
            </button>

            <div className="flex justify-center gap-4 mt-3">
              <button onClick={() => resetGeneration()} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors py-2">
                Start Over
              </button>
              <button 
                onClick={() => { resetGeneration(); handleGenerate(); }} 
                className="text-[13px] text-primary hover:text-primary/80 transition-colors py-2"
              >
                Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal (Screen 3) */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
            onClick={() => setShowEdit(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-background rounded-t-3xl w-full max-w-md max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              <div className="px-5 pb-3 flex items-center justify-between flex-shrink-0">
                <h2 className="text-[18px]">Edit Action Plan</h2>
                <button onClick={() => setShowEdit(false)} className="text-[13px] text-muted-foreground">Cancel</button>
              </div>
              
              <div className="px-5 overflow-y-auto flex-1 pb-4">
                <div className="space-y-2.5">
                  {editSubTasks.map((st, i) => (
                    <div key={st.id} className="bg-card rounded-xl p-3.5 border border-border">
                      <div className="flex items-start gap-2 mb-3">
                        <div className="flex flex-col gap-0.5 cursor-grab text-muted-foreground/40 mt-1">
                          <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" /></div>
                          <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" /></div>
                          <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" /></div>
                        </div>
                        <textarea
                          value={st.name}
                          onChange={e => updateSubTaskField(i, 'name', e.target.value)}
                          className="flex-1 bg-transparent text-[14px] outline-none resize-none leading-snug"
                          rows={2}
                        />
                        <button
                          onClick={() => deleteSubTask(i)}
                          className="text-destructive/60 hover:text-destructive text-[12px] px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-5">
                        
                        {/* UPGRADED DUAL INPUT FOR TIME */}
                        <div className="flex items-center gap-0.5 bg-secondary rounded-lg px-2 py-1.5">
                          <Clock size={12} className="text-muted-foreground ml-1" />
                          <input
                            type="number"
                            min="0"
                            value={Math.floor(st.estimatedMinutes / 60)}
                            onChange={e => {
                              const h = parseInt(e.target.value) || 0;
                              const m = st.estimatedMinutes % 60;
                              updateSubTaskField(i, 'estimatedMinutes', (h * 60) + m);
                            }}
                            className="w-7 bg-transparent text-[13px] outline-none text-center"
                          />
                          <span className="text-[12px] text-muted-foreground pr-1 border-r border-border/50">h</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={st.estimatedMinutes % 60}
                            onChange={e => {
                              const m = parseInt(e.target.value) || 0;
                              const h = Math.floor(st.estimatedMinutes / 60);
                              updateSubTaskField(i, 'estimatedMinutes', (h * 60) + m);
                            }}
                            className="w-7 bg-transparent text-[13px] outline-none text-center pl-1"
                          />
                          <span className="text-[12px] text-muted-foreground pr-1">m</span>
                        </div>

                        <select
                          value={st.difficulty}
                          onChange={e => updateSubTaskField(i, 'difficulty', e.target.value)}
                          className="bg-secondary rounded-lg px-2.5 py-1.5 text-[13px] outline-none border-none"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                        <div className="ml-auto flex gap-1">
                          <button
                            onClick={() => moveSubTask(i, -1)}
                            disabled={i === 0}
                            className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground disabled:opacity-30 hover:bg-primary/10 transition-colors text-[14px]"
                          >â†‘</button>
                          <button
                            onClick={() => moveSubTask(i, 1)}
                            disabled={i === editSubTasks.length - 1}
                            className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground disabled:opacity-30 hover:bg-primary/10 transition-colors text-[14px]"
                          >â†“</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 pb-6 pt-2 flex-shrink-0 bg-background border-t border-border/50">
                <button
                  onClick={() => setShowEdit(false)}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 shadow-[0_4px_14px_rgba(124,182,157,0.4)] active:scale-[0.98] transition-all"
                >
                  Save & Commit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
