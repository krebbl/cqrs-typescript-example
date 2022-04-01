import { Type } from "./common/interfaces/type.interface";
import { CommandBus } from "./cqrs/command-bus";
import { EventBus } from "./cqrs/event-bus";
import { EventPublisher } from "./cqrs/event-publisher";
import { IEventStore } from "./cqrs/interfaces";
import "./styles.css";
import { CreateTaskCommand, RenameTaskCommand } from "./test/task.commands";
import { TaskEventHandler } from "./test/task.event-handlers";
import {
  CreateTaskHandler,
  RenameTaskHandler
} from "./test/task.command-handlers";
import { TaskRepository } from "./test/task.repository";
import { TaskListRepository } from "./test/task-list.repository";
import {
  ITaskEvent,
  TaskCreatedEvent,
  TaskRenamedEvent
} from "./test/task.events";

const services: any[] = [];

const app = {
  get(key: Type) {
    return services.find((service) => service.constructor === key);
  },
  add(service: any): void {
    services.push(service);
  }
};

class EventStore implements IEventStore<ITaskEvent> {
  events: ITaskEvent[] = [];
  eventTypeMap: {
    [key: string]: Type<ITaskEvent>;
  } = {
    "TASK/CREATED": TaskCreatedEvent,
    "TASK/RENAMED": TaskRenamedEvent
  };
  getEventsForAggregate(id: string): ITaskEvent[] {
    return this.events.filter((event) => event.id === id);
  }
  saveEvents(events: ITaskEvent[]) {
    this.events.push(...events);
  }
  serializeEvents() {
    return this.events.map((event) => {
      const type = this.resolveEventClassName(event);
      return {
        type,
        event
      };
    });
  }
  resolveEventClass(type: string): Type<ITaskEvent> {
    return this.eventTypeMap[type];
  }
  resolveEventClassName(event: ITaskEvent): string {
    return Object.keys(this.eventTypeMap).find((type) => {
      const cls = this.eventTypeMap[type];
      return event.constructor === cls;
    }) as string;
  }
}
const taskListRepository = new TaskListRepository();
const eventStore = new EventStore();
const taskRepository = new TaskRepository(eventStore);
const commandBus = new CommandBus(app);

const taskEventHandler = new TaskEventHandler(
  taskListRepository,
  document.getElementById("app"),
  commandBus
);

const eventBus = new EventBus(commandBus, app);

const eventPublisher = new EventPublisher(eventBus);

const createTaskHandler = new CreateTaskHandler(taskRepository, eventPublisher);
const renameTaskHandler = new RenameTaskHandler(taskRepository, eventPublisher);
app.add(createTaskHandler);
app.add(renameTaskHandler);
app.add(taskEventHandler);

commandBus.register([CreateTaskHandler, RenameTaskHandler]);
eventBus.register([TaskEventHandler]);

commandBus.execute(new CreateTaskCommand("Hello"));
commandBus.execute(new CreateTaskCommand("What"));
// commandBus.execute(new CompleteTaskCommand("123"));

const taskList = taskListRepository.getAllTasks();
console.log(taskList);
commandBus.execute(new RenameTaskCommand(taskList[0].id, "Foo"));
console.log(taskListRepository.getAllTasks());
