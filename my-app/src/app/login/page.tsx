"use client";

import "@/app/globals.css";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { apiFetch, ApiError } from "@/lib/api";
import {
  AUTH_COOKIE_NAME,
  getRedirectPathByRole,
  ROLE_COOKIE_NAME,
} from "@/lib/auth";
import {
  authenticateMockUser,
  createMockSessionToken,
  IS_MOCK_AUTH_ENABLED,
  MOCK_AUTH_CREDENTIALS,
} from "@/lib/mock-auth";
import { UserRole } from "@/types";

import { USER_ID_COOKIE_NAME, USER_NAME_COOKIE_NAME } from '@/lib/auth';

type AuthenticatedUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};

// Password policy enforced by the backend on /auth/first-access.
// Duplicated here to give immediate feedback without a round-trip.
const PASSWORD_REQUIREMENTS =
  "A nova senha deve ter ao menos 14 caracteres, uma letra maiúscula, um número e um caractere especial.";

// Maps ApiError status codes to user-friendly messages.
// 401 and 404 are intentionally vague to avoid user enumeration.
function friendlyLoginError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Erro inesperado ao realizar o login. Tente novamente.";
  }

  if (error instanceof ApiError) {
    if (error.status === 401) return "Usuário ou senha inválidos.";
    if (error.status === 404) return "Usuário não encontrado.";
    // Status 0 or 5xx means a network/server failure — the ApiError already has a good message.
    if (error.status === 0 || error.status >= 500) return error.message;
  }

  if (error.message === "Failed to fetch") {
    return "Não foi possível acessar o servidor. Verifique se a API está ligada.";
  }

  return error.message || "Não foi possível realizar o login.";
}

