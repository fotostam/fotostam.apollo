const findImage = {
    Query: {
            findImage: async (_, args, context, info) => {
                let result = await client.search({
                    index: "fotoindex",
                    body: {
                    query: {
                        wildcard: {
                        filename: "*" + args.tag + "*"
                        }
                    }
                    }
                });

                return result.body.hits.hits.map(x => {
                    let result = x._source;
                    if (result.filename) {
                    result.url = thumbor
                        .setImagePath(result.filename)
                        .resize(150, 150)
                        .buildUrl();
                    }
                    return result;
                });

        },
    },
};

module.exports = {
    findImage,
}


