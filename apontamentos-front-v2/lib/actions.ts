"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function loginAction(prevState: any, formData: FormData) {
  const rawEmail = formData.get("email")?.toString() || "";
  const rawPassword = formData.get("password")?.toString() || "";

  const email = rawEmail.trim();
  const password = rawPassword.trim();

  console.log("LOGIN TENTATIVA:", { email, password });

  let redirectPath = "";

  try {
    const response = await fetch("http://localhost:8080/user/" + email, { cache: "no-store" });

    if (response.ok) {
      const user = await response.json();

      if (user) {
        let isPasswordValid = false;

        if (user.senha === password) {
          isPasswordValid = true; // Legacy plain text
        } else if (user.senha && user.senha.startsWith("$2b$")) {
          // isPasswordValid = await bcrypt.compare(password, user.senha);
          isPasswordValid = password === user.senha;
        }

        if (!isPasswordValid) {
          return { error: "Senha inválida" };
        }

        const session = await getIronSession<SessionData>(
          await cookies(),
          sessionOptions,
        );

        session.userId = String(user.id);
        session.username = user.nome || user.usuario;
        session.isLoggedIn = true;

        // Verifica se aprovador é true ou a string "True" ou valor válido que identifica admin
        session.isAdmin = user.aprovador === true || String(user.aprovador).toLowerCase() === "true";
        await session.save();

        redirectPath = "/dashboard";
      }
    } else {
      console.error("Falha ao se conectar com banco de dados na validação");
      return { error: "Credenciais inválidas" };
    }
  } catch (err) {
    console.error("Erro interno ao validar login:", err);
    return { error: "Erro ao tentar validar as credenciais no banco." };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }

  return { error: "Credenciais inválidas" };
}
export async function logoutAction() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  session.destroy();
  redirect("/login");
}

export async function getSessionData() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  // Convert strictly to plain object to avoid Next.js Error: 
  // "Only plain objects can be passed to Client Components from Server Components"
  return {
    userId: session.userId,
    username: session.username,
    isLoggedIn: session.isLoggedIn,
    isAdmin: session.isAdmin,
  };
}

