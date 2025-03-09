// import React, { useState, useEffect, useContext, createContext, ReactNode } from "react";

// interface IUser {
//   _id: string;
//   fullName: string;
//   email: string;
// }

// interface IAuthContext {
//   user: IUser | null;
//   login: (user: IUser) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<IAuthContext | null>(null);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<IUser | null>(null);

//   useEffect(() => {
//     const authData = localStorage.getItem("survey_auth");
//     if (authData) {
//       setUser(JSON.parse(authData) as IUser);
//     }
//   }, []);

//   const login = (user: IUser) => {
//     setUser(user);
//     localStorage.setItem("survey_auth", JSON.stringify(user));
//   };

//   const logout = () => {
//       setUser(null);
//       localStorage.removeItem("survey_auth");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = (): IAuthContext => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
import React, { useState, useEffect, useContext, createContext, ReactNode } from "react";

interface IUser {
  _id?: string;
  fullName?: string;
  email: string;
  role: string;
}

interface IAuthContext {
  user: IUser | null;
  login: (user: IUser) => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    // Retrieve user data from localStorage on initial load
    const authData = localStorage.getItem("survey_auth");
    if (authData) {
      setUser(JSON.parse(authData) as IUser);
    }
  }, []);

  const login = (user: IUser) => {
    setUser(user);
    localStorage.setItem("survey_auth", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("survey_auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
