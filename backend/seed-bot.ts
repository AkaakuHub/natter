import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBot() {
  try {
    // Botユーザーを作成
    const bot = await prisma.user.upsert({
      where: { id: 'bot_user_001' },
      update: {},
      create: {
        id: 'bot_user_001',
        name: 'Natter Bot',
        image: '/no_avatar_image_128x128.png',
        twitterId: 'bot_user_001',
      },
    });

    console.log('✅ Bot user created:', bot);

    // Botの投稿をいくつか作成
    const posts = [
      {
        content:
          'こんにちは！Natter Botです🤖 みなさんの投稿を楽しみにしています！',
        authorId: bot.id,
      },
      {
        content:
          'フォロー機能のテストにご協力ください！気軽にフォローしてみてくださいね✨',
        authorId: bot.id,
      },
      {
        content:
          '今日も素敵な1日をお過ごしください🌟 何か困ったことがあれば、いつでもお声かけください！',
        authorId: bot.id,
      },
    ];

    for (const postData of posts) {
      const post = await prisma.post.create({
        data: postData,
      });
      console.log('✅ Bot post created:', post.content);
    }

    console.log('🎉 Bot seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding bot:', error);
  } finally {
    await prisma.$disconnect();
  }
}

void seedBot();
