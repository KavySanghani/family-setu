import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('FamilySetu API');
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
