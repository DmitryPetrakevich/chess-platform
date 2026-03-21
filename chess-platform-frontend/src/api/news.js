const PROXY_URL = 'https://api.rss2json.com/v1/api.json?rss_url='

const NEWS_SOURCES = [
  { name: 'Lichess Blog', url: 'https://lichess.org/blog.atom' },
  { name: 'Chess.com News', url: 'https://www.chess.com/rss/news' },
  { name: 'The Week in Chess', url: 'https://theweekinchess.com/twic-rss-feed' },
  { name: 'ChessBase', url: 'https://en.chessbase.com/feed' },
]

/**
 * Парсит HTML-контент новости, извлекает миниатюру и очищает текст
 */
const parseNewsItem = (item, sourceName) => {
  let thumbnail = ''
  const html = item.description || item.content || ''
  const imgMatch = html.match(/<img[^>]+src=["'](.*?)["']/i)
  if (imgMatch && imgMatch[1]) {
    thumbnail = imgMatch[1].replace(/&amp;/g, '&')
  }

  const cleanContent = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()

  return {
    title: item.title || 'Без заголовка',
    link: item.link || '#',
    pubDate: item.pubDate || item.published || '',
    content: cleanContent.substring(0, 120) + (cleanContent.length > 120 ? '...' : ''),
    thumbnail,
    source: sourceName
  }
}

/**
 * Загружает новости из RSS-источников
 * @returns {Promise<Array>} Массив новостей
 */
export const fetchNewsFromRSS = async () => {
  for (const source of NEWS_SOURCES) {
    try {
      console.log(`Пробуем: ${source.name} (${source.url})`)
      
      const response = await fetch(PROXY_URL + encodeURIComponent(source.url), {
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) continue

      const data = await response.json()

      if (data.status !== 'ok' || !data.items?.length) continue

      const items = data.items
        .map(item => parseNewsItem(item, source.name))
        .filter(item => item.title && item.link)
        .slice(0, 8)

      if (items.length > 0) {
        return items
      }
    } catch (err) {
      console.warn(`Источник ${source.name} ошибка:`, err)
      continue
    }
  }

  return [] // если ни один источник не сработал
}