export async function createComment(bookId, text) {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return { success: false, message: 'Usuário não autenticado.' }
  }

  try {
    const response = await fetch(`http://localhost:8000/books/comments/${bookId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || 'Erro ao postar comentário.',
        data,
      }
    }

    return data

  } catch (error) {
    console.error('Erro ao postar comentário:', error)
    return { success: false, message: 'Erro de conexão com o servidor.' }
  }
}
