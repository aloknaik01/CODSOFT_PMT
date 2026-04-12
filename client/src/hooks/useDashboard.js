import { useSelector } from "react-redux";
import { useMemo } from "react";

export default function useDashboard() {
  const { list: projects, loading: projectsLoading } = useSelector(
    (state) => state.projects
  );
  const { list: tasks, loading: tasksLoading } = useSelector(
    (state) => state.tasks
  );

  const loading = projectsLoading || tasksLoading;

  const stats = useMemo(() => {
    const totalProjects    = projects.length;
    const activeProjects   = projects.filter((p) => p.status === "active").length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;

    const totalTasks     = projects.reduce((sum, p) => sum + Number(p.total_tasks     ?? 0), 0);
    const completedTasks = projects.reduce((sum, p) => sum + Number(p.completed_tasks ?? 0), 0);
    const todoTasks      = tasks.filter((t) => t.status === "todo").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const doneTasks      = tasks.filter((t) => t.status === "done").length;

    // Unique members across all projects (by id)
    const memberIds = new Set(
      projects.flatMap((p) => (p.members ?? []).map((m) => m.id))
    );

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      totalMembers: memberIds.size,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }, [projects, tasks]);

  // Data for the task-status donut / bar chart
  const taskStatusData = useMemo(() => [
    { name: "To Do",       value: stats.todoTasks,       color: "#94A3B8" },
    { name: "In Progress", value: stats.inProgressTasks, color: "#6366F1" },
    { name: "Done",        value: stats.doneTasks,        color: "#10B981" },
  ], [stats]);

  // Data for the project progress bar chart (top 6 projects)
  const projectProgressData = useMemo(() =>
    projects
      .slice(0, 6)
      .map((p) => ({
        name:      p.title.length > 18 ? p.title.slice(0, 16) + "…" : p.title,
        total:     Number(p.total_tasks     ?? 0),
        completed: Number(p.completed_tasks ?? 0),
        pct:
          Number(p.total_tasks) > 0
            ? Math.round((Number(p.completed_tasks) / Number(p.total_tasks)) * 100)
            : 0,
      })),
  [projects]);

  // 5 most recently created projects
  const recentProjects = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5),
  [projects]);

  return {
    stats,
    taskStatusData,
    projectProgressData,
    recentProjects,
    loading,
  };
}