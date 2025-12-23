-- CreateTable
CREATE TABLE "Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "referencia" TEXT,
    "cor" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoCusto" REAL DEFAULT 0.0,
    "precoVenda" REAL NOT NULL,
    "precoPromocao" REAL,
    "emPromocao" BOOLEAN NOT NULL DEFAULT false,
    "imagem" TEXT,
    "genero" TEXT,
    "modelo" TEXT,
    "marca" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "lote" TEXT,
    "dataRecebimento" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FUNCIONARIO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Baixa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorTotal" REAL NOT NULL,
    "dataBaixa" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Baixa_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
