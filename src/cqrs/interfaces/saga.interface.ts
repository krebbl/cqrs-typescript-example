import { Observable } from "rxjs";
import { ICommand } from "./command.interface";
import { IEvent } from "./event.interface";

export type ISaga<
  EventBase extends IEvent = IEvent,
  CommandBase extends ICommand = ICommand
> = (events$: Observable<EventBase>) => Observable<CommandBase>;
