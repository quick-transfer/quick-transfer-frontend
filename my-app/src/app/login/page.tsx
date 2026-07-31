"use client";

import "@/app/globals.css";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api";
import { getRedirectPathByRole, ROLE_COOKIE_NAME } from "@/lib/auth";
import { UserRole } from "@/types";

type AuthenticatedUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};

const PASSWORD_REQUIREMENTS =
  "A nova senha deve ter ao menos 14 caracteres, uma letra maiúscula, um número e um caractere especial.";

function friendlyLoginError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Erro inesperado ao realizar o login. Tente novamente.";
  }

  if (error instanceof ApiError) {
    if (error.status === 401) return "Usuário ou senha inválidos.";
    if (error.status === 404) return "Usuário não encontrado.";
  }

  if (error.message === "Failed to fetch") {
    return "Não foi possível acessar o servidor. Verifique se a API está ligada.";
  }

  return error.message || "Não foi possível realizar o login.";
}

export default function Login() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const finishLogin = (authenticatedUser: AuthenticatedUser) => {
    document.cookie = `${ROLE_COOKIE_NAME}=${authenticatedUser.role}; path=/; max-age=86400; samesite=lax`;
    router.replace(getRedirectPathByRole(authenticatedUser.role));
    router.refresh();
  };

  const authenticate = async (username: string, password: string) => {
    const authenticatedUser = await apiFetch<AuthenticatedUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    finishLogin(authenticatedUser);
  };

  const handleLogin = async () => {
    const username = usuario.trim();

    try {
      await authenticate(username, senha);
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        error.status === 403 &&
        error.message.toLowerCase().includes("first login")
      ) {
        setPrimeiroAcesso(true);
        setErro("Primeiro acesso identificado. Defina sua nova senha para continuar.");
        return;
      }

      setErro(friendlyLoginError(error));
    }
  };

  const handleFirstAccess = async () => {
    if (novaSenha !== confirmacaoSenha) {
      setErro("A confirmação não corresponde à nova senha.");
      return;
    }

    const passwordIsValid =
      novaSenha.length >= 14 &&
      /[A-Z]/.test(novaSenha) &&
      /[0-9]/.test(novaSenha) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(novaSenha);

    if (!passwordIsValid) {
      setErro(PASSWORD_REQUIREMENTS);
      return;
    }

    const username = usuario.trim();

    try {
      await apiFetch("/auth/first-access", {
        method: "POST",
        body: JSON.stringify({
          username,
          currentPassword: senha,
          newPassword: novaSenha,
        }),
      });
      await authenticate(username, novaSenha);
    } catch (error: unknown) {
      setErro(friendlyLoginError(error));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      if (primeiroAcesso) {
        await handleFirstAccess();
      } else {
        await handleLogin();
      }
    } finally {
      setCarregando(false);
    }
  };

  const cancelFirstAccess = () => {
    setPrimeiroAcesso(false);
    setSenha("");
    setNovaSenha("");
    setConfirmacaoSenha("");
    setErro("");
  };

  return (
    <main className="flex h-screen font-sans">
      <section className="relative hidden h-screen lg:block lg:w-3/5">
        <Image
          src="/assets/images/login/WEG-login-page.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
      </section>

      <section className="flex flex-1 flex-col items-center justify-center bg-primary-800 px-6">
        <div className="mb-10 flex items-center gap-3">
          <Image
            src="/assets/images/logo/logo-title-white.svg"
            alt="Logo WEG"
            width={400}
            height={47}
          />
        </div>

        <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl">
          <h1 className="text-center text-[32px] font-semibold text-card-foreground">
            {primeiroAcesso ? "Primeiro acesso" : "Login"}
          </h1>

          <div className="mx-auto mt-3 mb-6 h-0.5 w-28 bg-neutral-200" />

          {erro && (
            <div
              className={`mb-4 rounded-lg border p-3 text-center text-sm font-medium ${
                primeiroAcesso && erro.startsWith("Primeiro acesso")
                  ? "border-primary-300 bg-primary-50 text-primary-800"
                  : "border-status-danger-foreground/20 bg-status-danger text-status-danger-foreground"
              }`}
            >
              {erro}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="usuario"
                className="mb-2 block text-[20px] font-medium text-foreground"
              >
                Usuário
              </label>
              <Input
                id="usuario"
                type="text"
                autoComplete="username"
                placeholder="Usuário ou nome completo"
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                required
                disabled={primeiroAcesso || carregando}
                className="w-full rounded-xl border border-primary-600 bg-background px-4 py-5 text-[16px] font-medium outline-none transition focus:border-primary-800 focus:bg-accent"
              />
            </div>

            {!primeiroAcesso && (
              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-[20px] font-medium text-foreground"
                >
                  Senha
                </label>
                <Input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Senha"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                  disabled={carregando}
                  className="w-full rounded-xl border border-primary-600 bg-background px-4 py-5 text-[16px] font-medium outline-none transition focus:border-primary-800 focus:bg-accent"
                />
              </div>
            )}

            {primeiroAcesso && (
              <>
                <div>
                  <label
                    htmlFor="nova-senha"
                    className="mb-2 block text-[20px] font-medium text-foreground"
                  >
                    Nova senha
                  </label>
                  <Input
                    id="nova-senha"
                    type="password"
                    autoComplete="new-password"
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
                    required
                    disabled={carregando}
                    className="w-full rounded-xl border border-primary-600 bg-background px-4 py-5 text-[16px] font-medium"
                  />
                </div>

                <div className="w-full max-w-md rounded-xl bg-card py-12 px-8 shadow-2xl">
                    <h2 className="text-center text-[32px] font-semibold text-card-foreground">Login</h2>

                    <div className="mx-auto mt-3 mb-6 h-0.5 w-28 bg-neutral-200"></div>

                    {erro && (
                        <div className="mb-4 rounded-lg bg-status-danger p-3 text-center text-sm font-medium text-status-danger-foreground border border-status-danger-foreground/20">
                            {erro}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        <div className="mb-8">
                            <label className="mb-2 block text-[20px] text-foreground font-medium">Usuário</label>
                            <Input
                                type="text"
                                placeholder="Usuário"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                                className="w-full text-[16px] font-medium rounded-xl border border-primary-600 bg-background px-4 py-3 outline-none transition focus:border-primary-800 focus:bg-accent hover:bg-accent"
                            />
                        </div>

                        <div className="mb-8">
                            <label className="mb-2 block text-[20px] text-foreground font-medium">
                                Senha
                            </label>

                            <Input
                                type="password"
                                placeholder="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                className="w-full text-[16px] font-medium rounded-xl border border-primary-600 bg-background px-4 py-3 outline-none transition focus:border-primary-800 focus:bg-accent"
                            />

                            <button type="button" className="mt-2 text-[16px] text-neutral-400 hover:text-primary-600 underline ml-1">
                                <Link href={"#"}>Esqueceu a senha?</Link>
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={carregando}
                            className="w-full text-[20px] font-medium rounded-xl bg-primary-800 py-2.5 text-primary-foreground transition hover:bg-primary-900 disabled:opacity-50"
                        >
                            {carregando ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                </div>

                <p className="text-sm text-muted-foreground">
                  {PASSWORD_REQUIREMENTS}
                </p>
              </>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-primary-800 py-2.5 text-[20px] font-medium text-primary-foreground transition hover:bg-primary-900 disabled:opacity-50"
            >
              {carregando
                ? primeiroAcesso
                  ? "Salvando..."
                  : "Entrando..."
                : primeiroAcesso
                  ? "Definir senha e entrar"
                  : "Entrar"}
            </button>

            {primeiroAcesso && (
              <button
                type="button"
                onClick={cancelFirstAccess}
                disabled={carregando}
                className="w-full text-sm text-neutral-500 underline hover:text-primary-700"
              >
                Voltar ao login
              </button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
