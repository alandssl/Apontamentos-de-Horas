'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PwaInstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Verificar se já está instalado
        window.addEventListener('appinstalled', () => {
            setCanInstall(false);
            setDeferredPrompt(null);
            toast.success('App instalado com sucesso!');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            toast.success('Instalando o app...');
        }
        setDeferredPrompt(null);
        setCanInstall(false);
    };

    if (!canInstall) return null;

    return (
        <Button
            onClick={handleInstall}
            size="sm"
            className="h-8 sm:h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
        >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-medium">Instalar App</span>
        </Button>
    );
}
