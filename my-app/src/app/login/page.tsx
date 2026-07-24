"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen font-sans">
      {/* Visual Image Section */}
      <section className="relative hidden w-3/5 lg:block">
        <Image
          src="/assets/images/login/login-imagem.png"
          alt="Ambiente industrial WEG Quick Transfer"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-[1px]" />
      </section>

      {/* Form Section */}
      <section className="flex flex-1 flex-col items-center justify-center bg-primary-600 px-6 py-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white text-primary-600 font-bold text-xl shadow-md">
            QT
          </div>
          <div className="h-10 w-0.5 bg-white/40" />
          <span className="text-3xl font-light text-white tracking-wide sm:text-4xl">
            Quick Transfer
          </span>
        </div>

        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl border border-border">
          <h1 className="text-center text-2xl font-semibold text-foreground">
            Login
          </h1>
          <div className="mx-auto mt-3 mb-6 h-0.5 w-20 bg-primary-200" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário ou crachá"
                required
                className="h-11 bg-primary-50/50 border-input focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </Label>
                <Link
                  href="#"
                  className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 bg-primary-50/50 border-input focus:bg-white"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-primary-600 text-base font-medium text-white hover:bg-primary-700 shadow-md"
            >
              Entrar
            </Button>

            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase text-muted-foreground font-medium">
                ou
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-2 border-border hover:bg-muted"
              onClick={() => router.push("/dashboard")}
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.32 21.36 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.2.0 10.05.0 12s.46 3.8 1.28 5.42l4-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.32 2.64 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Entrar com Google</span>
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}