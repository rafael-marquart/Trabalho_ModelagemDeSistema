import React from "react";
import type { Metadata } from "next";
import LegalDocument, { LegalContact } from "@/components/legal-document";

export const metadata: Metadata = { title: "Termos de Uso — Acessa Vagas" };

export default function TermsOfUsePage() {
  return <LegalDocument title="Termos de Uso">
    <section aria-labelledby="t-sobre">
      <h2 id="t-sobre">1. Sobre o AcessaVagas</h2>
      <p>O AcessaVagas ajuda pessoas candidatas, com atenção especial às pessoas com deficiência, a encontrar vagas compatíveis com o seu perfil e com as suas necessidades de acessibilidade, e ajuda empresas a recrutar de forma acessível. É um projeto acadêmico, sem fins comerciais. Ao criar uma conta, você declara que leu e concorda com estes Termos e com a <a href="/privacidade">Política de Privacidade</a>.</p>
    </section>
    <section aria-labelledby="t-contas">
      <h2 id="t-contas">2. Contas</h2>
      <ul>
        <li><strong>Candidato:</strong> cria a própria conta, monta o perfil, busca vagas, candidata-se, acompanha as candidaturas, avalia o processo seletivo e pode fazer denúncias.</li>
        <li><strong>Empresa:</strong> cria a conta, confirma o e-mail, publica vagas, informa a infraestrutura de acessibilidade, conduz o processo seletivo e convida recrutadores.</li>
        <li><strong>Recrutador:</strong> entra somente por convite de uma empresa e atua em nome dela.</li>
        <li><strong>Administração:</strong> mantém o catálogo de acessibilidade e analisa denúncias.</li>
      </ul>
      <p>Você é responsável pela veracidade das informações que cadastra e pelo sigilo da sua senha. Avise a equipe se suspeitar de uso indevido da sua conta.</p>
    </section>
    <section aria-labelledby="t-regras">
      <h2 id="t-regras">3. Regras de uso</h2>
      <p>Não é permitido:</p>
      <ul>
        <li>cadastrar informações falsas ou de outra pessoa;</li>
        <li>publicar vagas falsas, enganosas ou que se apresentem como inclusivas sem oferecer as condições declaradas;</li>
        <li>discriminar candidatos, inclusive em razão de deficiência, em qualquer etapa do recrutamento, como proíbe a Lei Brasileira de Inclusão (Lei nº 13.146/2015);</li>
        <li>usar dados de candidatos para outra finalidade que não o processo seletivo da vaga;</li>
        <li>registrar avaliações ou denúncias de má-fé;</li>
        <li>tentar acessar dados ou áreas sem autorização, ou prejudicar o funcionamento do site.</li>
      </ul>
    </section>
    <section aria-labelledby="t-empresas">
      <h2 id="t-empresas">4. Responsabilidades das empresas</h2>
      <p>A empresa responde pelas vagas que publica, pela acessibilidade que declara e pelas decisões do seu processo seletivo. As informações dos candidatos, inclusive as de acessibilidade quando autorizadas, servem só para preparar e conduzir o processo seletivo da vaga.</p>
    </section>
    <section aria-labelledby="t-compat">
      <h2 id="t-compat">5. Compatibilidade, avaliações e denúncias</h2>
      <ul>
        <li>A compatibilidade é uma estimativa automática a partir do perfil e da vaga, e o tempo de deslocamento é uma estimativa de serviço de mapas. Nenhuma das duas garante contratação. Informação ausente nunca é tratada como confirmação de compatibilidade.</li>
        <li>As avaliações de processos seletivos aparecem publicamente apenas como contagem por número de estrelas, sem identificar quem avaliou.</li>
        <li>As denúncias são analisadas pela administração. Registrar uma denúncia não significa que houve irregularidade, e a empresa não recebe a identidade de quem denunciou.</li>
      </ul>
    </section>
    <section aria-labelledby="t-servico">
      <h2 id="t-servico">6. Disponibilidade e mudanças</h2>
      <p>Por ser um projeto acadêmico, o site pode ficar indisponível, mudar ou ser encerrado. Quando estes Termos mudarem, a nova versão terá outra data, e poderemos pedir um novo aceite. Contas que descumprirem estes Termos podem ser suspensas.</p>
    </section>
    <section aria-labelledby="t-contato">
      <h2 id="t-contato">7. Contato</h2>
      <p>Dúvidas sobre estes Termos: fale com a equipe <LegalContact />.</p>
    </section>
  </LegalDocument>;
}
