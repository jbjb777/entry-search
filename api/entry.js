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
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (!result.data || !result.data.SELECT_PROJECTS) {
      return res.status(500).json({ error: "GraphQL Failed", detail: result });
    }

    res.status(200).json(result.data.SELECT_PROJECTS);
  } catch (e) {
    res.status(500).json({ error: "Server Error", detail: e.toString() });
  }
}
