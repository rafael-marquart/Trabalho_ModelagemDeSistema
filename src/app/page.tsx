import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <Link className="brand" href="/" aria-label="Acessa Vagas — início">
          <img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" />
        </Link>
        <div className="welcome-copy">
          <p className="eyebrow">Oportunidades para todos</p>
          <h1 id="welcome-title">Seu próximo passo começa aqui.</h1>
          <p>Encontre oportunidades de trabalho e conecte-se a empresas comprometidas com a acessibilidade.</p>
        </div>
        <div className="welcome-decoration" aria-hidden="true">
          <span className="decoration-orbit orbit-one" />
          <span className="decoration-orbit orbit-two" />
          <span className="decoration-dot" />
        </div>
        <p className="welcome-footnote">Talentos diversos. Oportunidades reais.</p>
      </section>

      <section className="entry-panel" aria-labelledby="entry-title">
        <div className="entry-content">
          <p className="eyebrow">Bem-vindo(a)</p>
          <h2 id="entry-title">Acesse sua conta</h2>
          <p className="muted">Escolha como deseja continuar.</p>

          <div className="entry-options">
            <Link className="choice-card" href="/candidato/login">
              <span className="choice-icon" aria-hidden="true">↗</span>
              <span className="choice-copy">
                <strong>Sou candidato</strong>
                <span>Encontre vagas que combinam com você.</span>
              </span>
              <span className="choice-arrow" aria-hidden="true">→</span>
            </Link>
            <Link className="choice-card" href="/empresa/login">
              <span className="choice-icon company-icon" aria-hidden="true">▦</span>
              <span className="choice-copy">
                <strong>Sou empresa</strong>
                <span>Encontre talentos e gerencie suas vagas.</span>
              </span>
              <span className="choice-arrow" aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="entry-divider"><span>Primeira vez por aqui?</span></div>
          <div className="signup-links">
            <Link href="/candidato/cadastro">Criar conta de candidato</Link>
            <Link href="/empresa/cadastro">Cadastrar empresa</Link>
          </div>
          <p className="legal-note">Ao continuar, você concorda com os termos de uso e a política de privacidade da plataforma.</p>
        </div>
      </section>
    </main>
  );
}