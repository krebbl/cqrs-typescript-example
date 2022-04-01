import { AggregateRoot } from "../cqrs/aggregate-root";
import {
  TaskCreatedEvent,
  TaskCompletedEvent,
  TaskRemovedEvent,
  TaskRenamedEvent
} from "./task.events";

export class Task extends AggregateRoot {
  public title: string = "";
  public completed: boolean = false;

  constructor(private id: string) {
    super();
  }

  static create(id: string, title: string): Task {
    const task = new Task(id);
    task.apply(new TaskCreatedEvent(id, title));
    return task;
  }

  remove() {
    this.apply(new TaskRemovedEvent(this.id));
  }

  rename(title: string) {
    // validate title
    this.apply(new TaskRenamedEvent(this.id, title));
  }

  complete() {
    if (this.completed) {
      // raise exception, already completed!
    }
    this.apply(new TaskCompletedEvent(this.id));
  }

  onTaskCreatedEvent(event: TaskCreatedEvent) {
    this.title = event.title;
  }

  onTaskRenamedEvent(event: TaskRenamedEvent) {
    this.title = event.title;
  }

  onTaskCompletedEvent(event: TaskCompletedEvent) {
    this.completed = true;
  }
}
