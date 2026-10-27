
import { useEffect, useState } from "react";
import "./App.css";

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("taskflow-tasks");
      if (saved !== null) return JSON.parse(saved);
    } catch (error) {
      console.error("Unable to load tasks:", error);
    }

    return [
      {
        id: 1,
        title: "Learn React basics",
        completed: true,
        priority: "medium",
        dueDate: "",
      },
      {
        id: 2,
        title: "Build my first project",
        completed: false,
        priority: "high",
        dueDate: "",
      },
      {
        id: 3,
        title: "Practice JavaScript",
        completed: false,
        priority: "low",
        dueDate: "",
      },
    ];
  });

  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("taskflow-theme") === "dark"
  );

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [showSettings, setShowSettings] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() =>
    getDateKey(new Date())
  );

  useEffect(() => {
    try {
      localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Unable to save tasks:", error);
    }
  }, [tasks]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);

    try {
      localStorage.setItem(
        "taskflow-theme",
        darkMode ? "dark" : "light"
      );
    } catch (error) {
      console.error("Unable to save theme:", error);
    }

    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, [darkMode]);

  function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.trim(),
      completed: false,
      priority: newPriority,
      dueDate: newDueDate,
    };

    setTasks((previous) => [...previous, task]);
    setNewTask("");
    setNewPriority("medium");
    setNewDueDate("");
  }

  function toggleTask(id) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((previous) =>
      previous.filter((task) => task.id !== id)
    );

    if (editingId === id) cancelEdit();
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditText(task.title);
    setEditPriority(task.priority || "medium");
    setEditDueDate(task.dueDate || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setEditPriority("medium");
    setEditDueDate("");
  }

  function saveEdit(id) {
    if (!editText.trim()) return;

    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? {
              ...task,
              title: editText.trim(),
              priority: editPriority,
              dueDate: editDueDate,
            }
          : task
      )
    );

    cancelEdit();
  }

  function openDashboard() {
    setActiveMenu("Dashboard");
    setShowSettings(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openMyTasks() {
    setActiveMenu("My Tasks");
    setShowSettings(false);

    setTimeout(() => {
      document.getElementById("my-tasks")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function openSettings() {
    setActiveMenu("Settings");
    setShowSettings(true);

    setTimeout(() => {
      document.getElementById("settings-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function clearAllTasks() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all tasks? This cannot be undone."
    );

    if (confirmed) {
      setTasks([]);
      cancelEdit();
    }
  }

  const today = getDateKey(new Date());

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  );

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  const overdueTasks = pendingTasks.filter(
    (task) => task.dueDate && task.dueDate < today
  );

  const dueTodayTasks = pendingTasks.filter(
    (task) => task.dueDate === today
  );

  const upcomingTasks = pendingTasks.filter(
    (task) => task.dueDate && task.dueDate > today
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed) ||
      (filter === "overdue" &&
        !task.completed &&
        task.dueDate &&
        task.dueDate < today) ||
      (filter === "today" &&
        !task.completed &&
        task.dueDate === today) ||
      (filter === "upcoming" &&
        !task.completed &&
        task.dueDate &&
        task.dueDate > today);

    return matchesSearch && matchesFilter;
  });

  function formatDate(date) {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getDeadlineStatus(task) {
    if (!task.dueDate || task.completed) return "";
    if (task.dueDate < today) return "Overdue";
    if (task.dueDate === today) return "Due today";
    return "";
  }

  const monthYear = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1
  ).getDay();

  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const selectedDateTasks = tasks.filter(
    (task) => task.dueDate === selectedDate
  );

  function changeMonth(amount) {
    setCalendarMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + amount,
          1
        )
    );
  }

  function goToToday() {
    const now = new Date();

    setCalendarMonth(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );
    setSelectedDate(getDateKey(now));
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>✦ TaskFlow</h2>

        <p className="menu-label">WORKSPACE</p>

        <button
          type="button"
          className={`menu-item ${
            activeMenu === "Dashboard" ? "active" : ""
          }`}
          onClick={openDashboard}
        >
          ▦ Dashboard
        </button>

        <button
          type="button"
          className={`menu-item ${
            activeMenu === "My Tasks" ? "active" : ""
          }`}
          onClick={openMyTasks}
        >
          ✓ My Tasks
        </button>

        <button
          type="button"
          className={`menu-item ${
            activeMenu === "Settings" ? "active" : ""
          }`}
          onClick={openSettings}
        >
          ⚙ Settings
        </button>

        <div className="sidebar-bottom">
          Stay focused. Get things done.
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="greeting">YOUR WORKSPACE</p>
            <h1>
              {activeMenu === "Settings"
                ? "Settings"
                : activeMenu === "My Tasks"
                  ? "My Tasks"
                  : "My Dashboard"}
            </h1>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setDarkMode((previous) => !previous)}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <div className="avatar">A</div>
          </div>
        </header>

        {!showSettings && (
          <>
            <section className="welcome">
              <p>YOUR PRODUCTIVITY SPACE</p>
              <h2>Make today count ✨</h2>
              <span>
                Small steps every day lead to big results.
              </span>
            </section>

            <section className="stats">
              <div className="stat-card">
                <span>Total Tasks</span>
                <h2>{tasks.length}</h2>
              </div>

              <div className="stat-card">
                <span>Completed</span>
                <h2>{completedCount}</h2>
              </div>

              <div className="stat-card">
                <span>Pending</span>
                <h2>{tasks.length - completedCount}</h2>
              </div>
            </section>

            <section className="progress-section">
              <div className="progress-heading">
                <h3>Task Progress</h3>
                <span>{progress}% completed</span>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Task completion progress"
              >
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p>
                {completedCount} of {tasks.length} tasks completed
              </p>
            </section>

            <section className="deadline-section">
              <div className="section-heading">
                <div>
                  <h2>Deadline Overview</h2>
                  <p>Keep track of your upcoming work.</p>
                </div>
              </div>

              <div className="deadline-grid">
                <button
                  type="button"
                  className="deadline-card overdue-card"
                  onClick={() => {
                    setFilter("overdue");
                    openMyTasks();
                  }}
                >
                  <span>Overdue</span>
                  <strong>{overdueTasks.length}</strong>
                  <small>Past deadline</small>
                </button>

                <button
                  type="button"
                  className="deadline-card today-card"
                  onClick={() => {
                    setFilter("today");
                    openMyTasks();
                  }}
                >
                  <span>Due Today</span>
                  <strong>{dueTodayTasks.length}</strong>
                  <small>Needs attention</small>
                </button>

                <button
                  type="button"
                  className="deadline-card upcoming-card"
                  onClick={() => {
                    setFilter("upcoming");
                    openMyTasks();
                  }}
                >
                  <span>Upcoming</span>
                  <strong>{upcomingTasks.length}</strong>
                  <small>Future deadlines</small>
                </button>
              </div>
            </section>

            <section className="calendar-section">
              <div className="calendar-heading">
                <div>
                  <p className="calendar-eyebrow">
                    PLAN YOUR SCHEDULE
                  </p>
                  <h2>Task Calendar</h2>
                  <p>Choose a date to see its tasks.</p>
                </div>

                <button
                  type="button"
                  className="calendar-today-btn"
                  onClick={goToToday}
                >
                  Today
                </button>
              </div>

              <div className="calendar-navigation">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  &#8249;
                </button>

                <h3>{monthYear}</h3>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  &#8250;
                </button>
              </div>

              <div className="calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div className="calendar-weekday" key={day}>
                      {day}
                    </div>
                  )
                )}

                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return (
                      <div
                        className="calendar-empty"
                        key={`empty-${index}`}
                      />
                    );
                  }

                  const dateString = getDateKey(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth(),
                      day
                    )
                  );

                  const dayTasks = tasks.filter(
                    (task) => task.dueDate === dateString
                  );

                  const hasOverdue = dayTasks.some(
                    (task) =>
                      !task.completed && task.dueDate < today
                  );

                  const hasDueToday =
                    dateString === today &&
                    dayTasks.some((task) => !task.completed);

                  const isSelected = selectedDate === dateString;
                  const isToday = dateString === today;

                  const dayClasses = [
                    "calendar-day",
                    isSelected ? "selected-day" : "",
                    isToday ? "today-date" : "",
                    hasOverdue ? "has-overdue" : "",
                    hasDueToday ? "has-due-today" : "",
                    dayTasks.length > 0 ? "has-tasks" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      type="button"
                      key={dateString}
                      className={dayClasses}
                      onClick={() => setSelectedDate(dateString)}
                      aria-label={`${formatDate(dateString)}, ${dayTasks.length} tasks`}
                      aria-pressed={isSelected}
                    >
                      <span className="calendar-day-number">
                        {day}
                      </span>

                      {dayTasks.length > 0 && (
                        <span className="calendar-task-count">
                          {dayTasks.length}{" "}
                          {dayTasks.length === 1 ? "task" : "tasks"}
                        </span>
                      )}

                      {dayTasks.length > 0 && (
                        <span className="calendar-dot" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="calendar-legend">
                <span>
                  <i className="legend-dot purple-dot" /> Has tasks
                </span>
                <span>
                  <i className="legend-dot red-dot" /> Overdue
                </span>
                <span>
                  <i className="legend-dot yellow-dot" /> Due today
                </span>
              </div>

              <div className="selected-date-tasks">
                <div className="selected-date-heading">
                  <div>
                    <p>SELECTED DATE</p>
                    <h3>{formatDate(selectedDate)}</h3>
                  </div>

                  <span>{selectedDateTasks.length} tasks</span>
                </div>

                {selectedDateTasks.length === 0 ? (
                  <p className="calendar-no-tasks">
                    No tasks scheduled for this date.
                  </p>
                ) : (
                  <div className="calendar-task-list">
                    {selectedDateTasks.map((task) => (
                      <div
                        className="calendar-task-item"
                        key={task.id}
                      >
                        <span
                          className={`calendar-task-priority ${
                            task.priority || "medium"
                          }`}
                        />

                        <div className="calendar-task-info">
                          <span
                            className={task.completed ? "done" : ""}
                          >
                            {task.title}
                          </span>

                          <small>
                            {(task.priority || "medium").toUpperCase()}
                            {getDeadlineStatus(task)
                              ? ` · ${getDeadlineStatus(task)}`
                              : ""}
                            {task.completed ? " · Completed" : ""}
                          </small>
                        </div>

                        <button
                          type="button"
                          className="calendar-view-task"
                          onClick={() => {
                            setSearchText("");
                            setFilter("all");
                            openMyTasks();
                          }}
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="task-section" id="my-tasks">
              <div className="section-heading">
                <div>
                  <h2>My Tasks</h2>
                  <p>Organize your day, one task at a time.</p>
                </div>
              </div>

              <form
                className="task-form add-task-form"
                onSubmit={addTask}
              >
                <input
                  type="text"
                  placeholder="What do you need to do?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  aria-label="New task title"
                />

                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  aria-label="Task priority"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  aria-label="New task due date"
                />

                <button type="submit">+ Add Task</button>
              </form>

              <div className="task-toolbar">
                <input
                  type="text"
                  placeholder="🔍 Search tasks..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Filter tasks"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>

              <div className="task-list">
                {filteredTasks.map((task) => (
                  <div className="task-item" key={task.id}>
                    {editingId === task.id ? (
                      <form
                        className="task-form edit-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveEdit(task.id);
                        }}
                      >
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) =>
                            setEditText(e.target.value)
                          }
                          autoFocus
                          aria-label="Edit task title"
                        />

                        <select
                          value={editPriority}
                          onChange={(e) =>
                            setEditPriority(e.target.value)
                          }
                          aria-label="Edit task priority"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>

                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) =>
                            setEditDueDate(e.target.value)
                          }
                          aria-label="Edit due date"
                        />

                        <button type="submit">Save</button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <label className="task-label">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                          />

                          <span
                            className={task.completed ? "done" : ""}
                          >
                            {task.title}
                          </span>
                        </label>

                        <div className="task-details">
                          <span
                            className={`priority-badge ${
                              task.priority || "medium"
                            }`}
                          >
                            {(task.priority || "medium").toUpperCase()}
                          </span>

                          {task.dueDate && (
                            <span className="due-date">
                              <span>
                                Due: {formatDate(task.dueDate)}
                              </span>

                              {getDeadlineStatus(task) && (
                                <span className="deadline-status">
                                  {getDeadlineStatus(task)}
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        <div className="task-actions">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => startEditing(task)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => deleteTask(task.id)}
                            aria-label={`Delete ${task.title}`}
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <p className="empty-message">
                    No tasks found in this category.
                  </p>
                )}

                {filter !== "all" && (
                  <button
                    type="button"
                    className="edit-btn reset-filter"
                    onClick={() => setFilter("all")}
                  >
                    Show All Tasks
                  </button>
                )}
              </div>
            </section>
          </>
        )}

        {showSettings && (
          <section className="settings-panel" id="settings-panel">
            <div className="section-heading">
              <div>
                <h2>Settings</h2>
                <p>Personalize your TaskFlow workspace.</p>
              </div>
            </div>

            <div className="settings-option">
              <div>
                <h3>Appearance</h3>
                <p>Choose the theme for your workspace.</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDarkMode((previous) => !previous)
                }
              >
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            <div className="settings-option">
              <div>
                <h3>Task Summary</h3>
                <p>Your tasks are saved in this browser.</p>
              </div>

              <span>{tasks.length} tasks</span>
            </div>

            <div className="settings-option">
              <div>
                <h3>Completed Tasks</h3>
                <p>Number of tasks you have finished.</p>
              </div>

              <span>{completedCount} completed</span>
            </div>

            <div className="settings-option">
              <div>
                <h3>Clear All Tasks</h3>
                <p>
                  Remove all tasks saved in this browser.
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                className="settings-danger-btn"
                onClick={clearAllTasks}
              >
                Clear Tasks
              </button>
            </div>

            <div className="settings-option">
              <div>
                <h3>About TaskFlow</h3>
                <p>
                  A smart task manager built with React.js.
                </p>
              </div>

              <span>Version 1.0</span>
            </div>

            <button
              type="button"
              className="settings-back-btn"
              onClick={openDashboard}
            >
              ← Back to Dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
