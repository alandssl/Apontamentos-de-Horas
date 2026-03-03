"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, User, Loader2, CheckCircle2, FileText, Settings, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import bcrypt from "bcryptjs";

interface Usuario {
    id: number;
    nome: string;
    usuario: string; // email
    chapa: string;
    aprovador: boolean;
    relatorio: boolean;
    dataCriacao: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Usuario[]>([]);

    const [newNome, setNewNome] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newSenha, setNewSenha] = useState("");
    const [hash, setHash] = useState("");
    const [newChapa, setNewChapa] = useState("");
    const [newAprovador, setNewAprovador] = useState(false);
    const [newRelatorio, setNewRelatorio] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:8080/user");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error("Erro ao carregar usuários:", e);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        bcrypt.hash(newSenha, 10, (err, hash) => {
            if (err || hash === undefined) {
                console.error("Erro ao gerar hash:", err);
                return;
            }
            setHash(hash);
        });

        try {
            const resp = await fetch("http://localhost:8080/user/salvar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: newNome,
                    usuario: newEmail, // backend mapped 'usuario' to 'email/login'
                    senha: hash,
                    chapa: newChapa,
                    aprovador: newAprovador,
                    relatorio: newRelatorio
                })
            });

            if (!resp.ok) {
                throw new Error("Erro ao criar usuário");
            }

            toast.success("Usuário criado com sucesso!");

            // Clear form
            setNewNome("");
            setNewEmail("");
            setNewSenha("");
            setHash("");
            setNewChapa("");
            setNewAprovador(false);
            setNewRelatorio(false);

            // Update list
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Erro na criação");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="w-full max-w-6xl flex flex-col gap-6 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-emerald-600" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Configurações do Sistema</h1>
                    <p className="text-zinc-500">Gerenciamento de acessos e cadastro de colaboradores.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-emerald-500" />
                            Novo Usuário
                        </CardTitle>
                        <CardDescription>Adicione um novo funcionário para conceder acesso ao sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input value={newNome} onChange={(e) => setNewNome(e.target.value)} required placeholder="Ex: Maria Oliveira" />
                            </div>

                            <div className="space-y-2">
                                <Label>E-mail Corporativo</Label>
                                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required type="email" placeholder="maria.oliveira@tecal.com.br" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Chapa (Matrícula)</Label>
                                    <Input value={newChapa} onChange={(e) => setNewChapa(e.target.value)} required placeholder="Ex: 50123" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Senha Inicial</Label>
                                    <Input value={newSenha} onChange={(e) => setNewSenha(e.target.value)} required type="password" placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 mt-2 border-t">
                                <h4 className="text-sm font-medium">Permissões no Sistema</h4>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-md border border-emerald-100 dark:border-emerald-800">
                                        <Checkbox id="admin-aprovador" checked={newAprovador} onCheckedChange={(c) => setNewAprovador(c as boolean)} />
                                        <Label htmlFor="admin-aprovador" className="text-sm font-medium cursor-pointer flex flex-col">
                                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> É Gestor / Aprovador</span>
                                            <span className="text-xs text-muted-foreground font-normal ml-5">Pode aprovar horas da equipe.</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/30 p-2 rounded-md border border-blue-100 dark:border-blue-800">
                                        <Checkbox id="admin-relatorio" checked={newRelatorio} onCheckedChange={(c) => setNewRelatorio(c as boolean)} />
                                        <Label htmlFor="admin-relatorio" className="text-sm font-medium cursor-pointer flex flex-col">
                                            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-600" /> Acesso a Relatórios</span>
                                            <span className="text-xs text-muted-foreground font-normal ml-5">Pode exportar relatórios gerenciais.</span>
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg flex items-start gap-2 border border-amber-200 dark:border-amber-800/50 mt-4">
                                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">Certifique-se de que os privilégios oferecidos estão de acordo com a hierarquia corporativa.</p>
                            </div>

                            <Button type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white" disabled={isCreating}>
                                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isCreating ? 'Salvando...' : 'Cadastrar Usuário'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Lista de Usuarios */}
                <Card className="shadow-lg border-zinc-200/50 dark:border-zinc-800/50 lg:col-span-2 overflow-hidden flex flex-col h-full">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <User className="w-5 h-5 text-zinc-500" /> Usuários Cadastrados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto max-h-[600px]">
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {users.map(user => (
                                <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/50 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-semibold text-base flex items-center gap-2">
                                            {user.nome || 'Sem Nome'}
                                            {user.aprovador && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Gestor</Badge>}
                                            {user.relatorio && <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20"><FileText className="w-3 h-3 mr-1" /> Relatórios</Badge>}
                                        </div>
                                        <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                            {user.usuario}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 sm:flex-col sm:gap-1 text-sm text-zinc-500 text-right shrink-0">
                                        <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs w-fit sm:ml-auto">
                                            Chapa: {user.chapa}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <div className="p-8 text-center text-zinc-500">
                                    Nenhum usuário carregado.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
