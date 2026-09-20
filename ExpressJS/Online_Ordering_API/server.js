const express = require('express');
const server = express();
const fs = require('fs');

// Always read fresh data from file
function loadOrders() {
  return JSON.parse(fs.readFileSync('./orders.json', 'utf8'));
}

server.set('port', process.env.PORT || 3000);

// Parse JSON bodies
server.use(express.json());

server.get('/', (req, res) => {
  res.send('Welcome to our simple online order managing web app!');
});

// GET /orders
server.get('/orders', (req, res) => {
  const orderData = loadOrders();
  res.json(orderData);
});

// POST /neworder
server.post('/neworder', (req, res) => {
  const orderData = loadOrders();

  orderData.orders.push(req.body);

  fs.writeFileSync('./orders.json', JSON.stringify(orderData, null, 2));

  res.send('New order added successfully!');
  console.log(`New order added: ${JSON.stringify(req.body)}`);
});

// PUT /update/:id
server.put('/update/:id', express.text({ type: '*/*' }), (req, res) => {
  const orderData = loadOrders();
  const items = orderData.orders;

  items.forEach(o => {
    if (o && o.id === req.params.id) {
      console.log('Modifying order!');
      o.state = req.body;
    }
  });

  fs.writeFileSync('./orders.json', JSON.stringify(orderData, null, 2));

  res.send(`Order with ID ${req.params.id} updated successfully!`);
  console.log(`Order with ID ${req.params.id} updated successfully!`);
});

// DELETE /delete/:id
server.delete('/delete/:id', (req, res) => {
  const orderData = loadOrders();
  const newData = { orders: [] };

  orderData.orders.forEach(o => {
    if (o && o.id !== req.params.id) {
      newData.orders.push(o);
    } else if (o && o.id === req.params.id) {
      console.log('Deleting order!');
    }
  });

  fs.writeFileSync('./orders.json', JSON.stringify(newData, null, 2));

  res.send(`Order with ID ${req.params.id} deleted successfully!`);
  console.log(`Order with ID ${req.params.id} deleted successfully!`);
});

server.listen(server.get('port'), () => {
  console.log(`Express server started at port ${server.get('port')}`);
});