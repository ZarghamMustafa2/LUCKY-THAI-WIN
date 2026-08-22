import prisma from './utils/db';
import bcrypt from 'bcrypt';

async function seed() {
  const companyPhone = 'company';
  const existingCompany = await prisma.user.findUnique({ where: { phone: companyPhone } });
  if (!existingCompany) {
    const hashedPassword = await bcrypt.hash('Company123!', 10);
    await prisma.user.create({
      data: {
        name: 'Company HQ',
        phone: companyPhone,
        password: hashedPassword,
        role: 'COMPANY',
        wallet: 100000000
      }
    });
    console.log('COMPANY account seeded: Phone/Username company, Pass Company123!, Role COMPANY');
  } else {
    await prisma.user.update({
      where: { phone: companyPhone },
      data: { role: 'COMPANY' }
    });
    console.log('COMPANY account updated in database.');
  }

  const adminPhone = '0000000000'; // Default admin phone
  const existing = await prisma.user.findUnique({ where: { phone: adminPhone } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        phone: adminPhone,
        password: hashedPassword,
        role: 'admin',
        wallet: 1000000
      }
    });
    console.log('Admin seeded: Phone 0000000000, Pass admin123');
  } else {
    // If it exists but isn't admin, force it to admin
    await prisma.user.update({
      where: { phone: adminPhone },
      data: { role: 'admin' }
    });
    console.log('Admin updated.');
  }
}

seed().catch(console.error).finally(() => prisma.$disconnect());
