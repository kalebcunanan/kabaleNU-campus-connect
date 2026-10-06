export interface LeaderboardEntry {
  _id: string;
  name: string;
  role: 'bulldog' | 'bullpup';
  program?: string;
  profilePicture?: string;
  bulldogScore: number;
  rank: number;
  createdAt: string;
}