import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail']
  }
});

async function run() {
  const feed = await parser.parseURL('http://feeds.bbci.co.uk/news/world/rss.xml');
  console.log('BBC', feed.items[0]);
}

run();
