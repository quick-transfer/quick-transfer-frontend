import Image from "next/image"
import Link from "next/link"

export default function login() {
    return (
        <main className="flex h-screen">
            <section className="relative hidden h-screen lg:block lg:w-3/5">
                <Image
                    src="/assets/img/login/login.png"
                    alt=""
                    fill
                    priority
                    className="object-cover"
                ></Image>
            </section>

            <section className="flex flex-1 flex-col items-center justify-center bg-[#005DAA] px-6">
                <div className="mb-10 flex items-center gap-3">
                    <Image
                        src="/assets/img/logo/Logo-Weg-Branco.png"
                        alt="Logo Weg"
                        width={88}
                        height={62}
                    />

                    <span className="text-4x1 font-light font-Manrope text-white">Quick Transfer</span>
                </div>

                <div className="w-full max-w-md rounded 2x1 bg-white p-8 shadow-2x1">
                    <h3 className="mb-8 text-center text-3x1 font-semibold">Login</h3>

                    <label>Usuário</label>
                    <input type="text"></input>

                    <label>Senha</label>
                    <input type="password"></input>

                    <Link href={"#"}>Esqueceu a senha?</Link>

                    <button>entrar</button>

                    <div>
                        <div>

                            <span>
                                ou
                            </span>

                        </div>
                    </div>

                    <button type="button">


                    </button>

                    <Image
                        src="/images/google.svg"
                        alt="Google"
                        width={20}
                        height={20}
                    />

                    entrar com google
                </div>
            </section>
        </main>
    )
}