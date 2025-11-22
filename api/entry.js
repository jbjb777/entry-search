export default async function handler(req, res) {
  const { term = "", limit = 20 } = req.body;

  const query = `
    query ($limit: Int, $term: String) {
      SELECT_PROJECTS(
        limit: $limit,
        order: "recent",
        sort: "desc",
        term: $term
      ) {
        _id
        name
        thumb
        user { username }
      }
    }
  `;

  try {
    const apiRes = await fetch("https://playentry.org/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { limit, term } }),
    });

    const data = await apiRes.json();
    return res.status(200).json(data.data.SELECT_PROJECTS || []);
  } catch (err) {
    return res.status(500).json({ error: "Server request failed" });
  }
}
