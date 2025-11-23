export default async function handler(req, res) {
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
    const { searchTerm, limit = 20, offset = 0 } = req.body;

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
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });

    if (!entryResponse.ok) {
      return res.status(500).json({
        success: false,
        error: `Entry API returned ${entryResponse.status}`
      });
    }

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
    return res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
}
