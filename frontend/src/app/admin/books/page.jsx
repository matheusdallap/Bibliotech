// app/admin/books/page.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getBooks } from '@/lib/books/getBooks'
import { deleteBook } from '@/lib/books/deleteBook'
import { updateBook } from '@/lib/books/updateBook'

export default function AdminBooksPage() {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [genreFilter, setGenreFilter] = useState('all')
  const [editingBook, setEditingBook] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [genres, setGenres] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)
  const { logout } = useAuth()
  const router = useRouter()

  // Carrega os livros
  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const result = await getBooks()
      
      if (result && Array.isArray(result.data)) {
        setBooks(result.data)
        setFilteredBooks(result.data)
        
        // Extrai gêneros únicos
        const uniqueGenres = [...new Set(result.data.map(book => book.genre).filter(Boolean))]
        setGenres(['all', ...uniqueGenres])
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error)
      setErrorMessage('Erro ao carregar a lista de livros')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  // Filtra e ordena livros
  useEffect(() => {
    let result = [...books]

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(book => 
        book.title?.toLowerCase().includes(term) ||
        book.author?.name?.toLowerCase().includes(term) ||
        book.genre?.toLowerCase().includes(term)
      )
    }

    // Filtro por gênero
    if (genreFilter !== 'all') {
      result = result.filter(book => book.genre === genreFilter)
    }

    // Ordenação
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title?.localeCompare(b.title))
        break
      case 'author':
        result.sort((a, b) => a.author?.name?.localeCompare(b.author?.name))
        break
      case 'genre':
        result.sort((a, b) => a.genre?.localeCompare(b.genre))
        break
      case 'newest':
        result.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.publication_date) - new Date(b.publication_date))
        break
      default:
        break
    }

    setFilteredBooks(result)
  }, [searchTerm, sortBy, genreFilter, books])

  // Inicializa o formulário de edição
  useEffect(() => {
    if (editingBook) {
      setEditForm({
        title: editingBook.title || '',
        description: editingBook.description || '',
        genre: editingBook.genre || '',
        page_count: editingBook.page_count || '',
        publication_date: editingBook.publication_date?.split('T')[0] || '',
        author: editingBook.author?.name || ''
      })
      
      // Resetar estado de imagem
      setImageFile(null)
      setImagePreview(editingBook.image || '')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [editingBook])

  // Função para upload de imagem
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validação do tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Por favor, selecione uma imagem válida (JPEG, PNG, GIF, WebP)')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    // Validação do tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 5MB')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    setImageFile(file)
    
    // Criar preview da imagem
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Função para deletar livro
  const handleDeleteBook = async (id) => {
    try {
      await deleteBook(id)
      setSuccessMessage('Livro deletado com sucesso!')
      setDeleteConfirm(null)
      
      // Recarrega a lista
      await loadBooks()
      
      // Remove a mensagem após 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Erro ao deletar livro:', error)
      setErrorMessage('Erro ao deletar livro')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  // Função para editar livro
  const handleEditBook = async (e) => {
    e.preventDefault()
    try {
      setEditLoading(true)
      
      // Criar objeto com os dados do formulário
      const bookData = {
        title: editForm.title,
        description: editForm.description,
        genre: editForm.genre,
        page_count: editForm.page_count,
        publication_date: editForm.publication_date,
        author: editForm.author
      }

      // Se houver arquivo de imagem, adicionar
      if (imageFile) {
        console.log('Enviando novo arquivo de imagem:', imageFile.name)
        bookData.image_file = imageFile
      } else {
        console.log('Não há novo arquivo de imagem. Mantendo a imagem atual.')
      }

      await updateBook(editingBook.id, bookData)

      setSuccessMessage('Livro atualizado com sucesso!')
      setEditingBook(null)
      
      // Recarrega a lista
      await loadBooks()
      
      // Remove a mensagem após 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Erro ao editar livro:', error)
      setErrorMessage('Erro ao atualizar livro')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setEditLoading(false)
    }
  }

  // Função para resetar filtros
  const handleResetFilters = () => {
    setSearchTerm('')
    setSortBy('title')
    setGenreFilter('all')
  }

  // Função para logout
  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Formata data
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informada'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Gêneros sugeridos
  const genreSuggestions = [
    'Romance', 'Ficção', 'Fantasia', 'Ficção Científica', 'Terror', 'Mistério',
    'Aventura', 'Biografia', 'História', 'Filosofia', 'Poesia', 'Drama',
    'Comédia', 'Autoajuda', 'Infantil', 'Juvenil', 'Acadêmico', 'Educação'
  ]

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  BIBLIOTECH
                </Link>
                <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">|</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">Gerenciar Livros</div>
              </div>
              
              <div className="flex items-center gap-4">
                <Link 
                  href="/catalogue" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Ver Catálogo
                </Link>
                
                <Link 
                  href="/admin/newBook"
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  + Novo Livro
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Mensagens de Sucesso/Erro */}
          {(successMessage || errorMessage) && (
            <div className={`mb-6 rounded-lg p-4 ${
              successMessage ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30' : 
              'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30'
            }`}>
              <div className="flex items-center gap-3">
                {successMessage ? (
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className={successMessage ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {successMessage || errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gerenciamento de Livros
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie todos os livros do catálogo. Edite informações, remova livros ou adicione novos.
            </p>
          </div>
          {/* Filtros e Busca */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Barra de Pesquisa */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar Livros
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Busque por título, autor ou gênero..."
                    className="w-full px-4 py-3 pl-10 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filtro por Gênero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gênero
                </label>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white min-w-[150px]"
                >
                  <option value="all">Todos os Gêneros</option>
                  {genres.slice(1).map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Ordenação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white min-w-[150px]"
                >
                  <option value="title">Título (A-Z)</option>
                  <option value="author">Autor (A-Z)</option>
                  <option value="genre">Gênero (A-Z)</option>
                  <option value="newest">Mais Recentes</option>
                  <option value="oldest">Mais Antigos</option>
                </select>
              </div>

              {/* Botão Reset */}
              <button
                onClick={handleResetFilters}
                className="px-4 py-3 bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Limpar Filtros
              </button>
            </div>

            {/* Resultados da Busca */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredBooks.length === books.length 
                  ? `Mostrando todos os ${filteredBooks.length} livros`
                  : `Mostrando ${filteredBooks.length} de ${books.length} livros`
                }
              </p>
              {searchTerm && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Resultados para: "{searchTerm}"
                </p>
              )}
            </div>
          </div>

          {/* Lista de Livros */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando livros...</p>
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Nenhum livro encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tente ajustar os filtros ou adicione novos livros
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Limpar Filtros
                </button>
                <Link href="/admin/newBook">
                  <button className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200">
                    Adicionar Livro
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Livro</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Autor</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Gênero</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Páginas</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Publicação</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                              {book.image ? (
                                <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{book.title}</div>
                              {book.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {book.description.substring(0, 60)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-700 dark:text-gray-300">{book.author?.name || 'Não informado'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {book.genre || 'Sem gênero'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-700 dark:text-gray-300">{book.page_count || 0}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-700 dark:text-gray-300">{formatDate(book.publication_date)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingBook(book)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(book)}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal de Confirmação de Exclusão */}
          {deleteConfirm && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setDeleteConfirm(null)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                      Confirmar Exclusão
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                      Tem certeza que deseja excluir o livro <strong>"{deleteConfirm.title}"</strong>? Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDeleteBook(deleteConfirm.id)}
                        className="flex-1 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Sim, Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Modal de Edição */}
          {editingBook && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setEditingBook(null)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Editar Livro: {editingBook.title}
                      </h3>
                      <button
                        onClick={() => setEditingBook(null)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={handleEditBook} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Título */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Título *
                          </label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                            placeholder="Título do livro"
                          />
                        </div>

                        {/* Autor */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Autor *
                          </label>
                          <input
                            type="text"
                            value={editForm.author}
                            onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                            placeholder="Nome do autor"
                          />
                        </div>

                        {/* Gênero */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Gênero
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={editForm.genre}
                              onChange={(e) => setEditForm({...editForm, genre: e.target.value})}
                              list="genre-suggestions"
                              className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                              placeholder="Ex: Romance, Ficção, etc."
                            />
                            <datalist id="genre-suggestions">
                              {genreSuggestions.map((genre, index) => (
                                <option key={index} value={genre} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        {/* Número de Páginas */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Número de Páginas
                          </label>
                          <input
                            type="number"
                            value={editForm.page_count}
                            onChange={(e) => setEditForm({...editForm, page_count: e.target.value})}
                            min="0"
                            className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                            placeholder="Ex: 250"
                          />
                        </div>

                        {/* Data de Publicação */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data de Publicação
                          </label>
                          <input
                            type="date"
                            value={editForm.publication_date}
                            onChange={(e) => setEditForm({...editForm, publication_date: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Descrição */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                          placeholder="Descrição do livro..."
                        />
                      </div>

                      {/* Seção de Imagem */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Imagem da Capa (Opcional)
                        </label>
                        
                        <div className="space-y-4">
                          {/* Visualização e Upload */}
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <div className="w-32 h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center border-2 border-blue-200 dark:border-blue-800/30 overflow-hidden">
                                {imagePreview ? (
                                  <img
                                    src={imagePreview}
                                    alt="Preview da capa"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex gap-3 mb-2">
                                <label className="flex-1 py-3 px-4 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-center cursor-pointer font-medium">
                                  {imageFile ? 'Alterar Arquivo' : 'Escolher Arquivo'}
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                  />
                                </label>
                                
                                {imagePreview && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="py-3 px-4 bg-white dark:bg-[#2a2a2a] border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, GIF ou WebP. Máx. 5MB. Deixe em branco para manter a imagem atual.
                              </p>
                              
                              {/* Informações do arquivo selecionado */}
                              {imageFile && (
                                <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                  <p className="text-sm text-blue-700 dark:text-blue-400">
                                    <span className="font-medium">Arquivo selecionado:</span> {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => setEditingBook(null)}
                          className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={editLoading}
                          className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {editLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Salvando...
                            </>
                          ) : (
                            'Salvar Alterações'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Bibliotech Admin. Painel de administração de livros.</p>
            <p className="text-sm mt-2">
              {books.length} livros cadastrados • Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </footer>
      </div>
    </AdminRoute>
  )
}