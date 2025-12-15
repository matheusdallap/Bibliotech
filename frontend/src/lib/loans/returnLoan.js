export async function returnLoan(loanId) {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return { success: false, message: 'Usuário não autenticado.' }
  }

  try {
    const response = await fetch(`http://localhost:8000/loans/${loanId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.message || 'Erro ao devolver livro.' }
    }

    return data

  } catch (error) {
    console.error('Erro ao devolver livro:', error)
    return { success: false, message: 'Erro de conexão com o servidor.' }
  }
}
