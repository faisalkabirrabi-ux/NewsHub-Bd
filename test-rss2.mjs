import axios from 'axios';

async function run() {
  const { data } = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml');
  console.log(data.items[0]);
}
run();
