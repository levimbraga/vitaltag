-- CreateEnum
CREATE TYPE "sexo" AS ENUM ('FEMININO', 'MASCULINO', 'OUTRO', 'NAO_INFORMADO');

-- CreateEnum
CREATE TYPE "tipo_sanguineo" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateEnum
CREATE TYPE "tipo_registro" AS ENUM ('ALERGIA', 'MEDICAMENTO', 'DOENCA', 'CIRURGIA');

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ficha_clinica" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "slug_publico" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(80) NOT NULL,
    "sobrenome" VARCHAR(120) NOT NULL,
    "sexo" "sexo" NOT NULL,
    "tipo_sanguineo" "tipo_sanguineo" NOT NULL,
    "senha_publica_hash" VARCHAR(255) NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criada_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizada_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ficha_clinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contato_emergencia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ficha_id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "parentesco" VARCHAR(60) NOT NULL,
    "prioridade" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "contato_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_clinico" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ficha_id" UUID NOT NULL,
    "tipo" "tipo_registro" NOT NULL,
    "descricao" VARCHAR(200) NOT NULL,
    "observacao" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registro_clinico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acesso_publico" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ficha_id" UUID NOT NULL,
    "ip_origem" INET NOT NULL,
    "user_agent" VARCHAR(255),
    "sucesso" BOOLEAN NOT NULL,
    "ocorrido_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acesso_publico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ficha_clinica_usuario_id_key" ON "ficha_clinica"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "ficha_clinica_slug_publico_key" ON "ficha_clinica"("slug_publico");

-- CreateIndex
CREATE INDEX "contato_emergencia_ficha_id_idx" ON "contato_emergencia"("ficha_id");

-- CreateIndex
CREATE INDEX "registro_clinico_ficha_id_tipo_idx" ON "registro_clinico"("ficha_id", "tipo");

-- CreateIndex
CREATE INDEX "acesso_publico_ficha_id_ocorrido_em_idx" ON "acesso_publico"("ficha_id", "ocorrido_em");

-- AddForeignKey
ALTER TABLE "ficha_clinica" ADD CONSTRAINT "ficha_clinica_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contato_emergencia" ADD CONSTRAINT "contato_emergencia_ficha_id_fkey" FOREIGN KEY ("ficha_id") REFERENCES "ficha_clinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_clinico" ADD CONSTRAINT "registro_clinico_ficha_id_fkey" FOREIGN KEY ("ficha_id") REFERENCES "ficha_clinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesso_publico" ADD CONSTRAINT "acesso_publico_ficha_id_fkey" FOREIGN KEY ("ficha_id") REFERENCES "ficha_clinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
