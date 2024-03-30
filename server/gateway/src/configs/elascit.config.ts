export const localElasticSearch = {
  node: 'http://elasticsearch:9200',
  auth: {
    username: 'elastic',
    password: 'elastic',
  },
};

export const awsElasticSearch = {
  node: process.env.AWS_ES_HOST || '',
  auth: {
    username: process.env.AWS_ES_USERNAME || '',
    password: process.env.AWS_ES_PASSWORD || '',
  },
};
