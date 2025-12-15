export async function createLoan(bookId) {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return { success: false, message: 'Usuário não autenticado.' }
  }

  try {
    const response = await fetch('http://localhost:8000/loans/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ book: bookId })
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.message || 'Erro ao realizar empréstimo.' }
    }

    return data

  } catch (error) {
    console.error('Erro ao realizar empréstimo:', error)
    return { success: false, message: 'Erro de conexão com o servidor.' }
  }
}
