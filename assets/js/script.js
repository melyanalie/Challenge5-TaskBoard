// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
    let cardColor = '';
    const deadline = new Date(task.deadline);
    const today = new Date();

    if (deadline < today) {
        cardColor = 'red';
    } else if (deadline - today < 3 * 24 * 60 * 60 * 1000) {
        cardColor = 'yellow';
    }

    return `
        <div class="task-card card mb-3" id="task-${task.id}" style="background-color: ${cardColor}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small>Due: ${task.deadline}</small></p>
                <button class="btn btn-danger delete-task">Delete</button>
            </div>
        </div>`;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        $(`#${task.status}-cards`).append(taskCard);
    });

    $(".task-card").draggable({
        revert: "invalid",
        stack: ".task-card"
    });

    $(".lane").droppable({
        accept: ".task-card",
        drop: handleDrop
    });
    
    localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const title = $('#task-title').val();
    const description = $('#task-desc').val();
    const deadline = $('#task-deadline').val();

    const newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        deadline: deadline,
        status: "todo"
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));

    renderTaskList();
    $('#formModal').modal('hide');
    $('#task-form')[0].reset();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task-card').attr('id').replace('task-', '');
    taskList = taskList.filter(task => task.id !== parseInt(taskId));
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(_event, ui) {
    const taskId = ui.draggable.attr('id').replace('task-', '');
    const newStatus = $(this).attr('id').replace('-cards', '');

    const task = taskList.find(task => task.id === parseInt(taskId));
    if (task) {
        task.status = newStatus;
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#task-form').on('submit', handleAddTask);
    $(document).on('click', '.delete-task', handleDeleteTask);
});