const ordersByStatus = {
    Query: {
        ordersByStatus: (_, args, context, info) => {
          console.log('ay!');
            return context.prisma.query
              .orders(
                {
                  where: {
                    status: args.status
                  }
                },
                info
              )
              .then(x => {
                return x.map(i => {
                  i.photos = i.photos.map(p => {
                    if (p.url == null && p.tag) {
                      p.url = thumbor
                        .setImagePath(p.tag)
                        .resize(150, 150)
                        .buildUrl();
                    }
                    return p;
                  });
        
                  return i;
                });
              });
          },
    },
  };

  module.exports = {
    ordersByStatus,
  }