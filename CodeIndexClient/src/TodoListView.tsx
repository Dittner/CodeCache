import React from 'react'
import { Observable, observe, observer } from 'react-observable-mutations'

export class Task extends Observable {
  private readonly _text: string
  get text(): string {
    return this._text
  }

  private _isDone: boolean
  get isDone(): boolean {
    return this._isDone
  }

  constructor(text: string) {
    super('TodoTask')
    this._text = text
    this._isDone = false
  }

  done() {
    this._isDone = true
    this.mutated()
  }
}

export class TodoListVM extends Observable {
  tasks: Task[]

  constructor() {
    super('TodoVM')
    this.tasks = []
  }

  addTask(text: string) {
    const t = new Task(text)
    const unsubscribe = t.subscribe(() => { console.log('Task is mutated!') })
    unsubscribe()
    this.tasks.push(t)
    this.mutated()
  }
}

const todoListVM = new TodoListVM()

//The TodoListView will be rendered only after a new task is added
export const TodoListView = observer(() => {
  const vm = observe(todoListVM)
  return <div>
    <p>     Todo App     </p>
    <p>------------------</p>
    {vm.tasks.map(task => {
      return <TaskView key={task.text}
                       task={task}/>
    })}
    <p>------------------</p>
    <button onClick={() => { vm.addTask('Task ' + (vm.tasks.length + 1)) }}>Add Task</button>
  </div>
})

//The TaskView will be rendered after a new task is added or a task's status is changed
interface TaskViewProps {
  task: Task
}
export const TaskView = observer((props: TaskViewProps) => {
  const task = observe(props.task)
  return (
    <p onClick={() => { task.done() }}>
      {task.text + (task.isDone ? ': DONE' : ': IN PROGRESS')}
    </p>
  )
})
