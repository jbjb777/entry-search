// Vercel 서버리스 함수 - 엔트리 API 프록시
module.exports = async (req, res) => {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // 요청 본문 파싱
    let body = req.body;
    
    // body가 문자열이면 파싱
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { searchTerm, limit = 20, offset = 0 } = body;

    if (!searchTerm) {
      return res.status(400).json({ 
        success: false,
        error: 'searchTerm is required' 
      });
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
    const entryResponse = await fetch('https://playentry.org/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    const data = await entryResponse.json();

    // 에러 체크
    if (data.errors) {
      return res.status(500).json({ 
        success: false,
        error: 'Entry API error', 
        details: data.errors[0]?.message || 'Unknown error'
      });
    }

    // 성공 응답
    return res.status(200).json({
      success: true,
      users: data.data?.SELECT_USERS || []
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
