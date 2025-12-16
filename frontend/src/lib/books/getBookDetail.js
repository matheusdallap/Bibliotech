export async function getBookDetail(bookId) {
  try {
    const response = await fetch(
      `http://localhost:8000/books/${bookId}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao buscar detalhes do livro.',
      }
    }

    return data
  } catch (error) {
    return {
      success: false,
      message: 'Falha de comunicação com o servidor.',
    }
  }
}
