// Vercel 서버리스 함수 - 엔트리 API 프록시
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchTerm, limit = 20, offset = 0 } = req.body;

    if (!searchTerm) {
      return res.status(400).json({ error: 'searchTerm is required' });
    }

    // GraphQL 쿼리
    const query = `
      query SELECT_USERS($username: String, $limit: Int, $offset: Int) {
        SELECT_USERS(username: $username, limit: $limit, offset: $offset) {
          _id
          username
          nickname
          profileImage
          status {
            following
            follower
          }
          description
        }
      }
    `;

    const variables = {
      username: searchTerm,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // 엔트리 API 호출
    const response = await fetch('https://playentry.org/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await response.json();

    // 에러 체크
    if (data.errors) {
      return res.status(500).json({ 
        error: 'Entry API error', 
        details: data.errors 
      });
    }

    // 성공 응답
    return res.status(200).json({
      success: true,
      users: data.data?.SELECT_USERS || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
