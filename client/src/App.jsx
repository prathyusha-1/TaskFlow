import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Circle, ClipboardList, Clock3, LayoutDashboard,
  ListTodo, Plus, Search, Trash2, Pencil, X, CalendarDays,
  AlertCircle, RefreshCw
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const emptyForm = { title: "", description: "", priority: "Medium", status: "Pending", dueDate: "" };
const statuses = ["All", "Pending", "In Progress", "Completed"];

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed. Please try again.");
  return data;
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "All") params.set("status", statusFilter);
      const data = await request(`/tasks?${params.toString()}`);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    progress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length
  }), [tasks]);

  function openCreate() {
    setEditingTask(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
    });
    setError("");
    setModalOpen(true);
  }

  async function saveTask(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      if (editingTask) {
        await request(`/tasks/${editingTask._id}`, { method: "PATCH", body: JSON.stringify(payload) });
        setNotice("Task updated successfully.");
      } else {
        await request("/tasks", { method: "POST", body: JSON.stringify(payload) });
        setNotice("Task created successfully.");
      }
      setModalOpen(false);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(task) {
    const nextStatus = task.status === "Pending" ? "In Progress" :
      task.status === "In Progress" ? "Completed" : "Pending";
    try {
      await request(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      setNotice(`Task moved to ${nextStatus}.`);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await request(`/tasks/${task._id}`, { method: "DELETE" });
      setNotice("Task deleted.");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(id);
  }, [notice]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><ListTodo size={23} /></span><span>TaskFlow</span></div>
        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active"><LayoutDashboard size={18} /> Overview</div>
        <div className="nav-item"><ClipboardList size={18} /> My Tasks</div>
        <div className="sidebar-note">
          <div className="note-icon"><CheckCircle2 size={20} /></div>
          <strong>Small steps, big progress.</strong>
          <p>Keep your priorities clear and make today count.</p>
        </div>
        <div className="sidebar-footer"><span className="avatar">PR</span><div><strong>My Workspace</strong><small>Personal task board</small></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="topbar-right"><span className="today-label"><CalendarDays size={15} /> Your productivity space</span><span className="avatar small">PR</span></div>
        </header>

        <section className="page-heading">
          <div><p className="eyebrow">YOUR WORKSPACE</p><h1>Good work starts here <span>✦</span></h1><p className="subtitle">Plan your day, focus on what matters, and track your progress.</p></div>
          <button className="primary-btn" onClick={openCreate}><Plus size={18} /> Add new task</button>
        </section>

        {notice && <div className="notice"><CheckCircle2 size={17} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15} /></button></div>}
        {error && !modalOpen && <div className="error-banner"><AlertCircle size={18} />{error}<button onClick={loadTasks}><RefreshCw size={15} /> Retry</button></div>}

        <section className="stats-grid">
          <StatCard label="Tasks shown" value={stats.total} icon={<ListTodo />} tone="purple" helper="Current view" />
          <StatCard label="Pending" value={stats.pending} icon={<Circle />} tone="orange" helper="Waiting to start" />
          <StatCard label="In progress" value={stats.progress} icon={<Clock3 />} tone="blue" helper="Work in motion" />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 />} tone="green" helper="Nicely done" />
        </section>

        <section className="tasks-panel">
          <div className="panel-heading"><div><h2>Your tasks</h2><p>Everything you need to get done, in one place.</p></div><span className="task-count">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span></div>
          <div className="toolbar">
            <label className="search-box"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" /></label>
            <div className="filter-tabs" role="group" aria-label="Filter tasks">
              {statuses.map((status) => <button key={status} className={statusFilter === status ? "filter-tab selected" : "filter-tab"} onClick={() => setStatusFilter(status)}>{status}</button>)}
            </div>
          </div>

          {loading ? <div className="state-message"><span className="spinner" />Loading tasks...</div> :
            tasks.length === 0 ? <div className="empty-state"><div className="empty-icon"><ClipboardList size={27} /></div><h3>{search || statusFilter !== "All" ? "No matching tasks" : "Your task list is ready"}</h3><p>{search || statusFilter !== "All" ? "Try another search or filter." : "Add your first task and start organizing your day."}</p>{!search && statusFilter === "All" && <button className="primary-btn" onClick={openCreate}><Plus size={17} /> Create your first task</button>}</div> :
            <div className="task-list">{tasks.map((task) => <TaskRow key={task._id} task={task} onEdit={openEdit} onDelete={deleteTask} onChangeStatus={changeStatus} />)}</div>
          }
        </section>
        <footer className="footer">Built with React, Express, Node.js & MongoDB <span>•</span> TaskFlow</footer>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-heading"><div><p className="eyebrow">{editingTask ? "KEEP IT UPDATED" : "MAKE IT HAPPEN"}</p><h2 id="modal-title">{editingTask ? "Edit task" : "Create a task"}</h2></div><button className="icon-btn" onClick={() => setModalOpen(false)} aria-label="Close"><X size={20} /></button></div>
          <form onSubmit={saveTask}>
            <label className="field-label">Task title <span>*</span><input autoFocus maxLength={120} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Finish project documentation" /></label>
            <label className="field-label">Description<textarea maxLength={1000} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add a few details (optional)" /></label>
            <div className="form-row"><label className="field-label">Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label><label className="field-label">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Pending</option><option>In Progress</option><option>Completed</option></select></label></div>
            <label className="field-label">Due date<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
            {error && <div className="form-error"><AlertCircle size={16} />{error}</div>}
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : editingTask ? "Save changes" : <><Plus size={17} /> Create task</>}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function StatCard({ label, value, icon, tone, helper }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><p className="stat-label">{label}</p><div className="stat-value">{value}</div><p className="stat-helper">{helper}</p></article>;
}

function TaskRow({ task, onEdit, onDelete, onChangeStatus }) {
  const due = task.dueDate ? new Date(`${task.dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;
  return <article className="task-row">
    <button className={`task-check ${task.status === "Completed" ? "checked" : ""}`} onClick={() => onChangeStatus(task)} title={`Change status from ${task.status}`} aria-label={`Change status for ${task.title}`}>{task.status === "Completed" ? <CheckCircle2 size={21} /> : <Circle size={21} />}</button>
    <div className="task-main"><h3 className={task.status === "Completed" ? "task-title completed" : "task-title"}>{task.title}</h3>{task.description && <p className="task-description">{task.description}</p>}<div className="task-meta"><span className={`priority ${task.priority.toLowerCase()}`}><i />{task.priority} priority</span><span className={`status-pill ${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span>{due && <span className="due-date"><CalendarDays size={13} />{due}</span>}</div></div>
    <div className="task-actions"><button className="icon-btn" onClick={() => onEdit(task)} title="Edit task" aria-label={`Edit ${task.title}`}><Pencil size={16} /></button><button className="icon-btn delete-btn" onClick={() => onDelete(task)} title="Delete task" aria-label={`Delete ${task.title}`}><Trash2 size={16} /></button></div>
  </article>;
}

export default App;
