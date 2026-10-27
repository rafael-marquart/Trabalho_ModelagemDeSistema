ALTER TABLE "CandidateProfile"
ADD COLUMN "accessibilityNeedOptionCodes" JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TYPE "AccessibilityNeedGroup" AS ENUM ('ARCHITECTURAL', 'COMMUNICATION', 'TECHNOLOGICAL');

CREATE TABLE "AccessibilityNeedOption" (
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "group" "AccessibilityNeedGroup" NOT NULL,
  "isMandatory" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccessibilityNeedOption_pkey" PRIMARY KEY ("code")
);

CREATE INDEX "AccessibilityNeedOption_group_isActive_idx" ON "AccessibilityNeedOption"("group", "isActive");
CREATE INDEX "AccessibilityNeedOption_isMandatory_isActive_idx" ON "AccessibilityNeedOption"("isMandatory", "isActive");

INSERT INTO "AccessibilityNeedOption" ("code", "name", "description", "group", "isMandatory", "isActive", "updatedAt") VALUES
('A01', 'Rampa ou acesso sem escadas', 'Acesso ao ambiente por rota sem necessidade de escadas.', 'ARCHITECTURAL', false, true, CURRENT_TIMESTAMP),
('A02', 'Elevador acessível', 'Elevador acessível quando necessário para alcançar o local de trabalho.', 'ARCHITECTURAL', false, true, CURRENT_TIMESTAMP),
('A03', 'Portas e passagens com largura adequada', 'Largura suficiente para circulação da pessoa e dispositivo de mobilidade quando utilizado.', 'ARCHITECTURAL', false, true, CURRENT_TIMESTAMP),
('A04', 'Banheiro acessível', 'Disponibilidade de banheiro acessível no local de trabalho.', 'ARCHITECTURAL', false, true, CURRENT_TIMESTAMP),
('A05', 'Mesa ou estação de trabalho adaptada', 'Mobiliário ou estação com as adaptações necessárias.', 'ARCHITECTURAL', false, true, CURRENT_TIMESTAMP),
('A06', 'Sinalização tátil no ambiente', 'Sinalização tátil para orientação e identificação dos espaços.', 'ARCHITECTURAL', false, true, CURRENT_TIMESTAMP),
('C01', 'Interpretação em Libras', 'Interpretação em Língua Brasileira de Sinais quando necessária.', 'COMMUNICATION', false, true, CURRENT_TIMESTAMP),
('C02', 'Linguagem simples e instruções diretas', 'Orientações claras, objetivas e compreensíveis.', 'COMMUNICATION', false, true, CURRENT_TIMESTAMP),
('C03', 'Possibilidade de comunicação por escrito', 'Alternativa escrita à comunicação oral.', 'COMMUNICATION', false, true, CURRENT_TIMESTAMP),
('C04', 'Recurso de comunicação alternativa ou aumentativa', 'Uso de recursos ou estratégias de comunicação alternativa ou aumentativa.', 'COMMUNICATION', false, true, CURRENT_TIMESTAMP),
('T01', 'Compatibilidade com leitor de tela', 'Ferramentas digitais compatíveis com leitores de tela.', 'TECHNOLOGICAL', false, true, CURRENT_TIMESTAMP),
('T02', 'Ampliação de texto e interface', 'Possibilidade de ampliar texto e elementos sem perder acesso ao conteúdo e às funções.', 'TECHNOLOGICAL', false, true, CURRENT_TIMESTAMP),
('T03', 'Alto contraste ou ajustes visuais', 'Configurações de contraste e legibilidade para ferramentas digitais.', 'TECHNOLOGICAL', false, true, CURRENT_TIMESTAMP),
('T04', 'Compatibilidade com comandos de voz', 'Operação de ferramentas digitais por comandos de voz quando necessário.', 'TECHNOLOGICAL', false, true, CURRENT_TIMESTAMP),
('T05', 'Compatibilidade com tecnologia assistiva própria', 'Compatibilidade com tecnologias assistivas utilizadas pela pessoa candidata.', 'TECHNOLOGICAL', false, true, CURRENT_TIMESTAMP),
('T06', 'Disponibilização de equipamento ou software assistivo', 'Disponibilização de recurso necessário para realizar as atividades previstas.', 'TECHNOLOGICAL', false, true, CURRENT_TIMESTAMP);
