rs.initiate({
  _id: 'rs0',
  members: [
    {
      _id: 0,
      host: 'mgdb:27017',
      priority: 2,
    },
    {
      _id: 1,
      host: 'mgdb2:27017',
      priority: 0.5,
    },
  ],
});
