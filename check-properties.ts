import { prisma } from './lib/database';

async function main() {
  const properties = await prisma.property.findMany({
    select: { id: true, slug: true, title: true, listing_type: true }
  });
  console.log('Properties:', properties);
  await prisma.$disconnect();
}

main().catch(console.error);