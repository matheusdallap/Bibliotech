export async function getFavorites() {
  try {
    const token = localStorage.getItem('access_token')

    if (!token) {
      return { success: false, message: 'Usuário não autenticado.', data: [] }
    }

    const response = await fetch('http://localhost:8000/books/favorites/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Erro ao recuperar lista de favoritos.',
        data: [],
      }
    }

    return result
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error)
    return {
      success: false,
      message: 'Erro de conexão com o servidor.',
      data: [],
    }
  }
}
