import { IModuleRef } from "../common/interfaces/module-ref.interface";
import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { Type } from "../common/interfaces/type.interface";
import { CommandBus } from "./command-bus";
import { EVENTS_HANDLER_METADATA, SAGA_METADATA } from "./decorators/constants";
import { InvalidSagaException } from "./exceptions/invalid-saga.exception";
import {
  defaultGetEventId,
  defaultReflectEventId
} from "./helpers/default-get-event-id";
import { DefaultPubSub } from "./helpers/default-pubsub";
import {
  IEvent,
  IEventBus,
  IEventHandler,
  IEventPublisher,
  ISaga
} from "./interfaces/index";
import { ObservableBus } from "./observable-bus";

export type EventHandlerType<EventBase extends IEvent = IEvent> = Type<
  IEventHandler<EventBase>
>;

export class EventBus<EventBase extends IEvent = IEvent>
  extends ObservableBus<EventBase>
  implements IEventBus<EventBase> {
  protected getEventId: (event: EventBase) => string | null;
  protected readonly subscriptions: Subscription[];

  private _publisher: IEventPublisher<EventBase>;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly moduleRef: IModuleRef
  ) {
    super();
    this.subscriptions = [];
    this.getEventId = defaultGetEventId;
    this.useDefaultPublisher();
  }

  get publisher(): IEventPublisher<EventBase> {
    return this._publisher;
  }

  set publisher(_publisher: IEventPublisher<EventBase>) {
    this._publisher = _publisher;
  }

  onModuleDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  publish<T extends EventBase>(event: T) {
    return this._publisher.publish(event);
  }

  publishAll<T extends EventBase>(events: T[]) {
    if (this._publisher.publishAll) {
      return this._publisher.publishAll(events);
    }
    return (events || []).map((event) => this._publisher.publish(event));
  }

  bind(handler: IEventHandler<EventBase>, id: string) {
    const stream$ = id ? this.ofEventId(id) : this.subject$;
    const subscription = stream$.subscribe((event) => handler.handle(event));
    this.subscriptions.push(subscription);
  }

  registerSagas(types: Type<unknown>[] = []) {
    const sagas: ISaga<EventBase>[] = types
      .map((target) => {
        const metadata = Reflect.getMetadata(SAGA_METADATA, target) || [];
        const instance = this.moduleRef.get(target);
        if (!instance) {
          throw new InvalidSagaException();
        }
        return metadata.map((key: string) => instance[key].bind(instance));
      })
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach((saga) => this.registerSaga(saga));
  }

  register(handlers: EventHandlerType<EventBase>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handler: EventHandlerType<EventBase>) {
    const instance = this.moduleRef.get(handler);
    if (!instance) {
      return;
    }
    const events = this.reflectEvents(handler);
    events.map((event) =>
      this.bind(
        instance as IEventHandler<EventBase>,
        defaultReflectEventId(event)
      )
    );
  }

  protected ofEventId(id: string) {
    return this.subject$.pipe(filter((event) => this.getEventId(event) === id));
  }

  protected registerSaga(saga: ISaga<EventBase>) {
    if (typeof saga !== "function") {
      throw new InvalidSagaException();
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new InvalidSagaException();
    }

    const subscription = stream$
      .pipe(filter((e) => !!e))
      .subscribe((command) => this.commandBus.execute(command));

    this.subscriptions.push(subscription);
  }

  private reflectEvents(
    handler: EventHandlerType<EventBase>
  ): FunctionConstructor[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultPubSub<EventBase>(this.subject$);
  }
}
