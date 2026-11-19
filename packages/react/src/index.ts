export { ChaiAuthProvider, useChaiAuth } from "./react/provider";
export type { ChaiAuthProviderProps, ChaiAuthContextValue } from "./react/provider";
export { SignIn, SignedIn, SignedOut, UserButton } from "./react/components";
export type { SignInProps, UserButtonProps } from "./react/components";
export { SignInForm } from "./react/sign-in-form";
export { SignUpForm } from "./react/sign-up-form";
export type { SignInFormProps, SignInFormAppearance } from "./react/sign-in-form";
export type { SignUpFormProps } from "./react/sign-up-form";

// Framework-agnostic core, for non-React code or custom UI
export { ChaiAuthClient, ChaiAuthError, createMemoryStorage } from "./core/client";
export type { LoginContext, AuthContext, EmbeddedSignInOptions, PasswordCredentials, SignInResult, AuthState, AuthStatus, ChaiAuthConfig, ChaiAuthUser, InitResult, StorageLike } from "./core/client";
