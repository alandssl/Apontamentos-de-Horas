import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  username?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: "akhrfvbgksajgrtvkfrvarfvgkahger2",
  cookieName: "apontamentos-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
