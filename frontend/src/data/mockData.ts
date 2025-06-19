interface MockUser {
  id: number;
  name: string;
  image: string;
}

interface MockPost {
  id: number;
  userId: number;
  content: string;
  images?: string[];
  createdAt: string;
  liked?: number[];
}

const mockUsers: MockUser[] = [
  {
    id: 100001,
    name: "Alice Johnson",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b5fd?w=128&h=128&fit=crop&crop=face",
  },
  {
    id: 100002,
    name: "Bob Smith",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face",
  },
  {
    id: 100003,
    name: "Carol Williams",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face",
  },
];

export const mockPosts: MockPost[] = [
  {
    id: 5100001,
    userId: 100001,
    content: "this is a test post",
    images: ["/web-app-manifest-512x512.png"],
    createdAt: "2025-01-01T00:00:00",
    liked: [100001, 100002],
  },
  {
    id: 5100002,
    userId: 100002,
    content: "this is a test post 2",
    createdAt: "2025-01-01T01:00:00",
  },
  {
    id: 5100003,
    userId: 100003,
    content: "this is a test post 3",
    createdAt: "2025-01-01T02:00:00",
    liked: [100001, 100003],
  },
  {
    id: 5100004,
    userId: 100001,
    content: "this is a test post 4",
    images: [
      "/web-app-manifest-512x512.png",
      "/web-app-manifest-512x512.png",
    ],
    createdAt: "2025-01-01T04:00:00",
  },
  {
    id: 5100005,
    userId: 100001,
    content: "this is a test post 5",
    createdAt: "2025-01-01T05:00:00",
  },
];

export const getUserById = (userId: number): MockUser | undefined => {
  return mockUsers.find(user => user.id === userId);
};

