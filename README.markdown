# Meu Projeto Next.js 15 + Prisma

Este é um projeto construído com Next.js 15 e Prisma para gerenciamento de banco de dados. Ainda não está 100% completo, mas aqui está o guia para configurá-lo e executá-lo localmente.

## Pré-requisitos

- Node.js (versão 18 ou superior recomendada)
- Um banco de dados PostgreSQL (ou outro configurado no schema do Prisma; ajuste o DATABASE_URL conforme necessário)
- Git instalado para clonar o repositório

## Como Iniciar

Siga os passos abaixo para configurar e rodar o projeto:

1. **Clonar o Repositório**
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. **Instalar Dependências**
   Instale todos os pacotes Node.js necessários usando npm (ou yarn, se preferir):
   ```bash
   npm install
   ```
   Isso instalará o Next.js, Prisma e outras dependências listadas no `package.json`.

3. **Configurar Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto e adicione as variáveis necessárias. No mínimo, você precisará da string de conexão com o banco de dados para o Prisma.
   ```
   DATABASE_URL="file:./data/dev.db"
   ```
   Substitua os placeholders pelas credenciais reais do seu banco de dados. Se houver outras variáveis de ambiente (como chaves de API), adicione-as conforme necessário.

4. **Inicializar o Prisma e Configurar o Banco de Dados**
   Execute as migrações do Prisma para criar o esquema do banco de dados:
   ```bash
   npx prisma migrate dev --name init
   ```
   Isso aplicará as migrações pendentes e criará as tabelas no banco de dados.

5. **Popular o Banco de Dados com Dados Iniciais (Opcional, mas Recomendado)**
   Se você tiver dados iniciais para popular o banco, execute o script de seed:
   ```bash
   npx prisma db seed
   ```
   Isso presume que o arquivo `prisma/seed.js` está configurado corretamente no `prisma/schema.prisma` com o comando `seed` apontando para ele.

6. **Iniciar o Servidor de Desenvolvimento**
   Execute o aplicativo em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o aplicativo.

## Comandos Adicionais

- **Build para Produção**: `npm run build`
- **Iniciar Servidor de Produção**: `npm start`
- **Verificar o Código com Lint**: `npm run lint` (se o ESLint estiver configurado)
- **Gerar Cliente Prisma**: Se fizer alterações no schema, execute `npx prisma generate`

## Solução de Problemas

- Se encontrar erros no Prisma, verifique se o `DATABASE_URL` está correto e se o servidor de banco de dados está em execução.
- Para problemas com o Next.js, confira os logs do console ou consulte a [documentação do Next.js](https://nextjs.org/docs).
- Se o script de seed falhar, verifique o arquivo `seed.js` e o schema do Prisma.

Contribuições ou relatos de problemas são bem-vindos!