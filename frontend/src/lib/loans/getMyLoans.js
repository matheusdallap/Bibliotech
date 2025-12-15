export async function getMyLoans() {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return { success: false, message: 'Usuário não autenticado.' }
  }

  try {
    const response = await fetch('http://localhost:8000/loans/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.message || 'Erro ao buscar empréstimos.' }
    }

    return data

  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error)
    return { success: false, message: 'Erro de conexão com o servidor.' }
  }
}
