export interface Task {
  id: string;
  name: string;
  dueDate: string;
  notes: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  deadline: string;
  salesRep: string;
  designer: string;
  status: 'in-progress' | 'completed';
  tasks: Task[];
}
