//Function to fetch news from The Hacker News
async function fetchHackerNews() {
    try {
        const rssUrl = 'https://feeds.feedburner.com/TheHackersNews?format=xml';
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(rssUrl);
        const response = await fetch(proxyUrl);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        const articles = [];

        for (let i = 0; i < Math.min(3, items.length); i++) {
            const item = items[i];
            const title = item.querySelector('title').textContent;
            const link = item.querySelector('link').textContent;
            const pubDate = item.querySelector('pubDate').textContent;
            const description = item.querySelector('description').textContent;
            const cleanDesc = description.replace(/<[^>]+>/g, '').substring(0, 200) + '...';

            articles.push({
                title: title,
                url: link,
                time: new Date(pubDate).toLocaleDateString(),
                author: 'The Hacker News',
                excerpt: cleanDesc
            });
        }
        return articles;
    } catch (error) {
        console.error('Error fetching Hacker News:', error);
        return [];
    }
}

// Function to render articles
function renderArticles(articles) {
    const feedElement = document.getElementById('contentfeed');

    if (articles.length === 0) {
        feedElement.innerHTML = '<div class="loading">No articles found.</div>';
        return;
    }

    feedElement.innerHTML = '';

    articles.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.className = 'article-card';

        articleElement.innerHTML = `
            <div class="article-image">
                <img src="${generatePlaceholderImage(articleElement.title)}" alt="${article.title}">
            </div>
            <div class="article-content">
                <div>
                    <h2 class="article-title">${article.title}</h2>
                    <div class="article-meta">${article.time} • ${article.author}</div>
                    <p class="article-excerpt">${article.excerpt}</p>
                </div>
                <div class="article-source">Source: The Hacker News</div>
            </div>
        `;

        feedElement.appendChild(articleElement);
    });
}

// Function to update news
async function updateNews() {
    const feedElement = document.getElementById('contentfeed');
    feedElement.innerHTML = '<div class="loading">Updating news...</div>';
    const articles = await fetchHackerNews();
    renderArticles(articles);
}

updateNews();
setInterval(updateNews, 5 * 60 * 1000); // Update every 5 minutes