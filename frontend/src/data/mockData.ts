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
    name: "test user 1",
    image: "/no_avatar_image_128x128.png",
  },
  {
    id: 100002,
    name: "test user 2",
    image: "/no_avatar_image_128x128.png",
  },
  {
    id: 100003,
    name: "test user 3",
    image: "/no_avatar_image_128x128.png",
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

