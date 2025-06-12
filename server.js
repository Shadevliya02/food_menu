const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Data Awal Menu Makanan
let menuItems = [
    {"id":"1","name":"Mie Ayam Komplit","description":"Mie ayam dengan topping ayam kecap, bakso, dan pangsit","price":22000,"imageId":"https://img.freepik.com/premium-photo/close-up-food-plate-table_1048944-9962990.jpg"},
    {"id":"2","name":"Es Kopi Susu Gula Aren","description":"Kopi susu dengan gula aren khas, disajikan dingin","price":18000,"imageId":"https://img.freepik.com/premium-photo/iced-coffee-glasses_1220-3645.jpg"},
    {"id":"3","name":"Ayam Bakar Madu","description":"Ayam bakar dengan bumbu madu manis pedas, disajikan dengan nasi dan lalapan","price":28000,"imageId":"https://img.freepik.com/premium-photo/plate-food-with-rice-chicken-it_871710-1505.jpg"},
    {"id":"4","name":"Teh Tarik Dingin","description":"Minuman teh tarik khas Malaysia, disajikan dengan es","price":15000,"imageId":"https://img.freepik.com/premium-photo/ice-coffee-tall-glass-with-cream-poured-ice-cubes-beans-old-rustic-wooden-table-cold-summer-drink-with-tubes-black-background_1029239-2947.jpg"},
    {"id":"5","name":"Nasi Goreng Spesial","description":"Nasi goreng dengan telur, ayam, dan sayuran","price":25000,"imageId":"https://img.freepik.com/free-photo/fried-rice-with-shrimps_1150-26585.jpg"},
    {"id":"6","name":"Pisang Goreng Coklat Keju","description":"Pisang goreng krispi dengan topping coklat dan keju","price":17000,"imageId":"https://img.freepik.com/premium-photo/tray-food-with-wooden-board-that-says-chocolate-it_1023064-80850.jpg"}
];

// GET ALL MENU ITEMS
app.get('/api/menu', (req, res) => {
    res.json(menuItems);
});

// GET SINGLE MENU ITEM
app.get('/api/menu/:id', (req, res) => {
    const item = menuItems.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Menu item not found');
    res.json(item);
});

// CREATE NEW MENU ITEM
app.post('/api/menu', (req, res) => {
    const newItem = {
        id: (menuItems.length + 1).toString(),
        ...req.body
    };
    menuItems.push(newItem);
    res.status(201).json(newItem);
});

// UPDATE MENU ITEM
app.put('/api/menu/:id', (req, res) => {
    const index = menuItems.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).send('Menu item not found');
    
    const updatedItem = {
        ...menuItems[index],
        ...req.body,
        id: req.params.id
    };
    
    menuItems[index] = updatedItem;
    res.json(updatedItem);
});

// DELETE MENU ITEM
app.delete('/api/menu/:id', (req, res) => {
    const index = menuItems.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).send('Menu item not found');
    
    menuItems = menuItems.filter(i => i.id !== req.params.id);
    res.status(204).send();
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});