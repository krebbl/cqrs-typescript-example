import { IEvent } from "../cqrs/interfaces";

export interface ITaskEvent extends IEvent {
  id: string;
}

export class TaskCreatedEvent implements ITaskEvent {
  constructor(public id: string, public title: string) {}
}

export class TaskRemovedEvent implements ITaskEvent {
  constructor(public id: string) {}
}

export class TaskRenamedEvent implements ITaskEvent {
  constructor(public id: string, public title: string) {}
}

export class TaskCompletedEvent implements ITaskEvent {
  constructor(public id: string) {}
}
