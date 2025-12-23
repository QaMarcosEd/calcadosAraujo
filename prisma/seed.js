const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando tabelas...')

  // Limpa tabelas
  await prisma.user.deleteMany()


  console.log('👤 Criando admin...')
  const existingAdmin = await prisma.user.findUnique({
    where: { name: 'ca.ltda' }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('loja@2380', 12)
    await prisma.user.create({
      data: {
        name: 'ca.ltda',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('🎉 ADMIN criado com sucesso!')
    console.log('👤 Nome: ca.ltda')
    console.log('🔐 Senha: loja@2380')
    console.log('⚠️  NUNCA compartilhe essa senha!')
  } else {
    console.log('✅ ADMIN já existe: ca.ltda')
  }

  console.log('👥 Criando funcionários...')
  const funcionarios = [
    { name: 'Diana', password: 'diana@2380', role: 'FUNCIONARIO' },
    { name: 'Deise', password: 'deise@2380', role: 'FUNCIONARIO' }
  ]

  for (const func of funcionarios) {
    const existingUser = await prisma.user.findUnique({
      where: { name: func.name }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(func.password, 12)
      await prisma.user.create({
        data: {
          name: func.name,
          password: hashedPassword,
          role: func.role
        }
      })
      console.log(`🎉 Funcionário criado: ${func.name}`)
      console.log(`👤 Nome: ${func.name}`)
      console.log(`🔐 Senha: ${func.password}`)
      console.log(`⚠️  NUNCA compartilhe essa senha!`)
    } else {
      console.log(`✅ Funcionário já existe: ${func.name}`)
    }
  }

  console.log('✅ Seed finalizado!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })