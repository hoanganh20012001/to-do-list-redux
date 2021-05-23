const todoList = document.querySelector(".todo-list");
const createNewTodo = document.querySelector(".new-todo");
const footer = document.querySelector(".footer");
const toggleAll = document.querySelector(".toggle-all");

const ADD = "ADD";
const TOGGLE_CHECKED = "TOGGLE_CHECKED";
const DELETE = "DELETE";
const UPDATE = "UPDATE";
const EDIT = "EDIT";
const CHANGE_FILTER = "CHANGE_FILTER";
const TOGGLE_ALL = "TOGGLE_ALL";
const DELETE_ALL = "DELETE_ALL";

const { createStore } = Redux;

const init = {
    filter: "All",
    todos: [],
    editIndex: null,
    filters: {
        All: () => true,
        Active: (todo) => !todo.completed,
        Completed: (todo) => todo.completed,
    },
    isComplete: false,
};

//  Actions

const add = (title) => {
    return {
        type: ADD,
        payload: title,
    };
};

const toggleChecked = (index) => {
    return {
        type: TOGGLE_CHECKED,
        payload: index,
    };
};

const deleteTodo = (index) => {
    return {
        type: DELETE,
        payload: index,
    };
};

const updateTodo = (index) => {
    return {
        type: UPDATE,
        payload: index,
    };
};

const editTodo = (value, index) => {
    return {
        type: EDIT,
        payload: {
            value,
            index,
        },
    };
};

const changeFilter = (filter) => {
    return {
        type: CHANGE_FILTER,
        payload: filter,
    };
};

const toggleAllTodo = () => {
    return {
        type: TOGGLE_ALL,
    };
};

const clearAll = () => {
    return {
        type: DELETE_ALL,
    };
};

// Reducer
const reducer = function (state = init, action) {
    switch (action.type) {
        case ADD:
            state.todos.push({
                title: action.payload,
                completed: false,
            });
            return state;
        case TOGGLE_CHECKED:
            const todo = state.todos[action.payload];
            todo.completed = !todo.completed;
            state.todos.splice(action.payload, 1, todo);
            return state;
        case DELETE:
            state.todos.splice(action.payload, 1);
            return state;
        case UPDATE:
            const currentIndex = action.payload;
            state.editIndex = currentIndex;
            return state;
        case EDIT:
            const currenIndex = action.payload.index;
            const currentTodoEdit = state.todos[currenIndex];
            currentTodoEdit.title = action.payload.value;
            state.editIndex = null;
            state.todos.splice(currenIndex, 1, currentTodoEdit);
            return state;
        case CHANGE_FILTER:
            let filter = state.filter;
            filter = action.payload;
            return {
                ...state,
                filter,
            };
        case TOGGLE_ALL:
            const todosAll = state.todos;
            const isComplete = state.isComplete;
            todosAll.forEach((todo) => {
                if (isComplete) {
                    todo.completed = false;
                    state.isComplete = false;
                } else {
                    todo.completed = true;
                    state.isComplete = true;
                }
            });
            state.todos = todosAll;
            return state;
        case DELETE_ALL:
            state.todos = [];
            return state;
        default:
            return state;
    }
};

// Store
const store = createStore(reducer);

//  Render
const render = function () {
    const todos = store.getState().todos;
    const editIndex = store.getState().editIndex;
    const filters = store.getState().filters;
    const filter = store.getState().filter;

    const htmls = todos.filter(filters[filter]).map(
        (todo, index) => `
            <li 
                class="
                    ${todo.completed ? " completed" : ""} 
                    ${editIndex === index ? "editing" : ""}
                "
            >
                <div class="view">
                    <input class="toggle" type="checkbox" ${todo.completed ? " checked" : " unchecked"
            } onclick="handleToggleChecked(${index})">
                    <label
                        ondblclick="handleUpdateTodo(${index})"
                    >
                        ${todo.title}
                    </label>
                    <button class="destroy" onclick="handleDeleteTodo(${index})"></button>
                </div>
                <input 
                    class="edit" 
                    value="${todo.title}"
                    onkeyup="handleEditTodo(${index})"
                >
            </li>  
    `
    );

    const htmlFooters = `
        <span class="todo-count"><strong>${filter === "All"
            ? todos.filter(filters.Active).length
            : todos.filter(filters[filter]).length
        }</strong> item left</span>
        <ul class="filters">
            <li >
                <a class="${filter === "All" && "selected"
        }" onclick="store.dispatch(changeFilter('All'))" href="#/">All</a>
            </li>
            <li >
                <a class="${filter === "Active" && "selected"
        }" onclick="store.dispatch(changeFilter('Active'))" href="#/active">Active</a>
            </li>
            <li>
                <a class="${filter === "Completed" && "selected"
        }"  onclick="store.dispatch(changeFilter('Completed'))" href="#/completed">Completed</a>
            </li>
        </ul>
        <button class="clear-completed" onclick="store.dispatch(clearAll())">Clear completed</button>
    `;

    todoList.innerHTML = htmls.join("");
    footer.innerHTML = htmlFooters;
};

render();

createNewTodo.onkeyup = (e) => {
    if (!createNewTodo.value) return;
    if (e.keyCode === 13) {
        store.dispatch(add(createNewTodo.value));
        createNewTodo.value = null;
    }
};

const handleToggleChecked = (index) => {
    store.dispatch(toggleChecked(index));
};

const handleDeleteTodo = (index) => {
    store.dispatch(deleteTodo(index));
};

const handleUpdateTodo = (index) => {
    store.dispatch(updateTodo(index));
};

const handleEditTodo = (index) => {
    if (event.keyCode === 13) {
        if (!event.target.value) return;
        store.dispatch(editTodo(event.target.value, index));
    }
};

toggleAll.onclick = () => {
    store.dispatch(toggleAllTodo());
};

store.subscribe(() => render());
