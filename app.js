const express = require('express');
const RSSParser = require('rss-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const parser = new RSSParser();

app.get('/feed', async (req, res) => {
  try {
    // URL of your original WordPress feed.
    const originalFeedUrl = 'https://tenerife-belfin-property.com/property/feed/';
    const { search } = req.query;

    // Get the feed data from the WordPress site.
    const feedResponse = await axios.get(originalFeedUrl);
    const feedData = await parser.parseString(feedResponse.data);

    let items = feedData.items;

    // If a search term is provided, filter the feed items by title or description.
    if (search) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.contentSnippet.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Map each item to our desired format.
    res.json(items.map(item => {
      // Use the full content if available, or fall back to the shorter content.
      const content = item['content:encoded'] || item.content || '';
      // The regex looks for <img> tags and gets the URL from src or data-src (in case of lazy loading).
      const images = [...content.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi)]
                      .map(match => match[1]);
      return {
        title: item.title,
        link: item.link,
        description: item.contentSnippet,
        images: images // This will be an array of image URLs.
      };
    }));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Middleware API running on port 3000.');
});
