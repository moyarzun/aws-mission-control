
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Amplify } from 'aws-amplify';
import { signIn as amplifySignIn, signOut as amplifySignOut, getCurrentUser, fetchAuthSession, SignInInput } from 'aws-amplify/auth';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_VUs14JWOE', // From Serverless Output
      userPoolClientId: '6v91t44davpaic0ntrvk6adf0q', // From Serverless Output
    }
  }
});

type AuthContextType = {
  user: any;
  isLoading: boolean;
  signIn: (input: SignInInput) => Promise<any>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | undefined>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => { },
  signOut: async () => { },
  getToken: async () => undefined,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      // Create a timeout promise that rejects after 4000ms
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timed out')), 4000)
      );

      // Race between getCurrentUser and timeout
      const currentUser = await Promise.race([
        getCurrentUser(),
        timeoutPromise
      ]);

      setUser(currentUser);
    } catch (error) {
      console.log('Auth check failed or timed out:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(input: SignInInput) {
    const result = await amplifySignIn(input);
    if (result.isSignedIn) {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    return result;
  }

  async function signOut() {
    try {
      await amplifySignOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  }

  async function getToken() {
    try {
      const { tokens } = await fetchAuthSession();
      return tokens?.idToken?.toString();
    } catch (error) {
      console.error("Error fetching token", error);
      return undefined;
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
