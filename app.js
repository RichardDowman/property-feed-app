const express = require('express');
const RSSParser = require('rss-parser');
const RSS = require('rss');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const parser = new RSSParser();

app.get('/feed', async (req, res) => {
  try {
    const originalFeedUrl = 'https://tenerife-belfin-property.com/property/feed/';

    // Fetch original feed
    const feedResponse = await axios.get(originalFeedUrl);
    const feedData = await parser.parseString(feedResponse.data);

    // Create new RSS feed
    const customFeed = new RSS({
      title: 'Tenerife Belfin Property App Feed',
      description: 'Custom RSS feed for GoodBarber',
      feed_url: 'http://localhost:3000/feed',
      site_url: 'https://tenerife-belfin-property.com/property',
    });

    // Populate items
    feedData.items.forEach((item) => {
      let imgUrlMatch = item.content.match(/<img[^>]+src="?([^"\s]+)"?[^>]*\/>/i);
      let imgUrl = imgUrlMatch ? imgUrlMatch[1] : null;

      customFeed.item({
        title: item.title,
        description: imgUrl
          ? `<img src="${imgUrl}" /><br>${item.contentSnippet || ''}`
          : item.contentSnippet || '',
        url: item.link,
        date: item.pubDate,
        enclosure: imgUrl
          ? { url: imgUrl, type: 'image/jpeg' }
          : undefined,
      });
    });

    res.set('Content-Type', 'application/rss+xml');
    res.send(customFeed.xml({ indent: true }));

  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).send(`Failed to generate feed. Error: ${error.message}`);
  }
});

app.listen(3000, () => {
  console.log('Middleware RSS feed server running on port 3000.');
});
