const API_URL = 'https://672de0dafd8979715644172a.mockapi.io/api/temp';
let todos = [];

// Show alert message
function showAlert(message, type) {
    const alert = document.getElementById(`${type}Alert`);
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// Toggle loading indicator
function toggleLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
}

// Fetch todos
async function fetchTodos() {
    try {
        toggleLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch todos');
        const data = await response.json();
        
        // Transform the data to ensure all required properties are present
        todos = data.map(todo => ({
            id: todo.id,
            title: todo.title,
            completed: todo.completed || false,
            userId: todo.userId || 1
        }));
        
        renderTodos();
        showAlert('Todos loaded successfully', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
        console.error('Error fetching todos:', error);
    } finally {
        toggleLoading(false);
    }
}

// Create new todo
async function createTodo() {
    const input = document.getElementById('todoInput');
    const title = input.value.trim();
    
    if (!title) {
        showAlert('Please enter a todo title', 'error');
        return;
    }

    try {
        toggleLoading(true);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                completed: false,
                userId: 1
            })
        });

        if (!response.ok) throw new Error('Failed to create todo');
        const newTodo = await response.json();
        
        todos.unshift(newTodo);
        renderTodos();
        input.value = '';
        showAlert('Todo created successfully', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
        console.error('Error creating todo:', error);
    } finally {
        toggleLoading(false);
    }
}

// Update todo
async function updateTodo(id) {
    const todo = todos.find(t => t.id === id);
    const newTitle = prompt('Update todo:', todo.title);
    
    if (!newTitle) return;

    try {
        toggleLoading(true);
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...todo,
                title: newTitle
            })
        });

        if (!response.ok) throw new Error('Failed to update todo');
        
        todos = todos.map(t => t.id === id ? { ...t, title: newTitle } : t);
        renderTodos();
        showAlert('Todo updated successfully', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
        console.error('Error updating todo:', error);
    } finally {
        toggleLoading(false);
    }
}

// Toggle todo completion
async function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    
    try {
        toggleLoading(true);
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...todo,
                completed: !todo.completed
            })
        });

        if (!response.ok) throw new Error('Failed to update todo');
        
        todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        renderTodos();
        showAlert('Todo status updated successfully', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
        console.error('Error toggling todo completion:', error);
    } finally {
        toggleLoading(false);
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        toggleLoading(true);
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete todo');
        
        todos = todos.filter(t => t.id !== id);
        renderTodos();
        showAlert('Todo deleted successfully', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
        console.error('Error deleting todo:', error);
    } finally {
        toggleLoading(false);
    }
}

// Render todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-content">
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onchange="toggleComplete('${todo.id}')"
                >
                <span>${todo.title}</span>
            </div>
            <div class="todo-actions">
                <button class="edit" onclick="updateTodo('${todo.id}')">Edit</button>
                <button class="delete" onclick="deleteTodo('${todo.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchTodos);

// Add keyboard event listener for creating todos
document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        createTodo();
    }
});