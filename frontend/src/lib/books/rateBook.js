export async function rateBook(bookId, stars) {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return { success: false, message: 'Usuário não autenticado.' }
  }

  try {
    const response = await fetch(`http://localhost:8000/books/${bookId}/rate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ stars }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || 'Erro ao avaliar o livro.',
        data,
      }
    }

    return data

  } catch (error) {
    console.error('Erro ao avaliar o livro:', error)
    return { success: false, message: 'Erro de conexão com o servidor.' }
  }
}
