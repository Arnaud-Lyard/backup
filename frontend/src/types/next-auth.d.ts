import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    roles?: string[];
    sessionStart: number;
    user?: {
      email: string;
      name: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/providers/keycloak' {
  export interface KeycloakProfileToken extends KeycloakProfile {
    realm_access: { roles: string[] };
    sessionStart: number;
  }
}
