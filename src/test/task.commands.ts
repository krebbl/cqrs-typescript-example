export class CreateTaskCommand {
  constructor(public readonly title: string) {}
}

export class RenameTaskCommand {
  constructor(public readonly taskId: string, public readonly title: string) {}
}
