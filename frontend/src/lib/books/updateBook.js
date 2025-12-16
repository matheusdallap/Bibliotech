// lib/books/updateBook.js

export const updateBook = async (id, formDataObj) => {
  try {
    const formData = new FormData()

    Object.entries(formDataObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image_file' && value instanceof File) {
          formData.append('image', value)
        } else if (key !== 'image_file') {
          formData.append(key, value)
        }
      }
    })

    const token = localStorage.getItem('access_token')

    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(
      `http://localhost:8000/books/detail/${id}/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar livro')
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar livro:', error)
    throw error
  }
}
