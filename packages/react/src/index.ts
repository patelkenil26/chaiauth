export { ChaiAuthProvider, useChaiAuth } from "./react/provider";
export type { ChaiAuthProviderProps, ChaiAuthContextValue } from "./react/provider";
export { SignIn, SignedIn, SignedOut, UserButton } from "./react/components";
export type { SignInProps, UserButtonProps } from "./react/components";

// Framework-agnostic core, for non-React code or custom UI
export { ChaiAuthClient, ChaiAuthError, createMemoryStorage } from "./core/client";
export type { AuthState, AuthStatus, ChaiAuthConfig, ChaiAuthUser, InitResult, StorageLike } from "./core/client";
