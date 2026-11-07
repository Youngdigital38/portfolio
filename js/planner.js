/* ==========================================================
   planner.js - Academic Planner
   Features: add tasks, mark as completed, delete, filter,
   live counters, an animated progress bar, and saving to localStorage.

   The code is split in two parts:
   1) Plain functions that work on an array of task objects
   2) The part that talks to the page (DOM) and handles events
   ========================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "young-planner-tasks-v1";

  /* ---------------------------------------------------------
     PART 1 - Functions that work on the tasks array
     --------------------------------------------------------- */

  // A task is an object: { id, title, course, due, done, created }
  function createTask(title, course, due) {
    var cleanTitle = String(title || "").trim();
    if (cleanTitle === "") return null; // nothing to add

    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: cleanTitle,
      course: course || "General",
      due: due || "",
      done: false,
      created: Date.now()
    };
  }

  // Returns a NEW array where the chosen task has its "done" value flipped
  function toggleTask(tasks, id) {
    return tasks.map(function (task) {
      if (task.id !== id) return task;
      return Object.assign({}, task, { done: !task.done });
    });
  }

  // Returns a NEW array without the chosen task
  function deleteTask(tasks, id) {
    return tasks.filter(function (task) { return task.id !== id; });
  }

  // Returns a NEW array containing only the tasks that are not completed
  function clearCompleted(tasks) {
    return tasks.filter(function (task) { return !task.done; });
  }

  // filter is "all", "pending" or "completed"
  function filterTasks(tasks, filter) {
    if (filter === "pending") return tasks.filter(function (t) { return !t.done; });
    if (filter === "completed") return tasks.filter(function (t) { return t.done; });
    return tasks.slice();
  }

  function countTasks(tasks) {
    var done = tasks.filter(function (t) { return t.done; }).length;
    return { total: tasks.length, done: done, pending: tasks.length - done };
  }

  // todayISO looks like "2026-10-17" - ISO dates compare correctly as text
  function isOverdue(task, todayISO) {
    return !task.done && task.due !== "" && task.due < todayISO;
  }

  function todayISO() {
    var d = new Date();
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
  }

  function formatDate(iso) {
    var parts = iso.split("-");
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  // Make the logic available for testing in Node (does nothing in the browser)
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      createTask: createTask, toggleTask: toggleTask, deleteTask: deleteTask,
      clearCompleted: clearCompleted, filterTasks: filterTasks,
      countTasks: countTasks, isOverdue: isOverdue
    };
  }

  /* ---------------------------------------------------------
     PART 2 - The page (DOM) and event handling
     --------------------------------------------------------- */
  if (typeof document === "undefined") return;

  var form = document.getElementById("task-form");
  var titleInput = document.getElementById("task-title");
  var courseInput = document.getElementById("task-course");
  var dueInput = document.getElementById("task-due");
  var errorBox = document.getElementById("task-error");
  var listEl = document.getElementById("task-list");
  var emptyEl = document.getElementById("empty-state");
  var clearBtn = document.getElementById("clear-completed");
  var progressText = document.getElementById("progress-text");
  var progressFill = document.getElementById("progress-fill");
  var filterButtons = document.querySelectorAll(".filter-btn");

  if (!form || !listEl) return;

  var tasks = loadTasks();
  var currentFilter = "all";

  // ----- Saving and loading (localStorage may be blocked, so we use try/catch) -----
  function loadTasks() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) return sampleTasks(); // very first visit
      var parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return sampleTasks();
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      /* Saving is a bonus. The planner still works without it. */
    }
  }

  function sampleTasks() {
    return [
      createTask("Practise the COS 102 mock exam", "COS 102", ""),
      createTask("Revise Kirchhoff's rules", "PHY 102", "")
    ];
  }

  // ----- Drawing the list -----
  function render() {
    // Remove everything, then rebuild the list from the array
    listEl.innerHTML = "";
    var visible = filterTasks(tasks, currentFilter);
    var today = todayISO();

    visible.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "task" + (task.done ? " completed" : "");
      li.setAttribute("data-id", task.id);

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.setAttribute("aria-label", "Mark \"" + task.title + "\" as completed");
      checkbox.setAttribute("data-action", "toggle");

      var info = document.createElement("div");
      var title = document.createElement("p");
      title.className = "task-title";
      title.textContent = task.title; // textContent keeps user text safe

      var meta = document.createElement("div");
      meta.className = "task-meta";

      var courseBadge = document.createElement("span");
      courseBadge.className = "badge";
      courseBadge.textContent = task.course;
      meta.appendChild(courseBadge);

      if (task.due) {
        var due = document.createElement("span");
        due.textContent = "Due " + formatDate(task.due);
        meta.appendChild(due);
      }
      if (isOverdue(task, today)) {
        var late = document.createElement("span");
        late.className = "badge overdue";
        late.textContent = "Overdue";
        meta.appendChild(late);
      }

      info.appendChild(title);
      info.appendChild(meta);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-danger";
      del.textContent = "Delete";
      del.setAttribute("data-action", "delete");
      del.setAttribute("aria-label", "Delete task \"" + task.title + "\"");

      li.appendChild(checkbox);
      li.appendChild(info);
      li.appendChild(del);
      listEl.appendChild(li);
    });

    updateEmptyState(visible.length);
    updateCounters();
  }

  function updateEmptyState(visibleCount) {
    var messages = {
      all: "<strong>No tasks here yet.</strong><br>Add your first task using the form.",
      pending: "<strong>Nothing pending.</strong><br>Great job, you're all caught up!",
      completed: "<strong>No completed tasks yet.</strong><br>Tick a task to see it here."
    };
    emptyEl.querySelector("p").innerHTML = messages[currentFilter];
    emptyEl.style.display = visibleCount === 0 ? "block" : "none";
  }

  function updateCounters() {
    var counts = countTasks(tasks);
    document.getElementById("count-total").textContent = counts.total;
    document.getElementById("count-pending").textContent = counts.pending;
    document.getElementById("count-done").textContent = counts.done;

    var percent = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);
    progressText.textContent = counts.total === 0 ? "Nothing planned yet" : percent + "% complete";

    // Grow or shrink the coloured bar (the CSS transition makes it slide smoothly)
    if (progressFill) {
      progressFill.style.width = percent + "%";
      progressFill.parentNode.setAttribute("aria-valuenow", String(percent));
    }
    clearBtn.disabled = counts.done === 0;
    clearBtn.style.opacity = counts.done === 0 ? "0.4" : "1";
  }

  // ----- Event: add a task -----
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var task = createTask(titleInput.value, courseInput.value, dueInput.value);
    if (task === null) {
      errorBox.textContent = "Please type a task before adding it.";
      titleInput.focus();
      return;
    }

    errorBox.textContent = "";
    tasks.unshift(task); // newest task goes to the top
    saveTasks();
    form.reset();
    titleInput.focus();
    render();
  });

  titleInput.addEventListener("input", function () {
    if (titleInput.value.trim() !== "") errorBox.textContent = "";
  });

  // ----- Events: complete or delete (one listener for the whole list) -----
  listEl.addEventListener("change", function (event) {
    if (event.target.getAttribute("data-action") !== "toggle") return;
    var id = event.target.closest("li").getAttribute("data-id");
    tasks = toggleTask(tasks, id);
    saveTasks();
    render();
  });

  listEl.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button || button.getAttribute("data-action") !== "delete") return;
    var id = button.closest("li").getAttribute("data-id");
    tasks = deleteTask(tasks, id);
    saveTasks();
    render();
  });

  // ----- Events: filter buttons and "Clear completed" -----
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.getAttribute("data-filter");
      filterButtons.forEach(function (b) { b.classList.toggle("active", b === btn); });
      render();
    });
  });

  clearBtn.addEventListener("click", function () {
    tasks = clearCompleted(tasks);
    saveTasks();
    render();
  });

  render();
})();
