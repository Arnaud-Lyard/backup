import { AuthOptions, TokenSet } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

function requestRefreshOfAccessToken(token: JWT) {
  const params = new URLSearchParams({
    client_id: process.env.KEYCLOAK_CLIENT_ID || '',
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
    refresh_token: token.refreshToken as string,
  });

  return fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    method: 'POST',
    cache: 'no-store',
  });
}

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  session: {
    maxAge: 60 * 30,
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at!;
        token.sessionStart = Math.floor(Date.now() / 1000);
        const decoded = parseJwt(account.id_token!);
        token.roles = decoded.realm_access?.roles || [];
        return token;
      }
      if (Date.now() < Number(token.expiresAt) * 1000 - 60 * 1000) {
        return token;
      } else {
        try {
          const response = await requestRefreshOfAccessToken(token);

          const tokens: TokenSet = await response.json();

          if (!response.ok) throw tokens;

          const updatedToken: JWT = {
            ...token,
            idToken: tokens.id_token,
            accessToken: tokens.access_token,
            expiresAt: Math.floor(
              Date.now() / 1000 + (tokens.expires_in as number)
            ),
            refreshToken: tokens.refresh_token ?? token.refreshToken,
            roles:
              parseJwt(tokens.id_token!).realm_access?.roles || token.roles,
          };
          return updatedToken;
        } catch (error) {
          console.error('Error refreshing access token', error);
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.roles = token.roles as string[] | undefined;
      session.sessionStart = token.sessionStart as number;
      return session;
    },
  },
};
