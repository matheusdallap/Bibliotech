// app/catalogue/page.jsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getBooks } from '@/lib/books/getBooks'
import Navbar from '@/components/ui/Navbar'

export default function Catalogue() {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [genreFilter, setGenreFilter] = useState('all')
  const [visibleBooks, setVisibleBooks] = useState([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [genres, setGenres] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef()
  const lastBookRef = useRef()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Carrega os livros
  useEffect(() => {
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
          
          // Mostra os primeiros livros inicialmente
          setVisibleBooks(result.data.slice(0, 12))
        }
      } catch (error) {
        console.error('Erro ao carregar livros:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

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
      default:
        break
    }

    setFilteredBooks(result)
    setVisibleBooks(result.slice(0, 12))
    setPage(1)
    setHasMore(result.length > 12)
  }, [searchTerm, sortBy, genreFilter, books])

  // Infinite scroll com Intersection Observer
  const loadMoreBooks = useCallback(() => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = page + 1
    const startIndex = 0
    const endIndex = nextPage * 12
    
    setTimeout(() => {
      setVisibleBooks(filteredBooks.slice(0, endIndex))
      setPage(nextPage)
      setHasMore(endIndex < filteredBooks.length)
      setIsLoadingMore(false)
    }, 500)
  }, [page, filteredBooks, isLoadingMore, hasMore])

  // Configura o Intersection Observer
  useEffect(() => {
    if (!lastBookRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreBooks()
        }
      },
      { threshold: 0.5 }
    )

    if (lastBookRef.current) {
      observer.observe(lastBookRef.current)
    }

    return () => {
      if (lastBookRef.current) {
        observer.unobserve(lastBookRef.current)
      }
    }
  }, [lastBookRef, hasMore, isLoadingMore, loadMoreBooks])

  // Reset dos filtros
  const handleResetFilters = () => {
    setSearchTerm('')
    setSortBy('title')
    setGenreFilter('all')
  }

  // Estatísticas
  const stats = {
    totalBooks: books.length,
    filteredBooks: filteredBooks.length,
    genresCount: genres.length - 1,
    topGenre: books.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1
      return acc
    }, {})
  }

  if (loading && authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      {/* Header: Se usuário logado, mostra Navbar, senão mostra header simplificado */}
      {user ? (
        <Navbar />
      ) : (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  BIBLIOTECH
                </Link>
                <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">|</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">Catálogo de Livros</div>
              </div>
              
              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Entrar
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Cadastrar
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Nosso Acervo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {user ? `Bem-vindo de volta, ${user.username}!` : 'Encontre sua próxima grande leitura.'} Descubra milhares de livros de diferentes gêneros e autores.
          </p>
          
          {/* Ação rápida para usuários logados */}
          {user && (
            <div className="mt-6 flex justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Ir para Dashboard
              </Link>
              <Link 
                href={`/profile/${user.id}`}
                className="px-6 py-1.5 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
              >
                Meu Perfil
              </Link>
            </div>
          )}
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

        {/* Grid de Livros */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando catálogo...</p>
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
              Tente ajustar os filtros ou termos de busca
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleBooks.map((book, index) => (
                <div
                  key={book.id}
                  ref={index === visibleBooks.length - 1 ? lastBookRef : null}
                  className="group bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  {/* Imagem do Livro */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                    {book.image ? (
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-gray-500 dark:text-gray-400 text-sm text-center">Sem imagem</span>
                      </div>
                    )}
                    
                    {/* Badge de Gênero */}
                    {book.genre && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md">
                          {book.genre}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações do Livro */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {book.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm">{book.author?.name || 'Autor desconhecido'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 mb-4">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-xs">{book.genre || 'Sem gênero'}</span>
                    </div>

                    {/* Botão Ver Detalhes */}
                    <Link
                      href={`/catalogue/details/${book.id}`}
                      className="block w-full py-2 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Carregando mais livros...</p>
                </div>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && filteredBooks.length > 0 && (
              <div className="text-center py-8 border-t border-gray-200 dark:border-gray-800 mt-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Você viu todos os {filteredBooks.length} livros
                </p>
              </div>
            )}
          </>
        )}

        {/* CTA Final */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {user ? 'Precisa de ajuda?' : 'Encontrou o livro perfeito?'}
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            {user 
              ? 'Se tiver dúvidas sobre como emprestar livros ou qualquer outra funcionalidade, nossa equipe está aqui para ajudar!'
              : 'Cadastre-se para emprestar livros, criar listas de leitura e muito mais!'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link href="/dashboard">
                  <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Ir para Dashboard
                  </button>
                </Link>
                <Link href="/catalogue">
                  <button className="px-6 py-2.5 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200">
                    Continuar Explorando
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Criar Conta Gratuita
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-6 py-2.5 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200">
                    Fazer Login
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Bibliotech. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Catálogo • {books.length} livros disponíveis • Acessível para todos</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}