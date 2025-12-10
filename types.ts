export enum Category {
  ALL = '全部',
  LOVE = '恋爱',
  GAME = '游戏',
  MUSIC = '音乐',
  MOVIE = '电影',
  FRIENDS = '交友',
  MOMENT = '此刻',
  CONFESSION = '表白',
  TRASH = '吐槽',
  IMAGE = "IMAGE"
}

export interface User {
  id: string; // Random anonymous ID
  nickname: string;
  avatarUrl: string;
  isAnonymous: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userNickname: string;
  userAvatar: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  userNickname: string;
  userAvatar: string;
  category: Category;
  content: string; // Text content
  images: string[];
  videoUrl?: string;
  audioUrl?: string;
  isLivePhoto?: boolean;
  timestamp: number;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  viewCount: number;
  tags?: { name: string }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'audio';
  timestamp: number;
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  messages: ChatMessage[];
}
