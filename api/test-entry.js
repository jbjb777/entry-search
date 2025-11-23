import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    // 간단한 GraphQL 쿼리 테스트
    const query = `
      query SELECT_USERS($username: String, $limit: Int) {
        SELECT_USERS(username: $username, limit: $limit) {
          _id
          username
          nickname
        }
      }
    `;

    const variables = {
      username: "test",
      limit: 5
    };

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

    const data = await entryResponse.json();

    return res.status(200).json({
      success: true,
      entryApiStatus: entryResponse.status,
      data: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
