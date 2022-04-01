export class TaskDTO {
  constructor(public id: string, public title: string) {}
}

export class TaskListRepository {
  private tasks: TaskDTO[] = [];
  saveTask(task: TaskDTO) {
    const existingTask = this.tasks.find((t) => t.id === task.id);
    if (!existingTask) {
      this.tasks.push(task);
    } else {
      this.tasks = this.tasks.map((t) => {
        if (t.id === task.id) {
          return task;
        } else {
          return t;
        }
      });
    }
  }
  getAllTasks(): TaskDTO[] {
    return this.tasks;
  }
  findTaskById(id: string): TaskDTO | undefined {
    return this.tasks.find((t) => t.id === id);
  }
}
