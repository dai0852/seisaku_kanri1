export const DEPARTMENTS = [
  "営業",
  "デザイナー",
  "版下課",
  "コンピューター課",
  "カット設定課",
  "エッチング課",
  "吹付課",
  "フォルニ課",
  "ステンドグラス課",
  "配送課",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export interface Task {
  id: string;
  name: string;
  department: Department;
  dueDate: string;
  notes: string;
  completed: boolean;
}

export interface Project {
  id:string;
  name: string;
  deadline: string;
  salesRep: string;
  designer: string;
  status: 'in-progress' | 'completed';
  tasks: Task[];
  color: string;
}
