const API_URL = 'http://localhost:3000/api'

export const searchUsers = async (query, token) => {
  if (!query || query.length < 2) return []
  
  try {
    const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('Ошибка поиска:', error)
    return []
  }
}