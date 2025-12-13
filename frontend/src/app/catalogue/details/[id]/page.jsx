// app/books/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBooks } from '@/lib/books/getBooks'
import { getBookDetail } from '@/lib/books/getBookDetail'

export default function BookDetailPage() {
  const [book, setBook] = useState(null)
  const [otherBooks, setOtherBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    loadBook()
    loadOtherBooks()
  }, [params.id])

  const loadBook = async () => {
    try {
      setLoading(true)
      const result = await getBookDetail(params.id)
      
      if (result && result.data) {
        setBook(result.data)
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
        // Filtrar livros, excluindo o atual e pegando os primeiros 6
        const filteredBooks = result.data
          .filter(b => b.id !== params.id)
          .slice(0, 6)
        
        setOtherBooks(filteredBooks)
      }
    } catch (error) {
      console.error('Erro ao carregar outros livros:', error)
    }
  }

  const handleRentBook = () => {
    router.push(`/loan/${params.id}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informada'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                BIBLIOTECH
              </Link>
              <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">|</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Detalhes do Livro</div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/catalogue" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Voltar para Catálogo
              </Link>
            </div>
          </div>
        </div>
      </header>

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
                  <div>
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

              {/* Botão de Alugar (Mobile) */}
              <div className="lg:hidden mt-8">
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
                  href={`/books/${otherBook.id}`}
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