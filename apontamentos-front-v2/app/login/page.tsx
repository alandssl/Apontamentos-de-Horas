"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction } from "@/lib/actions";
import { Lock, Mail, Loader2 } from "lucide-react";
const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    console.log(state)
  }, [state])
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <Card className="z-10 w-full max-w-md shadow-2xl border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="flex justify-center mb-2">
            <img
              src="tecalfoto.png"
              alt="Tecal Logo"
              className="h-24 md:h-28 w-auto object-contain drop-shadow-sm"
              onError={(e) => {
                (e.target as any).src = "https://placehold.co/400x120?text=TECAL";
              }}
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Apontamentos
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 text-base">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">E-mail Corporativo</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="seu.nome@tecal.com.br, ou seu login"
                  className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <a href="#" className="text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {state?.error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>


          </CardFooter>
        </form>

        <div className="px-8 pb-8 text-center space-y-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2 text-balance">
            Este sistema é de uso exclusivo dos colaboradores Tecal.
            Todas as ações são monitoradas e registradas.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Para mais informações: <a href="https://tecal.com.br" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500 hover:underline transition-colors focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-sm font-medium">Tecal.com.br</a>
          </p>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div >
  );
};

export default Login;
