const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// 👇 ここで制限を拡張（例：10MBまで許可）
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static('public'));

// 保存エンドポイント
app.post('/save', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `data/${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(req.body, null, 2));
  res.json({ success: true, filename });
});

// 一覧取得
app.get('/list', (req, res) => {
  const files = fs.readdirSync('data').filter(f => f.endsWith('.json'));
  res.json(files);
});

// 特定ファイル読み込み
app.get('/load/:filename', (req, res) => {
  const filePath = path.join('data', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

const submissionPath = path.join(__dirname, 'data', 'submissions.json');

// 投稿を保存
app.post('/submit', (req, res) => {
  const newEntry = {
    name: req.body.name || "匿名",
    text: req.body.text,
    time: new Date().toISOString()
  };

  let current = [];
  if (fs.existsSync(submissionPath)) {
    current = JSON.parse(fs.readFileSync(submissionPath, 'utf8'));
  }

  current.push(newEntry);
  fs.writeFileSync(submissionPath, JSON.stringify(current, null, 2));
  res.json({ success: true });
});

// 投稿の一覧を返す
app.get('/submissions', (req, res) => {
  if (fs.existsSync(submissionPath)) {
    res.sendFile(submissionPath);
  } else {
    res.json([]);
  }
});


app.listen(PORT, () => {
  console.log(`4koma API running at http://localhost:${PORT}`);
});