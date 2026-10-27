const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function scrapeProduct(url) {
  try {
    const html = await fetchUrl(url);

    // Title
    const titleMatch = html.match(/<h1[^>]*class=["'][^"']*product_title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)
      || html.match(/<meta property=["']og:title["'] content=["'](.*?)["']/i);
    const title = titleMatch ? stripHtml(titleMatch[1]).replace(/\s*\|\s*WISH Boyke & Co.*$/i, '') : '';

    // Description
    const shortDescMatch = html.match(/class=["'][^"']*woocommerce-product-details__short-description[^"']*["']>([\s\S]*?)<\/div>/i);
    let desc = shortDescMatch ? stripHtml(shortDescMatch[1]) : '';
    if (!desc) {
      const ogDesc = html.match(/<meta property=["']og:description["'] content=["'](.*?)["']/i);
      desc = ogDesc ? ogDesc[1] : '';
    }

    // Images
    const images = [];
    const ogImg = html.match(/<meta property=["']og:image["'] content=["'](.*?)["']/i);
    if (ogImg && ogImg[1]) {
      images.push(ogImg[1]);
    }
    // WooCommerce gallery images
    const galleryMatches = html.matchAll(/data-large_image=["'](.*?)["']/g);
    for (const m of galleryMatches) {
      if (m[1] && !images.includes(m[1])) {
        images.push(m[1]);
      }
    }

    // Price
    // Look for <ins><span class="woocommerce-Price-amount amount">...</span></ins> (sale)
    // and <del><span class="woocommerce-Price-amount amount">...</span></del> (regular)
    let price = 0;
    let compareAtPrice = undefined;

    const delPriceMatch = html.match(/<del[^>]*>[\s\S]*?class=["']woocommerce-Price-amount amount["']>[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/i);
    const insPriceMatch = html.match(/<ins[^>]*>[\s\S]*?class=["']woocommerce-Price-amount amount["']>[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/i);

    if (insPriceMatch && delPriceMatch) {
      const curStr = stripHtml(insPriceMatch[1]).replace(/[^\d]/g, '');
      const regStr = stripHtml(delPriceMatch[1]).replace(/[^\d]/g, '');
      price = parseInt(curStr, 10) || 0;
      compareAtPrice = parseInt(regStr, 10) || undefined;
    } else {
      const anyPriceMatch = html.match(/class=["'][^"']*woocommerce-Price-amount amount[^"']*["']>[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/i);
      if (anyPriceMatch) {
        const curStr = stripHtml(anyPriceMatch[1]).replace(/[^\d]/g, '');
        price = parseInt(curStr, 10) || 0;
      }
    }

    // Category
    const catMatch = html.match(/rel=["']tag["']>([\s\S]*?)<\/a>/i);
    const categoryName = catMatch ? stripHtml(catMatch[1]) : 'Herbal & Wellness';

    // Slug
    const slug = url.replace(/\/$/, '').split('/').pop();

    return {
      url,
      slug,
      title,
      description: desc,
      price,
      compare_at_price: compareAtPrice,
      images,
      categoryName
    };
  } catch (err) {
    console.error(`Failed to scrape ${url}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('Fetching product sitemap...');
  const sitemapXml = await fetchUrl('https://wishboyke.id/product-sitemap.xml');
  const urls = (sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [])
    .map(u => u.replace(/<\/?loc>/g, '').trim())
    .filter(u => u.includes('/produk/'));

  console.log(`Found ${urls.length} product URLs. Scraping...`);
  const products = [];

  for (const url of urls) {
    console.log(`Scraping: ${url}`);
    const prod = await scrapeProduct(url);
    if (prod && prod.title) {
      products.push(prod);
    }
  }

  console.log(`Scraped ${products.length} products successfully.`);
  fs.writeFileSync(
    path.join(__dirname, 'wishboyke-products.json'),
    JSON.stringify(products, null, 2),
    'utf-8'
  );
  console.log('Saved to scripts/wishboyke-products.json');
}

run();
