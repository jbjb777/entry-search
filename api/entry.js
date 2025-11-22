export default async function handler(req, res) {
  try {
    const { term } = req.query;

    const url = `https://playentry.org/api/project/find?search=${encodeURIComponent(term)}&page=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const result = await response.json();

    if (!Array.isArray(result.data)) {
      return res.status(500).json({ error: "Invalid data", result });
    }

    res.status(200).json(result.data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
