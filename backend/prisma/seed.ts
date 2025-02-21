import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const posts:any = []

for(let i = 0; i < 100; i++) {
    posts.push({ title: `title ${i + 1}`})
}

async function main() {
    const alice = await prisma.user.create({
        data: {
            name: 'Alice',
            email: 'alice@example.com',
            posts: {
                create: posts
            }
        }
    })

    const bob = await prisma.user.create({
        data: {
            name: 'Bob',
            email: 'bob@example.com',
            posts: {
                create: {
                    title: 'Check out Prisma with Next.js',
                }
            }
        }
    })

    console.log({alice, bob})
}

main()
    .catch(e => {
        console.error(e)
        // process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })