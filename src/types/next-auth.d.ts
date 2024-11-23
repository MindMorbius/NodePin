import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      username: string | null;
      trustLevel: number;
      active: boolean;
      silenced: boolean;
    }
  }

  interface JWT {
    accessToken?: string;
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    username: string | null;
    trustLevel: number;
    active: boolean;
    silenced: boolean;
  }
} 