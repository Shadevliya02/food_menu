const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database dengan data contoh
let menuItems = [
  {
    id: "1",
    name: "Mie Ayam Komplit",
    description: "Mie ayam dengan topping ayam kecap, bakso, dan pangsit",
    price: 22000,
    image_id: "https://img.freepik.com/premium-photo/close-up-food-plate-table_1048944-9962990.jpg",
    user_id: null
  },
  {
    id: "2",
    name: "Es Kopi Susu Gula Aren",
    description: "Kopi susu dengan gula aren khas, disajikan dingin",
    price: 18000,
    image_id: "https://img.freepik.com/premium-photo/iced-coffee-glasses_1220-3645.jpg",
    user_id: null
  },
  {
    id: "3",
    name: "Ayam Bakar Madu",
    description: "Ayam bakar dengan bumbu madu manis pedas, disajikan dengan nasi dan lalapan",
    price: 28000,
    image_id: "https://img.freepik.com/premium-photo/plate-food-with-rice-chicken-it_871710-1505.jpg",
    user_id: null
  },
  {
    id: "4",
    name: "Teh Tarik Dingin",
    description: "Minuman teh tarik khas Malaysia, disajikan dengan es",
    price: 15000,
    image_id: "https://img.freepik.com/premium-photo/ice-coffee-tall-glass-with-cream-poured-ice-cubes-beans-old-rustic-wooden-table-cold-summer-drink-with-tubes-black-background_1029239-2947.jpg",
    user_id: null
  },
  {
    id: "5",
    name: "Nasi Goreng Spesial",
    description: "Nasi goreng dengan telur, ayam, dan sayuran",
    price: 25000,
    image_id: "https://img.freepik.com/free-photo/fried-rice-with-shrimps_1150-26585.jpg",
    user_id: null
  },
  {
    id: "6",
    name: "Pisang Goreng Coklat Keju",
    description: "Pisang goreng krispi dengan topping coklat dan keju",
    price: 17000,
    image_id: "https://img.freepik.com/premium-photo/tray-food-with-wooden-board-that-says-chocolate-it_1023064-80850.jpg",
    user_id: null
  }
];

// Helper function untuk generate ID baru
const generateNewId = () => {
  if (menuItems.length === 0) return "1";
  const maxId = Math.max(...menuItems.map(item => parseInt(item.id)));
  return (maxId + 1).toString();
};

// Konfigurasi upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, GIF) yang diperbolehkan'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Endpoint upload gambar
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'Tidak ada file yang diunggah atau format file tidak didukung' 
    });
  }
  
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ 
    success: true,
    imageUrl 
  });
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Middleware untuk validasi input menu
const validateMenuItem = (req, res, next) => {
  const { name, description, price } = req.body;
  
  if (!name || !description || !price) {
    return res.status(400).json({ 
      success: false,
      error: 'Nama, deskripsi, dan harga harus diisi' 
    });
  }
  
  if (isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Harga harus berupa angka positif' 
    });
  }
  
  next();
};

// CRUD Endpoints
app.get('/api/menu', (req, res) => {
  res.json({
    success: true,
    data: menuItems
  });
});

app.get('/api/menu/:id', (req, res) => {
  const item = menuItems.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ 
      success: false,
      error: 'Menu tidak ditemukan' 
    });
  }
  res.json({
    success: true,
    data: item
  });
});

app.post('/api/menu', validateMenuItem, (req, res) => {
  const { name, description, price, imageId, userId } = req.body;
  
  const newItem = {
    id: generateNewId(),
    name,
    description,
    price: Number(price),
    image_id: imageId || 'default-image.jpg',
    user_id: userId || null
  };
  
  menuItems.push(newItem);
  
  res.status(201).json({
    success: true,
    message: 'Menu berhasil ditambahkan',
    data: newItem
  });
});

app.put('/api/menu/:id', validateMenuItem, (req, res) => {
  const { id } = req.params;
  const { name, description, price, imageId, userId } = req.body;
  
  const itemIndex = menuItems.findIndex(i => i.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Menu tidak ditemukan' 
    });
  }
  
  // Cek kepemilikan menu
  if (menuItems[itemIndex].user_id && menuItems[itemIndex].user_id !== userId) {
    return res.status(403).json({ 
      success: false,
      error: 'Anda tidak memiliki izin untuk mengubah menu ini' 
    });
  }
  
  // Update data
  const updatedItem = {
    ...menuItems[itemIndex],
    name,
    description,
    price: Number(price),
    image_id: imageId || menuItems[itemIndex].image_id
  };
  
  menuItems[itemIndex] = updatedItem;
  
  res.json({
    success: true,
    message: 'Menu berhasil diperbarui',
    data: updatedItem
  });
});

app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  const itemIndex = menuItems.findIndex(i => i.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Menu tidak ditemukan' 
    });
  }
  
  // Cek kepemilikan menu
  if (menuItems[itemIndex].user_id && menuItems[itemIndex].user_id !== userId) {
    return res.status(403).json({ 
      success: false,
      error: 'Anda tidak memiliki izin untuk menghapus menu ini' 
    });
  }
  
  // Hapus menu
  const [deletedItem] = menuItems.splice(itemIndex, 1);
  
  res.json({
    success: true,
    message: 'Menu berhasil dihapus',
    data: deletedItem
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `Error upload file: ${err.message}`
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Terjadi kesalahan pada server'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint tidak ditemukan'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});