const express = require('express');
const RSSParser = require('rss-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const parser = new RSSParser();

app.get('/feed', async (req, res) => {
  try {
    const originalFeedUrl = 'https://tenerife-belfin-property.com/property/feed/';
    const { search } = req.query;

    const feedResponse = await axios.get(originalFeedUrl);
    const feedData = await parser.parseString(feedResponse.data);

    let items = feedData.items;

    if (search) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.contentSnippet.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(items.map(item => {
      const imageUrls = [...item.content.matchAll(/<img[^>]+src="?([^"\s]+)"?[^>]*\/>/gi)].map(m => m[1]);
      return {
        title: item.title,
        link: item.link,
        description: item.contentSnippet,
        images: imageUrls
      };
    }));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Enhanced Middleware running on port 3000.');
});


