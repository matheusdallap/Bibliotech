export async function deleteBook(bookId) {
  const access = localStorage.getItem('access_token')

  if (!access) {
    return { success: false, message: 'Usuário não autenticado.' }
  }

  try {
    const response = await fetch(
      `http://localhost:8000/books/detail/${bookId}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${access}`,
        },
      }
    )

    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        message: data.message || 'Erro ao deletar livro.',
      }
    }

    return {
      success: true,
      message: 'Livro removido com sucesso.',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro de comunicação com o servidor.',
    }
  }
}
