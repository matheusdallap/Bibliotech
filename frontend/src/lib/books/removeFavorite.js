export async function removeFavorites(bookId) {
  try {
    const token = localStorage.getItem('access_token')

    if (!token) {
      return { success: false, message: 'Usuário não autenticado.' }
    }

    const response = await fetch(`http://localhost:8000/books/favorites/${bookId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Erro ao remover dos favoritos.',
      }
    }

    return result
  } catch (error) {
    console.error('Erro ao remover favorito:', error)
    return { success: false, message: 'Erro de conexão com o servidor.' }
  }
}
