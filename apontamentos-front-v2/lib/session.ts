import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  nome?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  chapa?: string;
}

export const sessionOptions: SessionOptions = {
  password: "akhrfvbgksajgrtvkfrvarfvgkahger2",
  cookieName: "apontamentos-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
