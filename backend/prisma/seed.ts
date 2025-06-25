import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create users with avatar images
    const alice = await prisma.user.create({
        data: {
            name: 'Alice',
            email: 'alice@example.com',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            twitterId: 'alice_twitter'
        }
    })

    const bob = await prisma.user.create({
        data: {
            name: 'Bob',
            email: 'bob@example.com',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            twitterId: 'bob_twitter'
        }
    })

    const charlie = await prisma.user.create({
        data: {
            name: 'Charlie',
            email: 'charlie@example.com',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            twitterId: 'charlie_twitter'
        }
    })

    // Create posts with content and images
    const post1 = await prisma.post.create({
        data: {
            content: 'Just had an amazing breakfast! 🍳',
            images: JSON.stringify(['https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop']),
            authorId: alice.id
        }
    })

    const post2 = await prisma.post.create({
        data: {
            content: 'Working on some exciting new features! Can\'t wait to share them with you all. #coding #development',
            authorId: bob.id
        }
    })

    const post3 = await prisma.post.create({
        data: {
            content: 'Beautiful sunset today! 🌅',
            images: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop']),
            authorId: charlie.id
        }
    })

    const post4 = await prisma.post.create({
        data: {
            content: 'Learning new technologies is always fun! Currently diving deep into Next.js and NestJS.',
            authorId: alice.id
        }
    })

    const post5 = await prisma.post.create({
        data: {
            content: 'Coffee and code - the perfect combination ☕',
            images: JSON.stringify(['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop']),
            authorId: bob.id
        }
    })

    // Create some likes
    await prisma.like.create({
        data: {
            userId: bob.id,
            postId: post1.id
        }
    })

    await prisma.like.create({
        data: {
            userId: charlie.id,
            postId: post1.id
        }
    })

    await prisma.like.create({
        data: {
            userId: alice.id,
            postId: post2.id
        }
    })

    await prisma.like.create({
        data: {
            userId: alice.id,
            postId: post3.id
        }
    })

    console.log('Database seeded successfully!')
}

main()
    .catch(e => {
        console.error(e)
        // process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })