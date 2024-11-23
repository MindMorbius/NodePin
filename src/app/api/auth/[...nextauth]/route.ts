import NextAuth from 'next-auth';
import type { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'linuxdo',
      name: 'Linux.do',
      type: 'oauth',
      authorization: {
        url: 'https://connect.linux.do/oauth2/authorize',
        params: {
          scope: 'read write',
        },
      },
      token: {
        url: 'https://connect.linux.do/oauth2/token',
        params: {
          grant_type: 'authorization_code',
        },
      },
      userinfo: {
        url: 'https://connect.linux.do/api/user',
        async request({ tokens, provider }) {
          const res = await fetch(provider.userinfo?.url as string, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          return await res.json();
        },
      },
      clientId: process.env.LINUXDO_CLIENT_ID!,
      clientSecret: process.env.LINUXDO_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.username,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.username,
          trustLevel: profile.trust_level,
          active: profile.active,
          silenced: profile.silenced
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          id: profile.id.toString(),
          name: profile.name || profile.username,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.username,
          trustLevel: profile.trust_level,
          active: profile.active,
          silenced: profile.silenced
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.image,
          username: token.username,
          trustLevel: token.trustLevel,
          active: token.active,
          silenced: token.silenced
        }
      };
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 