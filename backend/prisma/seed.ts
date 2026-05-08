import { PrismaClient, UserRole, SolicitationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      name: 'Administrador',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@email.com' },
    update: {},
    create: {
      email: 'manager@email.com',
      name: 'Gerente',
      password: hashedPassword,
      role: UserRole.MANAGER,
    },
  });

  const finance = await prisma.user.upsert({
    where: { email: 'finance@email.com' },
    update: {},
    create: {
      email: 'finance@email.com',
      name: 'Financeiro',
      password: hashedPassword,
      role: UserRole.FINANCE,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@email.com' },
    update: {},
    create: {
      email: 'employee@email.com',
      name: 'Funcionário',
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
    },
  });

  const category1 = await prisma.category.upsert({
    where: { name: 'Transporte' },
    update: {},
    create: {
      name: 'Transporte',
      description: 'Despesas com transporte',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Alimentação' },
    update: {},
    create: {
      name: 'Alimentação',
      description: 'Despesas com alimentação',
    },
  });

  const category3 = await prisma.category.upsert({
    where: { name: 'Hospedagem' },
    update: {},
    create: {
      name: 'Hospedagem',
      description: 'Despesas com hospedagem',
    },
  });

  console.log('Seed completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
