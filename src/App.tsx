import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

function App() {
  // type Todo = Schema["addTodo"]['returnType']['todo'];
  type Todo = any;
  const [todos, setTodos] = useState<Todo[]>([]);

  const fetchTodos = async () => {
    const { data } = await client.queries.listTodo();

    if (data?.statusCode === "200")
          setTodos(data.todoList!)
    else
      alert("Failed to load Todos");

  }

  useEffect(() => { fetchTodos() }, []);


  const createTodo = async() => {
    const itemContent = window.prompt("Todo content");
    if (!itemContent) return;

    const res = await client.mutations.addTodo({ content: itemContent});
    if (res.data?.statusCode != "200")
      alert("Failed to create todo");
    
    fetchTodos()
  }

  const updateTodo = async(todo: Todo) => {
    if (!todo) return;

    const itemContent = window.prompt("Todo content", todo?.content);
    if (!itemContent) return;
    
    const updatedTodo:Todo = {...todo, content: itemContent };

    const res = await client.mutations.updateTodo({...updatedTodo});
    
    if (res.data?.statusCode != "200")
      alert("Failed to update todo");

    fetchTodos()
  }

  async function deleteTodo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) {
    e.stopPropagation();
    const res = await client.mutations.deleteTodo({ _id: id });
    if (res.data?.statusCode != "200")
      alert("Failed to delete todo");

    fetchTodos()
  }

  return (
    <Authenticator>
    {({ signOut, user }) => (
      <main>
        <h1>Hello {user?.username}</h1>
        <button onClick={signOut}>Sign out</button>
        <h1>My todos</h1>
        <button onClick={createTodo}>+ new</button>
        <ul>
          {todos.map((todo) => {
            if (!todo) return null;
            return (
              <li onClick={() => updateTodo(todo)} key={todo._id}> 
                <button onClick={(event) => deleteTodo(event, todo._id)}>x</button> {todo.content}
              </li>
              
            )
          })}
        </ul>
        <div>
          🥳 App successfully hosted. Try creating a new todo.
          <br />
          <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
            Review next step of this tutorial.
          </a>
        </div>
      </main>
    )}
  </Authenticator>
  );
}

export default App;
