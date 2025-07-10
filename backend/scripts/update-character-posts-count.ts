import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCharacterPostsCount() {
  console.log('Updating character posts count...');

  try {
    // 全てのキャラクターを取得
    const characters = await prisma.character.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                deletedAt: null, // 削除されていない投稿のみカウント
              },
            },
          },
        },
      },
    });

    // 各キャラクターの投稿数を更新
    for (const character of characters) {
      const actualPostsCount = character._count.posts;
      
      if (character.postsCount !== actualPostsCount) {
        await prisma.character.update({
          where: { id: character.id },
          data: { postsCount: actualPostsCount },
        });
        
        console.log(
          `Updated character "${character.name}" (ID: ${character.id}): ${character.postsCount} -> ${actualPostsCount}`,
        );
      }
    }

    console.log('Character posts count update completed!');
  } catch (error) {
    console.error('Error updating character posts count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCharacterPostsCount();