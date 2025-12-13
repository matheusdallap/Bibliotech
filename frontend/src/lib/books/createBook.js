export async function createBook(bookData) {
  try {
    const token = localStorage.getItem('access_token')

    if (!token) {
      return { success: false, message: 'Usuário não autenticado.' }
    }

    const formData = new FormData()

    Object.entries(bookData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image_file' && value instanceof File) {
          formData.append('image', value)
        } else if (key !== 'image_file') {
          formData.append(key, value)
        }
      }
    })

    const response = await fetch('http://localhost:8000/books/create/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao criar livro.',
        data,
      }
    }

    return data
  } catch (error) {
    return { success: false, message: 'Erro de conexão com o servidor.' }
  }
}
