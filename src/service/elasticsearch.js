const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: process.env.ELASTICSEARCH_HOST || "http://localhost:9200"
});

module.exports = {
    client
}