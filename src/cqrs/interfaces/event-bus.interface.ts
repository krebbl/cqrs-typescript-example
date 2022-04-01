import { IEvent } from "./event.interface";

export interface IEventBus<EventBase extends IEvent = IEvent> {
  publish<T extends EventBase>(event: T): void;
  publishAll(events: EventBase[]): void;
}
