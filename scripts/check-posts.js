const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: {
      keyword: {
        in: ['R1049', 'C020']
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 2
  });

  console.log('===== R1049, C020 포스트 확인 =====\n');

  posts.forEach((post, index) => {
    console.log(`\n[${index + 1}] 포스트 정보:`);
    console.log('- ID:', post.id);
    console.log('- Keyword:', post.keyword);
    console.log('- Title:', post.title);
    console.log('- Status:', post.status);
    console.log('- Error:', post.errorMessage || '없음');
    console.log('- Content 일부 (처음 500자):');
    console.log(post.content.substring(0, 500));
    console.log('\n---');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
