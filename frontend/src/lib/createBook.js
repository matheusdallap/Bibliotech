export async function createBook(bookData) {
  try {
    // Pega o token de autenticação do localStorage
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('Nenhum token encontrado. Usuário precisa logar.')
      return { success: false, message: 'Usuário não autenticado.' }
    }

    // Requisição POST para criar o livro
    const response = await fetch('http://localhost:8000/books/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookData)
    })

    // Verifica se a requisição retornou erro
    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, message: errorData.message || 'Erro ao criar livro.', data: errorData }
    }

    // Retorna a resposta em JSON
    const result = await response.json()
    return result

  } catch (error) {
    console.error('Erro ao criar livro:', error)
    return { success: false, message: 'Erro de conexão com o servidor.' }
  }
}
