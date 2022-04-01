import { IEvent } from "./event.interface";

export interface IEventStore<EventBase extends IEvent = IEvent> {
  getEventsForAggregate(id: string): EventBase[];
  saveEvents(events: EventBase[]): void;
}
