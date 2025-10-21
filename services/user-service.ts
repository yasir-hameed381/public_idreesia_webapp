export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType?: string;
  accessLevel?: string;
  zone?: string;
  mehfil?: string;
  address?: string;
  birthYear?: string;
  ehadYear?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  password?: string;
  isSuperAdmin?: boolean;
  isZoneAdmin?: boolean;
  isMehfilAdmin?: boolean;
  fatherName?: string;
  idCardNumber?: string;
  city?: string;
  country?: string;
  dutyType?: string;
  dutyDays?: string[];
}

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Basharat Ali",
    email: "bst381@gmail.com",
    phone: "",
    role: "General Editor",
    userType: "Karkun",
    accessLevel: "Super Admin",
    zone: "",
    mehfil: "",
    address: "",
    birthYear: "",
    ehadYear: "",
    avatar: "BA",
    createdAt: "2025-07-06T15:06:00Z",
    updatedAt: "2025-07-06T15:06:00Z",
  },
  {
    id: 2,
    name: "Faizan Rauf",
    email: "381post@gmail.com",
    phone: "03150000381",
    role: "Editor",
    userType: "Karkun",
    accessLevel: "Super Admin",
    zone: "Faisalabad Zone",
    mehfil: "",
    address: "Faisalabad Pakistan",
    birthYear: "",
    ehadYear: "",
    avatar: "FR",
    createdAt: "2022-01-27T10:00:00Z",
    updatedAt: "2022-01-27T10:00:00Z",
  },
  {
    id: 3,
    name: "Farooq Hameed",
    email: "farooqmian@gmail.com",
    phone: "",
    role: "Super Admin",
    userType: "Karkun",
    accessLevel: "Super Admin",
    zone: "",
    mehfil: "",
    address: "",
    birthYear: "",
    ehadYear: "",
    avatar: "FH",
    createdAt: "2024-03-29T05:17:00Z",
    updatedAt: "2024-03-29T05:17:00Z",
  },
  {
    id: 4,
    name: "Ghulam Muhammad",
    email: "codewithghulam@gmail.com",
    phone: "",
    role: "Feedback Viewer",
    userType: "Karkun",
    accessLevel: "Super Admin",
    zone: "",
    mehfil: "",
    address: "",
    birthYear: "",
    ehadYear: "",
    avatar: "GM",
    createdAt: "2025-06-06T21:27:00Z",
    updatedAt: "2025-06-06T21:27:00Z",
  },
  {
    id: 5,
    name: "Hafeezullah",
    email: "hafeezmib@gmail.com",
    phone: "",
    role: "Editor",
    userType: "Karkun",
    accessLevel: "Super Admin",
    zone: "",
    mehfil: "",
    address: "",
    birthYear: "",
    ehadYear: "",
    avatar: "H",
    createdAt: "2024-01-27T09:23:00Z",
    updatedAt: "2024-01-27T09:23:00Z",
  },
];

export const zones = [
  "Faisalabad Zone",
  "Lahore Zone",
  "Karachi Zone",
  "Islamabad Zone",
  "Peshawar Zone",
];

export const mehfils = [
  "Mehfil 1",
  "Mehfil 2",
  "Mehfil 3",
  "Mehfil 4",
  "Mehfil 5",
];

export const roles = [
  "Super Admin",
  "General Editor",
  "Editor",
  "Feedback Viewer",
  "Viewer",
];

export const userTypes = [
  "Karkun",
  "Admin",
  "User",
];

export const dutyDays = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Service functions
export const getUserById = (id: number): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const createUser = (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
  const newUser: User = {
    ...user,
    id: Math.max(...mockUsers.map(u => u.id)) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
};

export const updateUser = (id: number, updates: Partial<User>): User | undefined => {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) return undefined;
  
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockUsers[userIndex];
};

export const deleteUser = (id: number): boolean => {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) return false;
  
  mockUsers.splice(userIndex, 1);
  return true;
};

export const getAllUsers = (): User[] => {
  return [...mockUsers];
}; 