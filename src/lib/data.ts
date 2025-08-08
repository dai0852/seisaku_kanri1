import type { Project } from './types';
import { subDays, addDays, format } from 'date-fns';

const today = new Date();

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'コーポレートサイトリニューアル',
    deadline: format(addDays(today, 20), 'yyyy-MM-dd'),
    salesRep: '山田 太郎',
    designer: '佐藤 花子',
    status: 'in-progress',
    tasks: [
      { id: 'task-1-1', name: 'ワイヤーフレーム作成', dueDate: format(addDays(today, 2), 'yyyy-MM-dd'), notes: 'トップページと主要な下層ページ', completed: true },
      { id: 'task-1-2', name: 'デザインカンプ作成', dueDate: format(addDays(today, 7), 'yyyy-MM-dd'), notes: 'クライアントのフィードバック待ち', completed: false },
      { id: 'task-1-3', name: 'コーディング', dueDate: format(addDays(today, 15), 'yyyy-MM-dd'), notes: '', completed: false },
    ],
  },
  {
    id: 'proj-2',
    name: 'ECサイト新規構築',
    deadline: format(addDays(today, 45), 'yyyy-MM-dd'),
    salesRep: '鈴木 一郎',
    designer: '田中 美咲',
    status: 'in-progress',
    tasks: [
      { id: 'task-2-1', name: '要件定義', dueDate: format(subDays(today, 5), 'yyyy-MM-dd'), notes: '機能一覧を確定', completed: true },
      { id: 'task-2-2', name: 'DB設計', dueDate: format(today, 'yyyy-MM-dd'), notes: '', completed: false },
    ],
  },
  {
    id: 'proj-3',
    name: 'LP制作',
    deadline: format(subDays(today, 10), 'yyyy-MM-dd'),
    salesRep: '山田 太郎',
    designer: '田中 美咲',
    status: 'completed',
    tasks: [],
  },
  {
    id: 'proj-4',
    name: '採用サイトデザイン',
    deadline: format(subDays(today, 30), 'yyyy-MM-dd'),
    salesRep: '鈴木 一郎',
    designer: '佐藤 花子',
    status: 'completed',
    tasks: [],
  },
];
