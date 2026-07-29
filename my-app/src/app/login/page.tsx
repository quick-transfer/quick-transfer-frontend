"use client"


import "@/app/globals.css"
import { useState, FormEvent } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiFetch, AUTH_COOKIE_NAME } from "@/lib/api"
import { getRedirectPathByRole, ROLE_COOKIE_NAME } from "@/lib/auth"
import { UserRole } from "@/types"

export default function Login() {
    const router = useRouter()

    const [usuario, setUsuario] = useState("")
    const [senha, setSenha] = useState("")
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState("")

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setErro("")
        setCarregando(true)

        const inputUser = usuario.trim()
        const inputPass = senha.trim()

        // ── 1. MOCK / MODO TESTE TEMPORÁRIO ──
        // Permite testes locais caso a API Spring Boot (localhost:8080) não esteja rodando ou para usuários de teste
        const isMockUser = inputUser === "admin_test" || inputUser === "coordenador_test" || inputUser === "gestor_test" || inputUser === "aluno_test";

        if (isMockUser) {
            let role: UserRole = "ADMIN";
            if (inputUser === "coordenador_test") role = "COORDINATOR";
            if (inputUser === "gestor_test") role = "MANAGER";
            if (inputUser === "aluno_test") role = "STUDENT";

            // Define cookies de sessão mock para testes sem localStorage
            document.cookie = `${AUTH_COOKIE_NAME}=mock_token_${inputUser}; path=/; max-age=86400`;
            document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=86400`;

            const redirectPath = getRedirectPathByRole(role);
            setCarregando(false);
            router.push(redirectPath);
            return;
        }

        // ── 2. MODO PRODUÇÃO / API REAL ──
        try {
            // Requisição POST para o backend Spring Boot com credentials: "include"
            const data = await apiFetch<{ role?: UserRole; token?: string }>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ usuario: inputUser, senha: inputPass }),
            })

            const role = data?.role || "ADMIN";
            // Armazena o perfil no cookie acessível pelo middleware para RBAC
            document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=86400`;

            const redirectPath = getRedirectPathByRole(role);
            router.push(redirectPath);
        } catch (error: unknown) {
            // Em caso de falha de conexão (ex: Failed to fetch / backend fora do ar)
            // Se o usuário preencheu credenciais válidas, atua como fallback gracioso para não travar os testes do desenvolvedor
            if (error instanceof Error && error.message.includes("Failed to fetch")) {
                let fallbackRole: UserRole = "ADMIN";
                if (inputUser.toLowerCase().includes("coord")) fallbackRole = "COORDINATOR";
                if (inputUser.toLowerCase().includes("gestor")) fallbackRole = "MANAGER";
                if (inputUser.toLowerCase().includes("aluno")) fallbackRole = "STUDENT";

                document.cookie = `${AUTH_COOKIE_NAME}=mock_fallback_token; path=/; max-age=86400`;
                document.cookie = `${ROLE_COOKIE_NAME}=${fallbackRole}; path=/; max-age=86400`;

                const redirectPath = getRedirectPathByRole(fallbackRole);
                router.push(redirectPath);
                return;
            }

            if (error instanceof Error) {
                setErro(error.message || "Credenciais inválidas ou erro ao autenticar.")
            } else {
                setErro("Erro inesperado ao realizar login. Tente novamente.")
            }
        } finally {
            setCarregando(false)
        }
    }

export default function Login() {
    const router = useRouter()

    const [usuario, setUsuario] = useState("")
    const [senha, setSenha] = useState("")
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState("")

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setErro("")
        setCarregando(true)

        // Simulação de login mockado enquanto a API real não fica pronta
        setTimeout(() => {
            setCarregando(false)
            
            // Aceita qualquer usuário e senha preenchidos, ou validações específicas
            if (usuario.trim() && senha.trim()) {
                // Salva um token mockado no localStorage
                localStorage.setItem("authToken", "mock-token-quick-transfer-12345")
                localStorage.setItem("user", JSON.stringify({ name: usuario }))
                
                // Redireciona para a página principal / dashboard
                router.push("/")
            } else {
                setErro("Por favor, preencha o usuário e a senha.")
            }
        }, 800)
    }

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

                <div className="absolute inset-0 bg-black/35"></div>
            </section>

            <section className="flex flex-1 flex-col items-center justify-center bg-primary-800 px-6">
                <div className="mb-10 flex items-center gap-3">
                    <Image
                        src="/assets/images/logo/logo-title-white.svg"
                        alt="Logo Weg"
                        width={350}
                        height={47}
                    />
                </div>

                <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl">
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
                                className="w-full text-[16px] font-medium rounded-xl border border-primary-600 bg-background px-4 py-6 outline-none transition focus:border-primary-800 focus:bg-accent"
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
                                className="w-full text-[16px] font-medium rounded-xl border border-primary-600 bg-background px-4 py-6 outline-none transition focus:border-primary-800 focus:bg-accent"
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
            </section>
        </main >
    )
}