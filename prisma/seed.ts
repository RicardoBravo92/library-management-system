import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

// Usamos el prisma ya configurado en src/config/prisma.ts

async function main() {
  console.log('🌱 Iniciando seeder...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Crear usuarios (upsert: no borra, agrega si no existen)
  const userData = [
    { email: 'admin@library.com', password: hashedPassword, name: 'Admin' },
    { email: 'user@library.com', password: hashedPassword, name: 'Usuario Demo' },
  ];
  let usersCreated = 0;
  for (const u of userData) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: u,
      update: {},
    });
    usersCreated++;
  }
  console.log(`✅ ${usersCreated} usuarios procesados (creados o ya existían)`);

  // Obtener o crear autores (sin borrar los existentes)
  const authorData = [
    { name: 'Gabriel García Márquez', nationality: 'Colombiano' },
    { name: 'Isabel Allende', nationality: 'Chilena' },
    { name: 'Jorge Luis Borges', nationality: 'Argentino' },
    { name: 'Mario Vargas Llosa', nationality: 'Peruano' },
  ];
  const authors = [];
  for (const a of authorData) {
    let author = await prisma.author.findFirst({
      where: { name: a.name, nationality: a.nationality },
    });
    if (!author) {
      author = await prisma.author.create({ data: a });
    }
    authors.push(author);
  }
  console.log(`✅ ${authors.length} autores listos (creados o existentes)`);

  // Crear libros solo si no existen (mismo título + autor)
  const bookData = [
    { title: 'Cien años de soledad', genre: 'Realismo mágico', authorIndex: 0 },
    { title: 'El amor en los tiempos del cólera', genre: 'Romance', authorIndex: 0 },
    { title: 'La casa de los espíritus', genre: 'Realismo mágico', authorIndex: 1 },
    { title: 'Eva Luna', genre: 'Ficción', authorIndex: 1 },
    { title: 'Ficciones', genre: 'Cuentos', authorIndex: 2 },
    { title: 'El Aleph', genre: 'Cuentos', authorIndex: 2 },
    { title: 'La ciudad y los perros', genre: 'Novela', authorIndex: 3 },
    { title: 'Conversación en La Catedral', genre: 'Novela', authorIndex: 3 },
  ];
  let booksCreated = 0;
  for (const b of bookData) {
    const authorId = authors[b.authorIndex].id;
    const exists = await prisma.book.findFirst({
      where: { title: b.title, authorId },
    });
    if (!exists) {
      await prisma.book.create({
        data: { title: b.title, genre: b.genre, authorId },
      });
      booksCreated++;
    }
  }
  console.log(`✅ ${booksCreated} libros nuevos creados`);

  // Actualizar bookCount en todos los autores que tienen libros
  const allAuthors = await prisma.author.findMany();
  for (const author of allAuthors) {
    const count = await prisma.book.count({ where: { authorId: author.id } });
    await prisma.author.update({
      where: { id: author.id },
      data: { bookCount: count },
    });
  }
  console.log('✅ Contadores de autores actualizados');

  console.log('\n🎉 Seeder completado exitosamente!');
  console.log('\nCredenciales de prueba:');
  console.log('  - admin@library.com / password123');
  console.log('  - user@library.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
