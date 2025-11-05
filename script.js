// Initialize tasks from localStorage or start with empty arrays
let tasks = {
    todo: JSON.parse(localStorage.getItem('todoTasks')) || [],
    inProgress: JSON.parse(localStorage.getItem('inProgressTasks')) || [],
    done: JSON.parse(localStorage.getItem('doneTasks')) || []
};

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const inProgressList = document.getElementById('inProgressList');
const doneList = document.getElementById('doneList');

// Add new task
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const task = {
            id: Date.now().toString(),
            text: taskText
        };
        tasks.todo.push(task);
        saveToLocalStorage();
        renderTasks();
        taskInput.value = '';
    }
}

// Render all tasks
function renderTasks() {
    todoList.innerHTML = '';
    inProgressList.innerHTML = '';
    doneList.innerHTML = '';

    tasks.todo.forEach(task => createTaskElement(task, todoList));
    tasks.inProgress.forEach(task => createTaskElement(task, inProgressList));
    tasks.done.forEach(task => createTaskElement(task, doneList));
}

// Create task element
function createTaskElement(task, container) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.draggable = true;
    taskElement.id = task.id;
    
    taskElement.innerHTML = `
        <div>${task.text}</div>
        <div class="actions">
            <button class="edit-btn" onclick="editTask('${task.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" onclick="deleteTask('${task.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add drag event listeners
    taskElement.addEventListener('dragstart', dragStart);
    taskElement.addEventListener('dragend', dragEnd);
    
    container.appendChild(taskElement);
}

// Edit task
function editTask(taskId) {
    let taskList;
    let task;
    
    // Find the task in the appropriate list
    for (const [listName, list] of Object.entries(tasks)) {
        const foundTask = list.find(t => t.id === taskId);
        if (foundTask) {
            taskList = listName;
            task = foundTask;
            break;
        }
    }

    if (task) {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveToLocalStorage();
            renderTasks();
        }
    }
}

// Delete task
function deleteTask(taskId) {
    for (const listName in tasks) {
        tasks[listName] = tasks[listName].filter(task => task.id !== taskId);
    }
    saveToLocalStorage();
    renderTasks();
}

// Drag and Drop functionality
function dragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.id);
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const taskElement = document.getElementById(taskId);
    
    // Find the source list
    let sourceList;
    let task;
    for (const [listName, list] of Object.entries(tasks)) {
        const foundTask = list.find(t => t.id === taskId);
        if (foundTask) {
            sourceList = listName;
            task = foundTask;
            break;
        }
    }

    // Find target list
    let targetList;
    if (e.target.closest('#todoList')) targetList = 'todo';
    else if (e.target.closest('#inProgressList')) targetList = 'inProgress';
    else if (e.target.closest('#doneList')) targetList = 'done';

    if (sourceList && targetList && sourceList !== targetList) {
        // Remove from source list
        tasks[sourceList] = tasks[sourceList].filter(t => t.id !== taskId);
        // Add to target list
        tasks[targetList].push(task);
        saveToLocalStorage();
        renderTasks();
    }
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks.todo));
    localStorage.setItem('inProgressTasks', JSON.stringify(tasks.inProgress));
    localStorage.setItem('doneTasks', JSON.stringify(tasks.done));
}

// Initial render
renderTasks();