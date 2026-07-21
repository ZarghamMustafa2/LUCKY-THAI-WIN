import prisma from './utils/db';
import bcrypt from 'bcrypt';

async function seed() {
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
