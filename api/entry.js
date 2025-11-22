export default async function handler(req, res) {
  try {
    const { term } = req.query;

    const query = `
      query {
        SELECT_PROJECTS(limit: 20, offset: 0, term: "${term}", order: "created", sort: "desc") {
          _id
          name
          thumb
          views
          likes
          comments
          created
          user {
            username
          }
        }
      }
    `;

    const response = await fetch("https://playentry.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://playentry.org",
        "Referer": "https://playentry.org/",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json().catch(() => null);

    if (!result?.data?.SELECT_PROJECTS) {
      return res.status(500).json({
        error: "GraphQL Failed",
        detail: result
      });
    }

    return res.status(200).json(result.data.SELECT_PROJECTS);

  } catch (e) {
    return res.status(500).json({
      error: "Server Error",
      detail: e.toString(),
    });
  }
}
