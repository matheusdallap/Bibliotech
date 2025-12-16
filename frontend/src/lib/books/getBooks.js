// lib/getBooks.js
export async function getBooks() {
  try {
    const response = await fetch("http://localhost:8000/books/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      return {
        success: false,
        message: "Erro ao buscar livros."
      }
    }

    const result = await response.json()

    return result

  } catch (error) {
    return {
      success: false,
      message: "Falha de comunicação com o servidor."
    }
  }
}
