import { CommandBus } from "../cqrs/command-bus";
import { CreateTaskCommand, RenameTaskCommand } from "./task.commands";

export class TaskService {
  constructor(private commandBus: CommandBus) {}

  renameTask(taskId: string, title: string) {
    this.commandBus.execute(new RenameTaskCommand(taskId, title));
  }

  createTask(title: string) {
    this.commandBus.execute(new CreateTaskCommand(title));
  }
}
