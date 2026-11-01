import Link from "next/link";

/** Page shown when an address does not exist or is not available to the signed-in account. */
export default function NotFound() {
  return (
    <main id="conteudo" className="not-found-page" aria-labelledby="not-found-title">
      <h1 id="not-found-title">Página não encontrada</h1>
      <p>O endereço não existe ou não está disponível para a sua conta.</p>
      <p><Link className="primary-button" href="/">Voltar ao início</Link></p>
    </main>
  );
}
