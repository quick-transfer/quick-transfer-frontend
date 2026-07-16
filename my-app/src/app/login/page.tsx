import Image from "next/image"
import Link from "next/link"

export default function login() {
    return (
        <main className="flex h-screen font-monospace">
            <section className="relative hidden h-screen lg:block lg:w-3/5 ">
                <Image
                    src="/assets/images/login/login-imagem.png"
                    alt=""
                    fill
                    priority
                    className="object-cover"
                ></Image>

                <div className="absolute inset-0 bg-black/35"></div>
            </section>

            <section className="flex flex-1 flex-col items-center justify-center bg-[#005DAA] px-6">
                <div className="mb-10 flex items-center gap-3">
                    <Image
                        src="/assets/images/logo/Logo-Weg-Branco.png"
                        alt="Logo Weg"
                        width={88}
                        height={62}
                    />

                    <div className="h-10 w-1 bg-white"></div>

                    <span className="text-[44px] m-0.5 font-light font-Manrope text-white">Quick Transfer</span>
                </div>

                <div className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-2x1">
                    <h2 className="text-center text-[32px] font-semibold">Login</h2>

                    <div className="mx-auto mt-3 mb-6 h-0.5 w-28 bg-gray-200"></div>


                    <form className="space-y-5">

                        <div className="mb-8">
                            <label className="mb-2 block text-[20px] font-medium">Usuário</label>
                            <input
                                type="text"
                                placeholder="Usuário"
                                className="w-full rounded-lg border-2 bg-[#F8FBFF] border-gray-300 px-4 py-2 outline-none transition focus:border-[#005DA4] focus:bg-[#EFF6FF]"
                            />
                        </div>


                        <div className="mb-8">
                            <label className="mb-2 block text-[20px] font-medium">
                                Senha
                            </label>

                            <input
                                type="password"
                                placeholder="Senha"
                                className="w-full rounded-lg border-2 bg-[#F8FBFF] border-gray-300 px-4 py-2 outline-none transition focus:border-[#005DA4] focus:bg-[#EFF6FF]"
                            />

                            <button type="button" className="mt-2 text-[16px] text-gray-400 hover:text-[#005DA4] underline ml-1"><Link href={"#"}>Esqueceu a senha?</Link></button>
                        </div>

                        <button
                            type="submit"
                            className="w-full text-[24px] rounded-lg bg-[#005DA4] py-2.5 border-2 border-[#80AED2] text-[#E5EEF6] transition hover:bg-[#004C92]"
                        >Entrar</button>

                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-gray-300"></div>

                            <span className="text-[20px] text-gray-500 mb-1.5">
                                ou
                            </span>

                            <div className="h-px flex-1 bg-gray-300"></div>
                        </div>

                        <button type="button" className="flex w-full items-center text-[20px] justify-center border-2 gap-3 rounded-lg border-gray-300 py-3 trasition hover:bg-gray-50">
                            <Image
                                src="/assets/images/login/Logo-google.png"
                                alt="Google"
                                width={20}
                                height={20}
                                className="mt-1"
                            />

                            Entrar com google
                        </button>


                    </form>
                </div>
            </section>
        </main >
    )
}