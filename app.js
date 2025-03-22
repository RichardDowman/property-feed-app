const express = require('express');
const RSSParser = require('rss-parser');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// This endpoint calls the WordPress REST API for your property posts.
// The _embed parameter tells WordPress to include extra info like the featured image.
app.get('/feed', async (req, res) => {
  try {
    const search = req.query.search;
    // Note: This URL assumes your custom post type "property" is available via the REST API.
    // You can test it by visiting: https://tenerife-belfin-property.com/wp-json/wp/v2/property?_embed
    const apiUrl = 'https://tenerife-belfin-property.com/wp-json/wp/v2/property?_embed';
    const response = await axios.get(apiUrl);
    let items = response.data;

    // If a search term is provided, filter the items by title or excerpt.
    if (search) {
      items = items.filter(item => {
        const title = item.title.rendered.toLowerCase();
        const excerpt = item.excerpt.rendered.toLowerCase();
        return title.includes(search.toLowerCase()) || excerpt.includes(search.toLowerCase());
      });
    }

    const results = items.map(item => {
      // First, try to get the featured image from the embedded data.
      let images = [];
      if (
        item._embedded &&
        item._embedded['wp:featuredmedia'] &&
        item._embedded['wp:featuredmedia'][0]
      ) {
        images.push(item._embedded['wp:featuredmedia'][0].source_url);
      }
      
      // Then, also look for additional images in the content (if any)
      const content = item.content.rendered;
      const regex = /<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi;
      const additionalImages = [...content.matchAll(regex)].map(match => match[1]);
      images = images.concat(additionalImages);
      // Remove duplicate image URLs.
      images = [...new Set(images)];

      return {
        title: item.title.rendered,
        link: item.link,
        description: item.excerpt.rendered, // Use excerpt; you can change to item.content.rendered if you wish.
        images: images
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Middleware API running on port 3000.');
});
