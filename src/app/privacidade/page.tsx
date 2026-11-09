import React from "react";
import type { Metadata } from "next";
import LegalDocument, { LegalContact } from "@/components/legal-document";

export const metadata: Metadata = { title: "Política de Privacidade — Acessa Vagas" };

export default function PrivacyPolicyPage() {
  return <LegalDocument title="Política de Privacidade" current="privacy">
    <section aria-labelledby="p-quem">
      <h2 id="p-quem">1. Quem trata os seus dados</h2>
      <p>A equipe do projeto acadêmico AcessaVagas é a responsável pelos dados tratados neste site, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD). Contato: <LegalContact />.</p>
    </section>
    <section aria-labelledby="p-dados">
      <h2 id="p-dados">2. Quais dados usamos</h2>
      <ul>
        <li><strong>Conta:</strong> nome, e-mail e, para candidatos, CPF. A senha nunca é guardada como texto: guardamos apenas um código irreversível (hash).</li>
        <li><strong>Empresa:</strong> razão social, nome fantasia, CNPJ (opcional), e-mail de contato e infraestrutura de acessibilidade declarada.</li>
        <li><strong>Perfil do candidato:</strong> formação, idiomas, experiência, cursos, certificações, links profissionais e preferências de trabalho, inclusive cidade e, se você quiser, endereço e meio de transporte.</li>
        <li><strong>Informações de acessibilidade (opcionais):</strong> necessidades funcionais e recursos indispensáveis que você declarar. Veja o item 4.</li>
        <li><strong>Foto de perfil (opcional)</strong> de candidatos e recrutadores.</li>
        <li><strong>Comprovantes</strong> de cursos e certificações que você anexar, visíveis só para você.</li>
        <li><strong>Uso do serviço:</strong> candidaturas e suas etapas, entrevistas, avaliações, denúncias, avisos e preferências (tema, contraste e e-mails).</li>
        <li><strong>Segurança:</strong> registros de acesso e de ações relevantes. O endereço IP usado nos limites de tentativas é guardado apenas como código irreversível.</li>
      </ul>
    </section>
    <section aria-labelledby="p-para">
      <h2 id="p-para">3. Para que usamos</h2>
      <ul>
        <li>Criar e proteger a sua conta e prestar o serviço que você pediu: busca de vagas, compatibilidade, candidaturas, processo seletivo, avisos e e-mails da plataforma.</li>
        <li>Mostrar às empresas, e aos recrutadores delas, os dados necessários das candidaturas que você enviar.</li>
        <li>Moderar denúncias, prevenir abusos e manter registros de auditoria.</li>
      </ul>
      <p>Não vendemos dados e não os usamos para publicidade.</p>
    </section>
    <section aria-labelledby="p-acess">
      <h2 id="p-acess">4. Informações de acessibilidade (dados pessoais sensíveis)</h2>
      <p>Informações sobre deficiência e necessidades de acessibilidade são dados pessoais sensíveis. Declará-las é opcional, e elas só são usadas com a sua autorização específica, dada no seu perfil, para duas finalidades:</p>
      <ul>
        <li>calcular a compatibilidade com as vagas;</li>
        <li>mostrar às empresas, e aos recrutadores delas, das vagas em que você se candidatar as necessidades do catálogo e os recursos indispensáveis que você informar, para que preparem o processo seletivo. A descrição livre e os comprovantes não são mostrados.</li>
      </ul>
      <p>Nunca pedimos laudo médico. Você pode retirar a autorização a qualquer momento no seu perfil: as informações de acessibilidade são apagadas, deixam de ser usadas na compatibilidade e deixam de aparecer para as empresas.</p>
    </section>
    <section aria-labelledby="p-compart">
      <h2 id="p-compart">5. Com quem compartilhamos</h2>
      <ul>
        <li><strong>Empresas e recrutadores</strong> das vagas em que você se candidatar: nome, e-mail, foto de perfil (se você enviou uma), perfil profissional, resumo da compatibilidade e, se você autorizou, as informações de acessibilidade descritas no item 4. A foto é opcional; lembre-se de que ela pode mostrar características pessoais, e você pode trocá-la ou removê-la quando quiser. As avaliações aparecem apenas como contagem de estrelas, e as denúncias não revelam quem denunciou.</li>
        <li><strong>Serviços que fazem o site funcionar:</strong> Vercel (hospedagem), Neon (banco de dados), Brevo (envio de e-mails) e HERE (mapas: recebe o texto dos endereços e coordenadas para estimar o tempo de deslocamento). Alguns desses serviços podem tratar dados fora do Brasil, com as garantias dos seus próprios termos.</li>
      </ul>
    </section>
    <section aria-labelledby="p-tempo">
      <h2 id="p-tempo">6. Por quanto tempo guardamos</h2>
      <ul>
        <li>Dados da conta e do perfil: enquanto a conta existir. Foto de perfil e comprovantes: até você removê-los.</li>
        <li>Registros de auditoria, histórico de compatibilidade e registros de envio de avisos: 1 ano.</li>
        <li>Avaliações de processos seletivos: depois de 1 ano, deixam de ter qualquer ligação com quem avaliou. Ficam só a empresa, as estrelas e o ano.</li>
        <li>Tentativas de acesso: 24 horas.</li>
      </ul>
    </section>
    <section aria-labelledby="p-seg">
      <h2 id="p-seg">7. Segurança</h2>
      <p>Usamos conexão segura (HTTPS), senhas guardadas como código irreversível, sessões com expiração, limites de tentativas, acesso restrito por tipo de conta e registro das ações relevantes.</p>
    </section>
    <section aria-labelledby="p-direitos">
      <h2 id="p-direitos">8. Seus direitos</h2>
      <p>Pela LGPD, você pode pedir a confirmação de que tratamos seus dados, o acesso a eles, a correção, a anonimização, o bloqueio ou a eliminação de dados desnecessários, a portabilidade, a informação sobre com quem compartilhamos e a revogação do consentimento. Muita coisa você faz direto no site: editar o perfil, trocar ou remover a foto, remover comprovantes, retirar a autorização das informações de acessibilidade e escolher se quer receber avisos por e-mail. Para o resto, inclusive excluir a conta, fale com a equipe <LegalContact />. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</p>
    </section>
    <section aria-labelledby="p-cookies">
      <h2 id="p-cookies">9. Cookies e armazenamento no navegador</h2>
      <p>Usamos apenas um cookie essencial, que mantém você conectado, e guardamos no seu navegador as preferências de tema e de alto contraste. Não usamos cookies de publicidade nem de rastreamento.</p>
    </section>
    <section aria-labelledby="p-mudancas">
      <h2 id="p-mudancas">10. Mudanças nesta política</h2>
      <p>Quando esta política mudar, a nova versão terá outra data no topo da página. Se a mudança afetar o uso das informações de acessibilidade, pediremos uma nova autorização.</p>
    </section>
  </LegalDocument>;
}
