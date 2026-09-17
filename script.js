import json, os, textwrap, urllib.parse, urllib.request

JS_CONTENT = textwrap.dedent("""\
    // script.js - Lista de tareas con contador y modo oscuro
    const API_URL = 'https://evo-v9-god-service.onrender.com/api/data';
    const AI_URL = 'https://evo-v9-god-service.onrender.com/api/groq';
    const KEY = '3be71a75d8074780869abb92fb228062';
    const APP = 'app-1789612406';

    // Elementos del DOM
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const list = document.getElementById('todo-list');
    const counter = document.getElementById('counter');
    const toggleDark = document.getElementById('toggle-dark');

    // Estado
    let todos = [];

    // Guardar datos en el backend
    async function saveData() {
        const payload = {
            key: KEY,
            app: APP,
            value: JSON.stringify(todos)
        };
        await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
    }

    // Cargar datos del backend
    async function loadData() {
        const params = new URLSearchParams({key: KEY, app: APP});
        const resp = await fetch(`${API_URL}?${params}`);
        const data = await resp.json();
        if (data && data.value) {
            try {
                todos = JSON.parse(data.value);
            } catch (e) {
                console.error('Error parsing stored todos', e);
                todos = [];
            }
        }
        render();
    }

    // Usar IA para generar una respuesta (ejemplo de uso)
    async function askAI(prompt) {
        const payload = {key: KEY, prompt};
        const resp = await fetch(AI_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const result = await resp.json();
        return result.reply;
    }

    function render() {
        list.innerHTML = '';
        todos.forEach((t, i) => {
            const li = document.createElement('li');
            li.textContent = t;
            const del = document.createElement('button');
            del.textContent = '✕';
            del.onclick = () => removeTodo(i);
            li.appendChild(del);
            list.appendChild(li);
        });
        counter.textContent = `Total: ${todos.length}`;
    }

    function addTodo() {
        const text = todoInput.value.trim();
        if (!text) return;
        todos.push(text);
        todoInput.value = '';
        render();
        saveData();
    }

    function removeTodo(index) {
        todos.splice(index, 1);
        render();
        saveData();
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark');
        const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', mode);
    }

    // Inicialización
    document.addEventListener('DOMContentLoaded', async () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') document.body.classList.add('dark');

        addBtn.onclick = addTodo;
        todoInput.onkeypress = e => { if (e.key === 'Enter') addTodo(); };
        toggleDark.onclick = toggleDarkMode;
        await loadData();
    });
    """)

HTML_TEMPLATE = textwrap.dedent("""\
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Lista de Tareas</title>
        <style>
            body {font-family: Arial, sans-serif; padding: 20px; transition: background 0.3s, color 0.3s;}
            .dark {background:#222;color:#eee;}
            #todo-list li {margin:5px 0;}
            #todo-list button {margin-left:10px;}
        </style>
    </head>
    <body>
        <h1>Lista de Tareas</h1>
        <input id="todo-input" placeholder="Nueva tarea"/>
        <button id="add-btn">Añadir</button>
        <button id="toggle-dark">Modo Oscuro</button>
        <p id="counter">Total: 0</p>
        <ul id="todo-list"></ul>
        <script src="script.js"></script>
    </body>
    </html>
    """)

def write_files():
    os.makedirs('output', exist_ok=True)
    with open(os.path.join('output', 'script.js'), 'w', encoding='utf-8') as f:
        f.write(JS_CONTENT)
    with open(os.path.join('output', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(HTML_TEMPLATE)
    print('Archivos creados en la carpeta "output".')

if __name__ == '__main__':
    write_files()