// Runtime shape check before writing cookies and redirecting.
// The backend contract is informal — the response could change without a
// type-safe client being generated; this guards against silent breakage.
function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (typeof value !== "object" || value === null) return false;

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.username === "string" &&
    typeof user.role === "string" &&
    ["ADMIN", "COORDINATOR", "MANAGER"].includes(user.role)
  );
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

  const finishLogin = (
    authenticatedUser: AuthenticatedUser,
    mockSessionToken?: string
  ) => {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    // Role cookie must be JS-readable (no HttpOnly) so client components can
    // read it to render role-specific UI without a server round-trip.
    document.cookie = `${ROLE_COOKIE_NAME}=${encodeURIComponent(authenticatedUser.role)}; path=/; max-age=86400; samesite=strict${secure}`;
    document.cookie = `${USER_ID_COOKIE_NAME}=${encodeURIComponent(authenticatedUser.id)}; path=/; max-age=86400; samesite=strict${secure}`;
    document.cookie = `${USER_NAME_COOKIE_NAME}=${encodeURIComponent(authenticatedUser.name)}; path=/; max-age=86400; samesite=strict${secure}`;

    // In a real login the backend sets the HttpOnly JWT cookie itself in the
    // Set-Cookie response header. Only the mock path needs to set it client-side.
    if (mockSessionToken) {
      // 8h (28800s) matches the mock token TTL set in createMockSessionToken.
      document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(mockSessionToken)}; path=/; max-age=28800; samesite=strict${secure}`;
    }

    // router.replace keeps the login page out of browser history so the back
    // button doesn't return users to the login form after signing in.
    router.replace(getRedirectPathByRole(authenticatedUser.role));
    router.refresh();
  };

  const authenticate = async (username: string, password: string) => {
    const authenticatedUser = await apiFetch<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (!isAuthenticatedUser(authenticatedUser)) {
      throw new ApiError("O servidor retornou uma resposta de autenticação inválida.", 502);
    }

    finishLogin(authenticatedUser);
  };

  const handleLogin = async () => {
    const username = usuario.trim();

    // The mock username is checked first to skip the API entirely — avoids
    // waiting for a timeout when the backend is down during development.
    if (IS_MOCK_AUTH_ENABLED && username === MOCK_AUTH_CREDENTIALS.username) {
      const mockUser = authenticateMockUser(username, senha);

      if (!mockUser) {
        setErro("Senha do usuário de contingência inválida.");
        return;
      }

      finishLogin(mockUser, createMockSessionToken(mockUser));
      return;
    }

    try {
      await authenticate(username, senha);
    } catch (error: unknown) {
      // Per the current backend contract, 403 on the public login endpoint
      // means "valid credentials but first access — you must set a password."
      // This is an unusual use of 403 but is intentional on the backend side.
      if (error instanceof ApiError && error.status === 403) {
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

    // Client-side validation mirrors the backend's password policy to give
    // instant feedback — the backend still validates independently.
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
      // Immediately log in with the new password — avoids a second manual login.
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
      // Always clear loading state, even if navigation is in progress —
      // prevents the button from staying disabled if the redirect is slow.
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
      {/* Decorative full-bleed background image — hidden on mobile to give the
          login form more space. aria-hidden via empty alt. */}
      <section className="relative hidden h-screen lg:block lg:w-3/5">
        <Image
          src="/assets/images/login/WEG-login-page.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 60vw, 0px"
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
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        <div className="w-full max-w-md rounded-xl bg-card px-8 py-13 shadow-2xl">
          <h1 className="text-center text-[32px] font-semibold text-card-foreground">
            {primeiroAcesso ? "Primeiro acesso" : "Login"}
          </h1>

          <div className="mx-auto mt-3 mb-6 h-0.5 w-28 bg-neutral-200" />

          {erro && (
            <div
              className={`mb-4 rounded-lg border p-3 text-center text-sm font-medium ${
                // Show the first-access message in a neutral info style rather
                // than the red danger style to avoid alarming the user.
                primeiroAcesso && erro.startsWith("Primeiro acesso")
                  ? "border-primary-300 bg-primary-50 text-primary-800"
                  : "border-status-danger-foreground/20 bg-status-danger text-status-danger-foreground"
              }`}
            >
              {erro}
            </div>
          )}

          {/* Mock auth hint — only shown in non-production environments where
              IS_MOCK_AUTH_ENABLED is true, to guide developers. */}
          {IS_MOCK_AUTH_ENABLED && !primeiroAcesso && (
            <div className="mb-4 rounded-lg border border-status-warning-foreground/20 bg-status-warning p-3 text-sm text-status-warning-foreground">
              <p className="font-semibold">Acesso de contingência</p>
              <p>
                Usuário: <code>{MOCK_AUTH_CREDENTIALS.username}</code>
              </p>
              <p>
                Senha: <code>{MOCK_AUTH_CREDENTIALS.password}</code>
              </p>
              <p className="mt-1 text-xs">
                Permite navegar como administrador sem consultar a API.
              </p>
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
                // Locked during first-access flow — username was already accepted.
                disabled={primeiroAcesso || carregando}
                className="w-full text-[16px] font-medium rounded-xl border border-primary-600 bg-background px-4 py-5 outline-none transition focus:border-primary-800 focus:bg-accent"
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
                  className="w-full mb-5 text-[16px] font-medium rounded-xl border border-primary-600 bg-background px-4 py-5 outline-none transition focus:border-primary-800 focus:bg-accent"
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

                <div>
                  <label
                    htmlFor="confirmar-senha"
                    className="mb-2 block text-[20px] font-medium text-foreground"
                  >
                    Confirmar nova senha
                  </label>
                  <Input
                    id="confirmar-senha"
                    type="password"
                    autoComplete="new-password"
                    value={confirmacaoSenha}
                    onChange={(event) => setConfirmacaoSenha(event.target.value)}
                    required
                    disabled={carregando}
                    className="w-full rounded-xl border border-primary-600 bg-background px-4 py-5 text-[16px] font-medium"
                  />
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
