document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.querySelector(".add-task input");
  const addTaskBtn = document.querySelector(".add-task .btn");
  const itemList = document.querySelector(".item-list");
  const deleteAllBtn = document.querySelector(".btn--secondary:first-of-type");
  const clearCompletedBtn = document.querySelector(
    ".btn--secondary:last-of-type"
  );
  const emptyListSection = document.querySelector(".empty-list");

  // Global variable to track which task is being edited
  let editingTask = null;

  // Toggle empty-state message
  const toggleEmptyState = () => {
    if (itemList.children.length === 0) {
      emptyListSection.style.display = "flex";
    } else {
      emptyListSection.style.display = "none";
    }
  };

  // Load tasks from local storage
  const loadTasks = () => {
    itemList.innerHTML = "";
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
      const newTask = duplicateTask(task.text, task.completed);
      itemList.appendChild(newTask);
    });
    toggleEmptyState();
  };

  // Save tasks to local storage
  const saveTasks = () => {
    const tasks = [...itemList.children].map((item) => ({
      text: item.querySelector("label span").textContent.trim(),
      completed: item.querySelector("input[type='checkbox']").checked,
    }));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    toggleEmptyState();
  };

  // Duplicate a task element from a template
  const duplicateTask = (text, completed = false) => {
    // Try to get the first static task as a template

    // If no template exists, create one manually
    templateTask = document.createElement("li");
    templateTask.classList.add("item");
    templateTask.innerHTML = `
          <label>
            <input type="checkbox" />
            <span></span>
          </label>
          <div class="buttons">
            <button class="item-btn edit-btn">✏️</button>
            <button class="item-btn delete-btn">❌</button>
          </div>
        `;

    const checkbox = templateTask.querySelector("input[type='checkbox']");
    const span = templateTask.querySelector("label span");

    checkbox.checked = completed;
    span.textContent = text;

    // Update checkbox event
    // Remove any previous listener by cloning the node for safety if needed
    checkbox.addEventListener("change", saveTasks);

    // Edit task: load text into input box and change button text
    templateTask.querySelector(".edit-btn").addEventListener("click", () => {
      taskInput.value = span.textContent;
      addTaskBtn.textContent = "Edit Task";
      editingTask = templateTask;
      taskInput.focus();
    });

    // Delete task
    templateTask.querySelector(".delete-btn").addEventListener("click", () => {
      templateTask.remove();
      // Cancel editing if the task being edited is deleted
      if (editingTask === templateTask) {
        editingTask = null;
        addTaskBtn.textContent = "Add Task";
        taskInput.value = "";
      }
      saveTasks();
    });

    return templateTask;
  };

  // Add new task or update an existing one
  addTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text === "") {
      alert("Please enter a task");
      return;
    }
    if (editingTask) {
      // Update the existing task
      editingTask.querySelector("label span").textContent = text;
      editingTask = null;
      addTaskBtn.textContent = "Add Task";
      taskInput.value = "";
      saveTasks();
    } else {
      // Create a new task
      const newTask = duplicateTask(text);
      itemList.appendChild(newTask);
      taskInput.value = "";
      saveTasks();
    }
  });

  // Delete all tasks
  deleteAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
      itemList.innerHTML = "";
      saveTasks();
    }
  });

  // Clear completed tasks
  clearCompletedBtn.addEventListener("click", () => {
    document.querySelectorAll(".item-list .item").forEach((item) => {
      if (item.querySelector("input[type='checkbox']").checked) {
        if (editingTask === item) {
          editingTask = null;
          addTaskBtn.textContent = "Add Task";
          taskInput.value = "";
        }
        item.remove();
      }
    });
    saveTasks();
  });

  loadTasks();
});
