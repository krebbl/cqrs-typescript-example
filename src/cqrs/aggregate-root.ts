import { Type } from "../common/interfaces/type.interface";
import { IEventHandler } from "./interfaces/event-handler.interface";
import { IEvent } from "./interfaces/event.interface";

const INTERNAL_EVENTS = Symbol();

export abstract class AggregateRoot<EventBase extends IEvent = IEvent> {
  // public [IS_AUTO_COMMIT_ENABLED] = false;
  private readonly [INTERNAL_EVENTS]: EventBase[] = [];
  private eventHandlers: { [key: string]: Type<IEventHandler> } = {};

  publish<T extends EventBase = EventBase>(event: T) {}

  publishAll<T extends EventBase = EventBase>(event: T[]) {}

  commit() {
    this.publishAll(this[INTERNAL_EVENTS]);
    this[INTERNAL_EVENTS].length = 0;
  }

  uncommit() {
    this[INTERNAL_EVENTS].length = 0;
  }

  getUncommittedEvents(): EventBase[] {
    return this[INTERNAL_EVENTS];
  }

  loadFromHistory(history: EventBase[]) {
    history.forEach((event) => this.apply(event));
  }

  apply<T extends EventBase = EventBase>(event: T) {
    this[INTERNAL_EVENTS].push(event);

    const handler = this.getEventHandler(event);
    handler && handler.call(this, event);
  }

  protected getEventHandler<T extends EventBase = EventBase>(
    event: T
  ): Type<IEventHandler> | undefined {
    const handler = `on${this.getEventName(event)}`;
    return this[handler];
  }

  protected getEventName(event: any): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }
}
