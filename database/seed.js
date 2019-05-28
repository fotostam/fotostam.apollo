require('dotenv').config()
const { Prisma } = require('prisma-binding')

const db = new Prisma({
    typeDefs: 'src/typeDefs/prisma.graphql',
    endpoint: process.env.PRISMA_URL
  });


const setup = async () => {
    const order = await db.mutation.createOrder({
        data: {
            
            name: 'Eef',
            subtype: 'WELPEN',
            status: 'IN_PRODUCTION',
            group: 'Fotostam',
            camp: 4,
            groupphoto: true,
            print: true,
            digital: true,
            photos: {
                create: [
                {
                    tag: 'test.png',
                    amount: 2,
                    status: 'HEALTHY'
                },
                {
                    tag: 'test2.png',
                    amount: 1,
                    status: 'HEALTHY'
                }
            ]
            }
        }
    });
}

setup();