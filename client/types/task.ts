export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface ActivityItem {
  _id: string;
  user: { _id: string; name: string };
  action: string;
  timestamp: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  projectId?: string | { _id: string; name: string };

  assignedTo?: User[];
  dueDate?: string;
  comments?: Comment[];
  activity?: ActivityItem[];

  createdAt: string;

  updatedAt?: string;
}

