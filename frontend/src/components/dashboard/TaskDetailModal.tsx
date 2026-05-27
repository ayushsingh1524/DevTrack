"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import {
  useTasks,
  useUpdateTask,
  useDeleteTask,
  useTaskComments,
  useCreateComment,
  useTaskActivities,
  useAssignees,
} from "@/hooks/useTasks";
import {
  X,
  Calendar,
  AlertCircle,
  Trash2,
  MessageSquare,
  History,
  CheckCircle2,
  User,
  Plus,
  Loader2,
  Tag,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function TaskDetailModal() {
  const { activeTaskId, setActiveTaskId } = useTaskStore();
  
  // Get all tasks to find the active task details instantly from cache
  const { data: tasks } = useTasks();
  const task = tasks?.find((t) => t.id === activeTaskId);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: assignees } = useAssignees();

  const { data: comments, isLoading: loadingComments } = useTaskComments(activeTaskId || 0);
  const { data: activities, isLoading: loadingActivities } = useTaskActivities(activeTaskId || 0);
  const createComment = useCreateComment(activeTaskId || 0);

  // Local state for description editing
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState("");
  
  // Local state for title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState("");

  // Local state for new comment
  const [commentText, setCommentText] = useState("");

  // Tabs for comments vs activity logs
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");

  // Sync state when active task shifts
  useEffect(() => {
    if (task) {
      setDescText(task.description || "");
      setTitleText(task.title);
    }
    setIsEditingDesc(false);
    setIsEditingTitle(false);
  }, [task]);

  if (!activeTaskId || !task) return null;

  const handleSaveDescription = async () => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: { description: descText },
      });
      setIsEditingDesc(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTitle = async () => {
    if (!titleText.trim()) return;
    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: { title: titleText },
      });
      setIsEditingTitle(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({ content: commentText });
      setCommentText("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      try {
        await deleteTask.mutateAsync(task.id);
        setActiveTaskId(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "urgent":
        return "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse";
      default:
        return "bg-white/10 text-white/55 border-white/5";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveTaskId(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-4xl h-[85vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-2xl z-10 flex flex-col"
        >
          {/* Glass header line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border tracking-wider", getPriorityColor(task.priority))}>
                {task.priority}
              </span>
              <span className="text-white/30 text-xs">Task-{task.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteTask}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full p-2 transition-all"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setActiveTaskId(null)}
                className="text-white/40 hover:text-white rounded-full p-2 hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Content Split Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3">
            {/* Main Detail Workspace (Left Column - 2/3 wide on desktop) */}
            <div className="lg:col-span-2 p-8 space-y-6 lg:border-r lg:border-white/5">
              {/* Title Section */}
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={titleText}
                      onChange={(e) => setTitleText(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                      autoFocus
                      className="bg-white/5 border-white/10 focus:border-primary/50 text-xl font-bold text-white h-10 px-3"
                    />
                    <Button onClick={handleSaveTitle} size="sm">Save</Button>
                  </div>
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-2xl font-bold text-white hover:bg-white/5 px-2 py-1 -ml-2 rounded cursor-pointer transition-colors"
                  >
                    {task.title}
                  </h1>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Description</h3>
                {isEditingDesc ? (
                  <div className="space-y-3">
                    <textarea
                      value={descText}
                      onChange={(e) => setDescText(e.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-white/10 bg-white/5 p-3.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all"
                    />
                    <div className="flex justify-start gap-2">
                      <Button onClick={handleSaveDescription} size="sm">Save changes</Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    className="min-h-[100px] bg-white/[0.02] border border-white/5 rounded-xl p-4 cursor-pointer text-sm text-white/80 leading-relaxed hover:border-white/10 transition-colors"
                  >
                    {task.description ? (
                      task.description
                    ) : (
                      <span className="text-white/30 italic">No description provided. Click to add details...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Comments & Activity Log tabbed section */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex gap-4 border-b border-white/5 pb-2">
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={cn(
                      "text-sm font-semibold flex items-center gap-2 pb-2 border-b-2 transition-all px-1",
                      activeTab === "comments"
                        ? "text-primary border-primary"
                        : "text-white/40 border-transparent hover:text-white/70"
                    )}
                  >
                    <MessageSquare size={16} />
                    Comments ({comments?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={cn(
                      "text-sm font-semibold flex items-center gap-2 pb-2 border-b-2 transition-all px-1",
                      activeTab === "activity"
                        ? "text-primary border-primary"
                        : "text-white/40 border-transparent hover:text-white/70"
                    )}
                  >
                    <History size={16} />
                    Activities
                  </button>
                </div>

                {activeTab === "comments" ? (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <form onSubmit={handleAddComment} className="flex gap-3">
                      <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="bg-white/5 border-white/10 text-white flex-1"
                      />
                      <Button type="submit" disabled={createComment.isPending} className="bg-primary text-white">
                        {createComment.isPending ? <Loader2 size={16} className="animate-spin" /> : "Post"}
                      </Button>
                    </form>

                    {/* Comments list */}
                    <div className="space-y-4 pt-2">
                      {loadingComments ? (
                        <div className="flex justify-center p-4">
                          <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                      ) : comments?.length === 0 ? (
                        <p className="text-xs text-white/30 italic text-center p-4">No comments posted yet.</p>
                      ) : (
                        comments?.map((comment) => (
                          <div key={comment.id} className="flex gap-3 text-sm">
                            <Avatar className="h-7 w-7 ring-1 ring-white/10 shrink-0">
                              <AvatarImage src={comment.user?.avatar || ""} />
                              <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                                {comment.user?.username?.substring(0, 2).toUpperCase() || "US"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-white/80 text-xs">{comment.user?.username}</span>
                                <span className="text-[10px] text-white/30">{formatDate(comment.created_at)}</span>
                              </div>
                              <p className="text-white/90 text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Activity Logs Timeline */}
                    <div className="space-y-4">
                      {loadingActivities ? (
                        <div className="flex justify-center p-4">
                          <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                      ) : activities?.length === 0 ? (
                        <p className="text-xs text-white/30 italic text-center p-4">No logs recorded.</p>
                      ) : (
                        activities?.map((act, index) => (
                          <div key={act.id} className="relative flex gap-3 text-xs group">
                            {/* Connector line */}
                            {index !== activities.length - 1 && (
                              <div className="absolute left-3.5 top-7 bottom-[-20px] w-[1px] bg-white/5" />
                            )}
                            
                            <div className="h-7 w-7 rounded-full bg-[#15151a] border border-white/10 flex items-center justify-center text-white/40 shrink-0">
                              <CheckCircle2 size={12} className="text-primary/70" />
                            </div>
                            
                            <div className="flex flex-col pt-0.5">
                              <p className="text-white/70">
                                <span className="font-semibold text-white/90 mr-1">{act.user?.username}</span>
                                {act.activity_type === "create" ? (
                                  <>created this task</>
                                ) : act.activity_type === "status_change" ? (
                                  <>changed status from <span className="text-primary italic font-medium">{act.old_value}</span> to <span className="text-primary italic font-medium">{act.new_value}</span></>
                                ) : act.activity_type === "priority_change" ? (
                                  <>changed priority from <span className="text-primary italic font-medium">{act.old_value}</span> to <span className="text-primary italic font-medium">{act.new_value}</span></>
                                ) : (
                                  <>updated this task</>
                                )}
                              </p>
                              <span className="text-[10px] text-white/30 mt-1">{formatDate(act.created_at)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar properties (Right Column - 1/3 wide on desktop) */}
            <div className="p-8 space-y-6 bg-black/[0.15]">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Task Details</h3>
                
                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <span className="text-xs text-white/50">Status</span>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateTask.mutate({
                        id: task.id,
                        data: { status: e.target.value as any },
                      })
                    }
                    className="w-full h-9 rounded-lg border border-white/10 bg-[#121216] px-3 text-xs text-white focus:border-primary/50 focus:outline-none transition-all"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Priority Dropdown */}
                <div className="space-y-1.5">
                  <span className="text-xs text-white/50">Priority</span>
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      updateTask.mutate({
                        id: task.id,
                        data: { priority: e.target.value as any },
                      })
                    }
                    className="w-full h-9 rounded-lg border border-white/10 bg-[#121216] px-3 text-xs text-white focus:border-primary/50 focus:outline-none transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Assignee Selection */}
                <div className="space-y-1.5">
                  <span className="text-xs text-white/50">Assignee</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={task.assignee_id || ""}
                      onChange={(e) =>
                        updateTask.mutate({
                          id: task.id,
                          data: { assignee_id: e.target.value ? parseInt(e.target.value, 10) : null },
                        })
                      }
                      className="flex-1 h-9 rounded-lg border border-white/10 bg-[#121216] px-3 text-xs text-white focus:border-primary/50 focus:outline-none transition-all"
                    >
                      <option value="">Unassigned</option>
                      {assignees?.map((user) => (
                        <option key={user.id} value={user.id.toString()}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                    
                    {task.assignee && (
                      <Avatar className="h-8 w-8 ring-1 ring-white/10 shrink-0">
                        <AvatarImage src={task.assignee.avatar || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {task.assignee.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <span className="text-xs text-white/50">Due Date</span>
                  <div className="relative">
                    <Input
                      type="date"
                      value={task.due_date ? task.due_date.split("T")[0] : ""}
                      onChange={(e) =>
                        updateTask.mutate({
                          id: task.id,
                          data: { due_date: e.target.value ? new Date(e.target.value).toISOString() : null },
                        })
                      }
                      className="bg-white/5 border-white/10 text-xs h-9 pl-9 text-white focus:border-primary/50"
                    />
                    <Calendar className="absolute left-3 top-2.5 text-white/30" size={14} />
                  </div>
                </div>

                {/* Creator Details */}
                <div className="space-y-1.5 pt-4 border-t border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/30">MetaData</span>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-white/40">Created by</span>
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-white/40" />
                      <span className="text-white/80 font-medium">{task.owner?.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-white/40">Created at</span>
                    <span className="text-white/80">{formatDate(task.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-white/40">Updated at</span>
                    <span className="text-white/80">{formatDate(task.updated_at)}</span>
                  </div>
                </div>

                {/* Tags List */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <span className="text-xs text-white/50 flex items-center gap-1.5">
                    <Tag size={12} />
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags && task.tags.length > 0 ? (
                      task.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/60">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/20 italic">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
