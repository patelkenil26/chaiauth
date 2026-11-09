/** Code samples for the docs page that need the real host URLs filled in. */
export function buildSnippets(backendHost: string, frontendHost: string) {
  const sdkProviderCode = `"use client";
import { ChaiAuthProvider } from "@chaiauth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChaiAuthProvider
      clientId={process.env.NEXT_PUBLIC_CHAIAUTH_CLIENT_ID!}
      redirectUri="https://yourapp.com/auth/callback" // exactly as registered
      issuer="${backendHost}"
    >
      {children}
    </ChaiAuthProvider>
  );
}`;

  const sdkUsageCode = `import { SignIn, SignedIn, SignedOut, UserButton, useChaiAuth } from "@chaiauth/react";

export function Header() {
  return (
    <header>
      <SignedOut>
        <SignIn returnTo="/dashboard" />
      </SignedOut>
      <SignedIn>
        <UserButton accountUrl="${frontendHost}/dashboard" />
      </SignedIn>
    </header>
  );
}

// Calling your own backend with the user's access token
export function useApi() {
  const { getAccessToken } = useChaiAuth();
  return async (path: string) => {
    const token = await getAccessToken(); // refreshed automatically when needed
    return fetch(path, { headers: { Authorization: \`Bearer \${token}\` } });
  };
}`;

  const apiKeyCode = `# List the users who granted your app access
curl "${backendHost}/v1/users?limit=20" \\
  -H "Authorization: Bearer ca_live_YOUR_API_KEY"

# One user
curl "${backendHost}/v1/users/USER_ID" \\
  -H "Authorization: Bearer ca_live_YOUR_API_KEY"`;

  const apiKeyResponse = `{
  "success": true,
  "data": {
    "sub": "8f14e45f-ceea-4f67-9c1e-2b9d3a6b1c7e",
    "name": "Asha Patel",
    "email": "asha@example.com",
    "email_verified": true,
    "scope": "openid profile email",
    "granted_at": "2026-11-09T10:15:00.000Z"
  }
}`;

  return { sdkProviderCode, sdkUsageCode, apiKeyCode, apiKeyResponse };
}
