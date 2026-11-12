/**
 * TaskFlow - Modern Todo & Productivity Dashboard
 * Vanilla JavaScript Application Logic
 * 
 * Features:
 * - LocalStorage task persistence
 * - Real-time dashboard statistics (Total, Pending, Completed, Progress Rate)
 * - Filtering (All, Active, Completed)
 * - Form validation and keyboard shortcuts
 * - Animated task state changes & smooth deletion
 */

(function () {
  'use strict';

  // Constants & Storage Keys
  const STORAGE_KEY = 'taskflow_tasks_v1';

  // Default seed tasks for first-time visitors
  const INITIAL_TASKS = [
    {
      id: 'task-1',
      text: 'Design clean responsive dashboard layout',
      completed: true,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'task-2',
      text: 'Implement LocalStorage persistence & statistics',
      completed: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'task-3',
      text: 'Test task filters and keyboard shortcuts (Enter)',
      completed: false,
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'task-4',
      text: 'Review project for internship submission',
      completed: false,
      createdAt: new Date().toISOString()
    }
  ];

  // Application State
  const state = {
    tasks: [],
    currentFilter: 'all', // 'all' | 'active' | 'completed'
  };

  // DOM Elements
  const elements = {
    currentDate: document.getElementById('current-date'),
    statTotal: document.getElementById('stat-total'),
    statPending: document.getElementById('stat-pending'),
    statCompleted: document.getElementById('stat-completed'),
    progressFill: document.getElementById('progress-fill'),
    progressPercent: document.getElementById('progress-percent'),
    taskForm: document.getElementById('task-form'),
    taskInput: document.getElementById('task-input'),
    errorMessage: document.getElementById('error-message'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    countAll: document.getElementById('count-all'),
    countActive: document.getElementById('count-active'),
    countCompleted: document.getElementById('count-completed'),
    btnClearCompleted: document.getElementById('btn-clear-completed'),
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    emptyTitle: document.getElementById('empty-title'),
    emptyDesc: document.getElementById('empty-desc')
  };

  // ==========================================
  // LocalStorage Operations
  // ==========================================

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        state.tasks = JSON.parse(stored);
      } else {
        state.tasks = [...INITIAL_TASKS];
        saveTasks();
      }
    } catch (err) {
      console.error('Failed to load tasks from localStorage:', err);
      state.tasks = [...INITIAL_TASKS];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
    }
  }

  // ==========================================
  // Task Actions
  // ==========================================

  function addTask(rawText) {
    const text = rawText.trim();
    if (!text) {
      showError('Please enter a task before adding.');
      return false;
    }

    hideError();

    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    state.tasks.unshift(newTask);
    saveTasks();
    render();

    elements.taskInput.value = '';
    elements.taskInput.focus();
    return true;
  }

  function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
      taskElement.classList.add('deleting');
      setTimeout(() => {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveTasks();
        render();
      }, 190);
    } else {
      state.tasks = state.tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }
  }

  function clearCompleted() {
    const completedCount = state.tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (confirm(`Are you sure you want to remove ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
      state.tasks = state.tasks.filter(t => !t.completed);
      saveTasks();
      render();
    }
  }

  function setFilter(filter) {
    state.currentFilter = filter;
    elements.filterBtns.forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    render();
  }

  // ==========================================
  // Helper / Utility Functions
  // ==========================================

  function showError(msg) {
    if (!elements.errorMessage) return;
    elements.errorMessage.textContent = msg;
    elements.errorMessage.classList.add('visible');
    elements.taskInput.classList.add('error');
  }

  function hideError() {
    if (!elements.errorMessage) return;
    elements.errorMessage.classList.remove('visible');
    elements.taskInput.classList.remove('error');
  }

  function formatDisplayDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function formatTime(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  // ==========================================
  // Render & UI Updates
  // ==========================================

  function updateStatistics() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const pending = total - completed;

    // Update stat numbers
    if (elements.statTotal) elements.statTotal.textContent = total;
    if (elements.statPending) elements.statPending.textContent = pending;
    if (elements.statCompleted) elements.statCompleted.textContent = completed;

    // Update filter counts
    if (elements.countAll) elements.countAll.textContent = total;
    if (elements.countActive) elements.countActive.textContent = pending;
    if (elements.countCompleted) elements.countCompleted.textContent = completed;

    // Update clear completed button
    if (elements.btnClearCompleted) {
      elements.btnClearCompleted.disabled = completed === 0;
    }

    // Update productivity percentage & bar
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    if (elements.progressPercent) {
      elements.progressPercent.textContent = `${percentage}%`;
    }
    if (elements.progressFill) {
      elements.progressFill.style.width = `${percentage}%`;
    }
  }

  function renderTaskList() {
    const filter = state.currentFilter;
    let filteredTasks = state.tasks;

    if (filter === 'active') {
      filteredTasks = state.tasks.filter(t => !t.completed);
    } else if (filter === 'completed') {
      filteredTasks = state.tasks.filter(t => t.completed);
    }

    // Empty state handling
    if (filteredTasks.length === 0) {
      elements.taskList.innerHTML = '';
      elements.emptyState.classList.remove('hidden');

      if (filter === 'all') {
        elements.emptyTitle.textContent = 'No tasks yet';
        elements.emptyDesc.textContent = 'Stay organized and ahead of your goals by typing a task above and clicking Add Task.';
      } else if (filter === 'active') {
        elements.emptyTitle.textContent = 'All caught up!';
        elements.emptyDesc.textContent = 'You have zero pending tasks. Take a moment to relax or add a new goal.';
      } else if (filter === 'completed') {
        elements.emptyTitle.textContent = 'No completed tasks';
        elements.emptyDesc.textContent = 'Tasks you finish will appear here. Check off items in your list to track accomplishments.';
      }
      return;
    }

    elements.emptyState.classList.add('hidden');

    // Render task items safely using DOM nodes
    elements.taskList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.dataset.taskId = task.id;

      // Left section (checkbox + text + timestamp)
      const leftDiv = document.createElement('div');
      leftDiv.className = 'task-left';

      // Checkbox label container
      const checkboxContainer = document.createElement('label');
      checkboxContainer.className = 'checkbox-container';
      checkboxContainer.setAttribute('aria-label', `Mark task as ${task.completed ? 'incomplete' : 'complete'}`);

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = task.completed;
      input.addEventListener('change', () => toggleTask(task.id));

      const checkmark = document.createElement('span');
      checkmark.className = 'checkmark';
      checkmark.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      checkboxContainer.appendChild(input);
      checkboxContainer.appendChild(checkmark);

      // Task content (text & meta)
      const contentDiv = document.createElement('div');
      contentDiv.className = 'task-content';

      const taskText = document.createElement('span');
      taskText.className = 'task-text';
      taskText.textContent = task.text;
      taskText.title = 'Click to toggle completion';
      taskText.addEventListener('click', () => toggleTask(task.id));

      const metaDiv = document.createElement('div');
      metaDiv.className = 'task-meta';
      const timeStr = formatTime(task.createdAt);
      metaDiv.textContent = timeStr ? `Added at ${timeStr}` : 'Today';

      contentDiv.appendChild(taskText);
      contentDiv.appendChild(metaDiv);

      leftDiv.appendChild(checkboxContainer);
      leftDiv.appendChild(contentDiv);

      // Actions section (Delete button)
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'task-actions';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-icon delete';
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.title = 'Delete task';
      deleteBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });

      actionsDiv.appendChild(deleteBtn);

      li.appendChild(leftDiv);
      li.appendChild(actionsDiv);
      fragment.appendChild(li);
    });

    elements.taskList.appendChild(fragment);
  }

  function render() {
    updateStatistics();
    renderTaskList();
  }

  // ==========================================
  // Event Listeners & Initialization
  // ==========================================

  function bindEvents() {
    // Form submit
    elements.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(elements.taskInput.value);
    });

    // Real-time input error clearing
    elements.taskInput.addEventListener('input', () => {
      if (elements.taskInput.value.trim().length > 0) {
        hideError();
      }
    });

    // Filter button clicks
    elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        setFilter(filter);
      });
    });

    // Clear completed button
    if (elements.btnClearCompleted) {
      elements.btnClearCompleted.addEventListener('click', clearCompleted);
    }
  }

  function init() {
    // Set formatted today's date
    if (elements.currentDate) {
      elements.currentDate.textContent = formatDisplayDate(new Date());
    }

    loadTasks();
    bindEvents();
    render();
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
