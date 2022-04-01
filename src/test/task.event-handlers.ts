import { IEventHandler } from "../cqrs/interfaces";
import { TaskCreatedEvent, TaskRenamedEvent } from "./task.events";
import { TaskDTO, TaskListRepository } from "./task-list.repository";
import { EventsHandler } from "../cqrs/decorators/events-handler.decorator";
import { CommandBus } from "../cqrs/command-bus";
import { CreateTaskCommand } from "./task.commands";

@EventsHandler(TaskCreatedEvent, TaskRenamedEvent)
export class TaskEventHandler
  implements IEventHandler<TaskCreatedEvent>, IEventHandler<TaskRenamedEvent> {
  constructor(
    private repository: TaskListRepository,
    private ui: HTMLElement | null,
    private commandBus: CommandBus
  ) {}

  handle(event: TaskCreatedEvent | TaskRenamedEvent) {
    if (event instanceof TaskCreatedEvent) {
      this.repository.saveTask(new TaskDTO(event.id, event.title));
    } else if (event instanceof TaskRenamedEvent) {
      const task = this.repository.findTaskById(event.id);
      if (task) {
        task.title = event.title;
        this.repository.saveTask(task);
      } else {
        throw new Error("Task not found!");
      }
    }
    this.renderUI();
  }

  renderUI() {
    const tasks = this.repository.getAllTasks();
    if (this.ui) {
      this.ui.innerHTML = `
        <div>
          <input type="text" name="" placeholder="Add New Task">
          <button type="button">Add</button>
        </div>
        <div>
          ${tasks.map((t) => `<div>${t.title}</div>`).join("")}
        </div>
      `;
      const button = this.ui?.querySelector("button");
      if (button) {
        button.onclick = () => {
          const title = (this.ui?.querySelector(
            'input[type="text"]'
          ) as HTMLInputElement)?.value;
          this.commandBus.execute(new CreateTaskCommand(title));
        };
      }
    }
  }
}
