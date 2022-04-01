import { CommandHandler } from "../cqrs/decorators/command-handler.decorator";
import { EventPublisher } from "../cqrs/event-publisher";
import { ICommandHandler } from "../cqrs/interfaces/command-handler.interface";
import { RenameTaskCommand, CreateTaskCommand } from "./task.commands";
import { TaskRepository } from "./task.repository";

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    private repository: TaskRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(command: CreateTaskCommand) {
    const { title } = command;
    console.log(`Add task ${title}`);
    const task = this.eventPublisher.mergeObjectContext(
      this.repository.build(title)
    );
    this.repository.persist(task);
    task.commit();
  }
}

@CommandHandler(RenameTaskCommand)
export class RenameTaskHandler implements ICommandHandler<RenameTaskCommand> {
  constructor(
    private repository: TaskRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(command: RenameTaskCommand) {
    const { taskId, title } = command;
    const task = this.eventPublisher.mergeObjectContext(
      this.repository.getById(taskId)
    );
    task.rename(title);
    this.repository.persist(task);
    task.commit();
  }
}
