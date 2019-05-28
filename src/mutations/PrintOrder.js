const fs = require("fs");
const bucketdir = "/data/bucket/";
const printdir = "/data/print/";
const {gql} = require("apollo-server");

const printOrder = {
    Mutation: {
        printOrder: async (_, args, context, info) => {
                let photos = await context.prisma.query.photos(
                    {
                    where: {
                        order: {
                        id: args.id
                        }
                    }
                    },
                    gql`
                    {
                        id
                        tag
                        amount
                        order {
                        id
                        }
                    }
                    `
                );

                let success = true;

                //Copy the files
                for (let photo of photos) {
                    let path = bucketdir + photo.tag;
                    if (fs.existsSync(path)) {
                    for (var i = 0; i < photo.amount; i++) {
                        fs.copyFileSync(
                        path,
                        printdir + photo.order.id + " - " + i + "-" + photo.tag,
                        err => {
                            if (err) {
                            success = false;
                            context.prisma.mutation.updatePhoto({
                                data: {
                                status: "ERROR",
                                error: "Image could not be copied"
                                },
                                where: {
                                id: photo.id
                                }
                            });
                            }
                        }
                        );
                    }
                    } else {
                    context.prisma.mutation.updatePhoto({
                        data: {
                        status: "ERROR",
                        error: "Image could not be found"
                        },
                        where: {
                        id: photo.id
                        }
                    });
                    success = false;
                    }
                }

                if (success) {
                    return context.prisma.mutation.updateOrder(
                    {
                        data: {
                        status: "TO_BE_PICKED",
                        error: ""
                        },
                        where: {
                        id: args.id
                        }
                    },
                    info
                    );
                } else {
                    return context.prisma.mutation.updateOrder(
                    {
                        data: {
                        status: "ERROR",
                        error: "Something is wrong in this order"
                        },
                        where: {
                        id: args.id
                        }
                    },
                    info
                    );
                }
                }
            }
        };

    
module.exports = {
    printOrder,
}
            
