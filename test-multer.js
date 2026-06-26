const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/test', upload.any(), (req, res) => {
  res.json({ body: req.body, files: req.files });
});

app.listen(3001, () => console.log('started'));
