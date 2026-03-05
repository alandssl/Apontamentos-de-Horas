"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import bcrypt from "bcrypt"; // Para hashing de senhas
import { ClientUser } from "../types";
import bcrypt from "bcryptjs";
import { toast } from "sonner";
// import { createSession, encrypt } from "../lib/session";

interface AuthContextType {
  user: ClientUser | null;
  login: (
    email: string,
    password: string,
  ) => Promise<
    | {
        message: string;
        user: ClientUser;
        userPassword: string;
      }
    | undefined
  >;
  signup: (
    email: string,
    password: string,
    nome: string,
    departamento: string,
    funcaoId?: number,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUserState: (userId: string) => void;
  mockLogin: (role: any, department: any) => void;
  // refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const prisma = new PrismaClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // const updateUserState2 = useCallback((updatedUser: ClientUser) =>{
  //   setUser(updatedUser);
  // }, []);
  const updateUserState = async (userId: string) => {
    try {
      // console.log(userId);
      const user = await fetch(`/api/usuario/?userId=${userId}`, {
        method: "GET",
      }).then((res) => res.json());

      if (!user) {
        throw Error("Falha ao logar usuario");
      }
      setUser(user);
    } catch (error: any) {
      toast.error(error.message || "Falha ao logar usuario");
    }
  };

  // const refreshUser = useCallback(async () => {
  //   if (!user?.id) return;

  //   try {
  //   } catch {}
  // }, [user?.id]);

  // Verifica a sessão ao carregar
  useEffect(() => {
    //   const checkSession = async () => {
    setIsLoading(true);
    try {
      //       const session = await getSession();
      //       console.log(session);
      //       // if (session) {
      //       //   const response = await fetch(
      //       //     `/api/usuario?=${session.userId}`
      //       //   );
      //       //   if (response.ok) {
      //       //     const userData = await response.json();
      //       //     setUser({
      //       //       id: userData.id,
      //       //       email: userData.email,
      //       //       nome: userData.nome,
      //       //       departamento: userData.departamento,
      //       //       funcao: userData.funcao,
      //       //     });
      //       //   } else {
      //       //     await deleteSession();
      //       //   }
      //       // }
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
      // await deleteSession();
    } finally {
      setIsLoading(false);
    }
    //   };
    //   checkSession();
  }, []);
  // }

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // const salt = process.env.HASH_SALTS;

    try {
      const response = await fetch(`/api/usuario/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // .then((res) => res.json());

      const data: {
        message: string;
        user: ClientUser;
        userPassword: string;
      } = await response.json();

      // const isPasswordValid = await bcrypt.compare(password, data.userPassword);
      const isPasswordValid = password === data.userPassword;
      if (!isPasswordValid) {
        throw new Error("Senha incorreta");
      }

      if (data.user.alterarProximoLogin) {
        return data;
      }

      if (!response.ok) {
        throw new Error(data.message || "Erro ao login");
      }

      const userData = data;

      // await createSession(userData.user.id.toString());

      setUser({
        id: userData.user.id,
        email: userData.user.email,
        nome: userData.user.nome,
        departamento: userData.user.departamento,
        funcao: userData.user.funcao,
      });
      toast.success("Bem-vindo de volta, " + userData.user.nome + "!");
      // localStorage.setItem("authToken", data.token || "prisma-auth");
      // localStorage.setItem("userId", userData.id.toString());

      toast.success("Login bem-sucedido", {
        description: `Bem-vindo de volta, ${userData.user.nome}!`,
      });
      // createSession(String(userData.user.id));
      // const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      // const session = await encrypt({ '7', expiresAt });

      // document.cookie = `session=${session}; path=/; max-age=${expiresAt}; ${process.env.SESSION_SECRET === 'production' ? 'secure; sameSite=lax' : ''}`;

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Email ou senha incorretos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    hashedPassword: string,
    nome: string,
    codDepartamento: string,
    funcaoId: number = 1, // 1 para 'usuario' 2 para 'Gestor' 3 para 'Administrador'
  ) => {
    try {
      const createdUser = await fetch(`/api/usuario/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          hashedPassword,
          codDepartamento,
          funcaoId,
        }),
      }).then((res) => res.json());

      if (createdUser.message == "Usuário já cadastrado.") {
        throw new Error("Este e-mail já está registrado");
      }

      if (createdUser.user) {
        // await createSession(createdUser.user.id);
        setUser({
          id: createdUser.user.id,
          email: createdUser.user.email,
          nome: createdUser.user.nome,
          departamento: createdUser.user.departamento,
          funcao: createdUser.user.funcao,
        });

        toast.success("Parabéns!", {
          description: `Usuario ${createdUser.user.nome}, criado com sucesso`,
        });
      }
      return createdUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Falha no cadastro", {
          description: error.message || "Não foi possível criar sua conta.",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      //   // Remove os dados de autenticação
      //   localStorage.removeItem("authToken");
      //   localStorage.removeItem("userId");
      //   setUser(null);

      //   toast({
      //     title: "Logout realizado",
      //     description: "Você foi desconectado com sucesso.",
      //   });
      // } catch (error: any) {
      //   toast({
      //     title: "Erro ao fazer logout",
      //     description: error.message || "Ocorreu um erro ao desconectar.",
      //     variant: "destructive",
      //   });
      // Remove os dados de autenticação
      // await deleteSession();
      setUser(null);

      toast.success("Logout realizado", {
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      toast.error("Erro ao fazer logout", {
        description: error.message || "Ocorreu um erro ao desconectar.",
      });
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading,
    updateUserState,
    mockLogin: (role: any, department: any) => {
      setUser({
        id: 999,
        nome: `Demo ${role}`,
        email: `demo-${role}@example.com`,
        departamento: {
          id: 999,
          descricao: department,
          codccusto: "00.00.00.00000.00",
        },
        funcao: {
          id: role === "admin" ? 3 : role === "manager" ? 2 : 1,
          descricao: role,
        },
      });
      setIsLoading(false);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth tem que ser usado com AuthProvider");
  }
  return context;
}
