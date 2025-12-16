// app/catalogue/details/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import { getBooks } from '@/lib/books/getBooks'
import { getBookDetail } from '@/lib/books/getBookDetail'
import { createComment } from '@/lib/books/createComment'
import { rateBook } from '@/lib/books/rateBook'
import { getFavorites } from '@/lib/books/getFavorites'
import { addFavorite} from '@/lib/books/addFavorite'
import { removeFavorites } from '@/lib/books/removeFavorite'

export default function BookDetailPage() {
  const [book, setBook] = useState(null)
  const [otherBooks, setOtherBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    loadBook()
    loadOtherBooks()
    checkIfFavorite()
  }, [params.id])

  const loadBook = async () => {
    try {
      setLoading(true)
      const result = await getBookDetail(params.id)
      
      if (result && result.data) {
        setBook(result.data)
        // Inicializa userRating com my_rating do livro (se existir)
        if (result.data.my_rating) {
          setUserRating(result.data.my_rating)
        }
      } else {
        setError('Livro não encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar livro:', error)
      setError('Erro ao carregar detalhes do livro')
    } finally {
      setLoading(false)
    }
  }

  const loadOtherBooks = async () => {
    try {
      const result = await getBooks()
      
      if (result && Array.isArray(result.data)) {
        const filteredBooks = result.data
          .filter(b => b.id !== params.id)
          .slice(0, 6)
        
        setOtherBooks(filteredBooks)
      }
    } catch (error) {
      console.error('Erro ao carregar outros livros:', error)
    }
  }

  const checkIfFavorite = async () => {
    try {
      const result = await getFavorites()
      if (result.success && Array.isArray(result.data)) {
        const favoriteIds = result.data.map(fav => fav.id)
        setIsFavorite(favoriteIds.includes(parseInt(params.id)))
      }
    } catch (error) {
      console.error('Erro ao verificar favoritos:', error)
    }
  }

  const handleRentBook = () => {
    router.push(`/loan/${params.id}`)
  }

  const handleToggleFavorite = async () => {
    try {
      setFavoriteLoading(true)
      
      if (isFavorite) {
        const result = await removeFavorites(params.id)
        if (result.success) {
          setIsFavorite(false)
        }
      } else {
        const result = await addFavorite(params.id)
        if (result.success) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleRateBook = async (rating) => {
    try {
      setRatingLoading(true)
      const result = await rateBook(params.id, rating)
      
      if (result.success) {
        // Atualiza a avaliação localmente
        setUserRating(rating)
        // Recarrega os dados do livro para atualizar a média
        const updatedBook = await getBookDetail(params.id)
        if (updatedBook && updatedBook.data) {
          setBook(updatedBook.data)
        }
      } else {
        setError(result.message || 'Erro ao avaliar livro')
      }
    } catch (error) {
      console.error('Erro ao avaliar livro:', error)
      setError('Erro ao avaliar livro')
    } finally {
      setRatingLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      setError('Por favor, escreva um comentário')
      return
    }

    try {
      setSubmitting(true)
      const result = await createComment(params.id, commentText)
      
      if (result.success) {
        // Recarrega os dados do livro para atualizar comentários
        const updatedBook = await getBookDetail(params.id)
        if (updatedBook && updatedBook.data) {
          setBook(updatedBook.data)
        }
        
        setCommentText('')
        setError('')
      } else {
        setError(result.message || 'Erro ao enviar comentário')
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
      setError('Erro ao enviar comentário')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informada'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Função para gerar cor baseada no username
  const getAvatarColor = (username) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
    ]
    if (!username) return colors[0]
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Função para pegar as iniciais do username
  const getInitials = (username) => {
    if (!username) return 'U'
    const parts = username.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return username.charAt(0).toUpperCase()
  }

  const renderCommentsSection = () => {
    const comments = book?.comments || []
    const averageRating = book?.average_rating || 0
    const hasComments = comments.length > 0

    return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden mb-12">
        <div className="p-8">
          {/* Cabeçalho da Seção */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Avaliações e Comentários
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <StarRating rating={averageRating} interactive={false} size="lg" />
                  <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  • {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
                </span>
              </div>
            </div>
          </div>

          {/* Avaliação do Usuário */}
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sua Avaliação
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Avalie este livro
                </p>
                <StarRating 
                  rating={userRating} 
                  onRatingChange={handleRateBook} 
                  interactive={true}
                  loading={ratingLoading}
                  size="lg"
                />
                {userRating > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Você avaliou com {userRating} {userRating === 1 ? 'estrela' : 'estrelas'}
                  </p>
                )}
              </div>
              
              {!userRating && (
                <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Sua avaliação ajuda outros leitores a descobrirem livros incríveis!
                </div>
              )}
            </div>
          </div>

          {/* Formulário de Comentário */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Deixe seu comentário
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seu comentário
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 resize-none transition-colors"
                  placeholder="Compartilhe sua opinião sobre este livro..."
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sua avaliação atual: <span className="font-medium">{userRating || 'Não avaliado'}</span>
                </p>
                <button
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentText.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Enviar Comentário
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Comentários */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Comentários ({comments.length})
            </h3>

            {hasComments ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar do Usuário */}
                        <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(comment.user)} rounded-full flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">
                            {getInitials(comment.user)}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {comment.user || 'Usuário'}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={comment.user_rating} interactive={false} />
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mt-4">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Seja o primeiro a comentar
                </h4>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Compartilhe sua opinião sobre este livro e ajude outros leitores a conhecerem melhor esta obra.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando livro...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Livro não encontrado'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              O livro que você está procurando não está disponível ou foi removido.
            </p>
            <Link 
              href="/catalogue" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para o Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      {/* Navbar substituindo o header */}
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Início
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href="/catalogue" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                    Catálogo
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {book.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Detalhes do Livro */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Coluna da Imagem */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-800/30">
                  {book.image ? (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-32 h-32 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Botão de Favorito na Imagem (Mobile) */}
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    className="absolute top-4 right-4 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-200"
                  >
                    {favoriteLoading ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg 
                        className={`w-6 h-6 ${isFavorite ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}
                        fill={isFavorite ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Botão de Favorito Principal */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`mt-6 w-full py-4 font-bold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 ${
                    isFavorite 
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800 text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {favoriteLoading ? (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg 
                        className="w-6 h-6" 
                        fill={isFavorite ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                      {isFavorite ? 'REMOVER DOS FAVORITOS' : 'ADICIONAR AOS FAVORITOS'}
                    </>
                  )}
                </button>
                
                {/* Avaliação Média */}
                <div className="mt-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">AVALIAÇÃO MÉDIA</h3>
                    <span className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                      {book.average_rating ? book.average_rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={book.average_rating || 0} interactive={false} size="md" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-400">
                      ({book.comments?.length || 0} {book.comments?.length === 1 ? 'avaliação' : 'avaliações'})
                    </span>
                  </div>
                </div>
                
                {/* Botão de Alugar */}
                <button
                  onClick={handleRentBook}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  ALUGAR ESTE LIVRO
                </button>

                {/* Informações Rápidas */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">INFORMAÇÕES RÁPIDAS</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Páginas</span>
                      <span className="font-medium text-gray-900 dark:text-white">{book.page_count || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Publicação</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(book.publication_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Disponível
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna de Informações */}
            <div className="lg:col-span-2">
              {/* Cabeçalho */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                          {book.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-lg text-gray-600 dark:text-gray-400">
                            por <span className="font-medium text-gray-900 dark:text-white">{book.author?.name || 'Autor desconhecido'}</span>
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {book.genre || 'Sem gênero'}
                          </span>
                          <div className="flex items-center gap-2">
                            <StarRating rating={book.average_rating || 0} interactive={false} size="sm" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {book.average_rating ? book.average_rating.toFixed(1) : '0.0'} ({book.comments?.length || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Botão de Favorito no Título (Mobile) */}
                      <button
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        className="md:hidden p-2"
                      >
                        {favoriteLoading ? (
                          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg 
                            className={`w-8 h-8 ${isFavorite ? 'text-red-600' : 'text-gray-400'}`}
                            fill={isFavorite ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sinopse</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {book.description || 'Este livro não possui uma descrição disponível.'}
                  </p>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Detalhes do Livro</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Autor</h3>
                      <p className="text-gray-900 dark:text-white">{book.author?.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gênero</h3>
                      <p className="text-gray-900 dark:text-white">{book.genre || 'Não informado'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Páginas</h3>
                      <p className="text-gray-900 dark:text-white">{book.page_count || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Data de Publicação</h3>
                      <p className="text-gray-900 dark:text-white">{formatDate(book.publication_date)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Editora</h3>
                      <p className="text-gray-900 dark:text-white">{book.publisher?.name || 'Não informada'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Código do Livro</h3>
                      <p className="text-gray-900 dark:text-white font-mono">{book.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões (Mobile) */}
              <div className="lg:hidden mt-8 space-y-4">
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`w-full py-4 font-bold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                    isFavorite 
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800 text-gray-800 dark:text-gray-300'
                  }`}
                >
                  {favoriteLoading ? (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg 
                        className="w-6 h-6" 
                        fill={isFavorite ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                      {isFavorite ? 'REMOVER DOS FAVORITOS' : 'ADICIONAR AOS FAVORITOS'}
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleRentBook}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  ALUGAR ESTE LIVRO
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Comentários e Avaliações */}
        {renderCommentsSection()}

        {/* Outros Livros */}
        {otherBooks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Outros Livros que Você Pode Gostar</h2>
              <Link 
                href="/catalogue" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2"
              >
                Ver Todos
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherBooks.map((otherBook) => (
                <Link 
                  key={otherBook.id} 
                  href={`/catalogue/details/${otherBook.id}`}
                  className="group bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-lg"
                >
                  <div className="flex flex-col h-full">
                    {/* Imagem */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
                      {otherBook.image ? (
                        <img
                          src={otherBook.image}
                          alt={otherBook.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {otherBook.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {otherBook.author?.name || 'Autor desconhecido'}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {otherBook.genre || 'Sem gênero'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {otherBook.page_count ? `${otherBook.page_count} páginas` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Botão */}
                    <div className="px-4 pb-4">
                      <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:gap-3 transition-all duration-200">
                        Ver Detalhes
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Bibliotech. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">
            Biblioteca digital com milhares de livros disponíveis para aluguel
          </p>
        </div>
      </footer>
    </div>
  )
}

// Componente StarRating atualizado
function StarRating({ rating, onRatingChange, interactive = false, loading = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const handleClick = (value) => {
    if (interactive && onRatingChange && !loading) {
      onRatingChange(value)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={() => handleClick(star)}
          disabled={!interactive || loading}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform duration-200' : 'cursor-default'} ${
            star <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-700'
          } ${loading ? 'opacity-50' : ''}`}
        >
          <svg
            className={sizeClasses[size]}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {loading && (
        <div className="ml-2 w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
  )
}