module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    method: req.method,
    body: req.body
  });
};
```

## 최종 파일 구조
```
your-repo/
├── index.html
├── vercel.json
└── api/
    ├── search.js
    └── test.js (선택사항 - 테스트용)
