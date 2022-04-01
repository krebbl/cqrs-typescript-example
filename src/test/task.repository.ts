import { v4 } from "uuid";
import { IEventStore } from "../cqrs/interfaces";
import { Task } from "./task.aggregate";

export class TaskRepository {
  constructor(private eventStore: IEventStore) {}

  build(title: string): Task {
    return Task.create(v4(), title);
  }

  persist(task: Task) {
    const events = task.getUncommittedEvents();
    this.eventStore.saveEvents(events);
  }

  getById(taskId: string) {
    const task = new Task(taskId);
    const events = this.eventStore.getEventsForAggregate(taskId);
    console.log("Hier: " + taskId);
    console.log(events);
    task.loadFromHistory(events);
    return task;
  }
}
