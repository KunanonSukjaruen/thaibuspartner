const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = 3000;

// เพื่อเสิร์ฟไฟล์ static (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API routes (ถ้ามี)
app.get('/api/example', (req, res) => {
  res.json({ message: 'API is working' });
});

// ส่งหน้า index เมื่อเข้าถึงหน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'check_in.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});