import React, {
  useEffect,
  createContext,
  useState,
  useContext,
  ReactNode,
} from "react";
import { queryClient } from "@/hooks/queryClient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

type Role = "user" | "contractor" | "admin";

interface AuthContextType {
  LoginStatus: boolean;
  authInitalizing: boolean;
  logIn: (role: string) => void;
  logOut: () => void;
  user: {
    role: Role | undefined;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authInit, setAuthInit] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<Role | undefined>(undefined);

  // Check login status on mount

  useEffect(() => {
    let mounted = true;
    const persistLoginStatus = async () => {
      try {
        if (!mounted) return;
        const loginStatus = await SecureStore.getItemAsync("login_status");
        const role = (await SecureStore.getItemAsync("user_role")) as
          | Role
          | undefined;
        if (role) setUserRole(role);
        setIsAuthenticated(!!loginStatus);
      } catch (error) {
        console.error("Failed to load login status from AsyncStorage", error);
      } finally {
        if (mounted) setAuthInit(false);
      }
    };

    persistLoginStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (role: string) => {
    try {
      if (isAuthenticated) return;
      await SecureStore.setItemAsync("login_status", "true");
      await SecureStore.setItemAsync("user_role", String(role));
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to save login status", error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("login_status");
      await SecureStore.deleteItemAsync("user_role");
      queryClient.clear();
      setIsAuthenticated(false);
      router.replace("/(drawer)/(user)");
    } catch (error) {
      console.error("Failed to remove login status", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        LoginStatus: isAuthenticated,
        authInitalizing: authInit,
        logIn: login,
        logOut: logout,
        user: {
          role: userRole,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
