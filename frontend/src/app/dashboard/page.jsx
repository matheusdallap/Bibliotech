// app/dashboard/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getUserProfile } from '@/lib/getUserProfile'
import { getMyLoans } from '@/lib/loans/getMyLoans'
import { getBooks } from '@/lib/books/getBooks'
import { returnLoan } from '@/lib/loans/returnLoan'
import { getFavorites } from '@/lib/books/getFavorites'
import Navbar from '@/components/ui/Navbar'

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loans, setLoans] = useState([])
  const [favorites, setFavorites] = useState([])
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingAction, setProcessingAction] = useState(null)
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' })
  const [stats, setStats] = useState({
    activeLoans: 0,
    overdueLoans: 0,
    totalLoans: 0,
    readingTime: 0,
    totalFavorites: 0
  })
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Proteção: redireciona para login se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Carrega todos os dados
  useEffect(() => {
    const loadAllData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        // Carregar perfil
        const profileResult = await getUserProfile()
        if (profileResult.success) {
          setProfile(profileResult.data)
        }

        // Carregar empréstimos
        await loadLoansData()

        // Carregar favoritos
        await loadFavoritesData()

        // Carregar livros para recomendações
        const booksResult = await getBooks()
        if (booksResult.success && Array.isArray(booksResult.data)) {
          // Pegar livros que o usuário NÃO tem empréstimo ativo
          const activeBookIds = loans.filter(loan => !loan.returned_at).map(loan => loan.book)
          const favoriteBookIds = favorites.map(fav => fav.id)
          
          const availableBooks = booksResult.data
            .filter(book => !activeBookIds.includes(book.id) && !favoriteBookIds.includes(book.id))
            .slice(0, 4) // Mostrar apenas 4 recomendações
          
          setRecommendedBooks(availableBooks)
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setActionMessage({ type: 'error', text: 'Erro ao carregar dados. Tente novamente.' })
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [user])

  // Função para carregar empréstimos
  const loadLoansData = async () => {
    try {
      const loansResult = await getMyLoans()
      if (loansResult.success) {
        setLoans(loansResult.data)
        
        // Calcular estatísticas
        const active = loansResult.data.filter(loan => !loan.returned_at).length
        const overdue = loansResult.data.filter(loan => {
          if (!loan.returned_at && loan.due_date) {
            const dueDate = new Date(loan.due_date)
            const today = new Date()
            return dueDate < today
          }
          return false
        }).length
        
        setStats(prev => ({
          ...prev,
          activeLoans: active,
          overdueLoans: overdue,
          totalLoans: loansResult.data.length,
          readingTime: active * 14 // estimativa: 14 dias por livro
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error)
      throw error
    }
  }

  // Função para carregar favoritos
  const loadFavoritesData = async () => {
    try {
      const favoritesResult = await getFavorites()
      if (favoritesResult.success && Array.isArray(favoritesResult.data)) {
        // Extrair apenas os objetos book do array
        const favoriteBooks = favoritesResult.data.map(item => item.book)
        setFavorites(favoriteBooks)
        setStats(prev => ({
          ...prev,
          totalFavorites: favoriteBooks.length
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
      throw error
    }
  }

  // Função para devolver livro
  const handleReturnLoan = async (loanId) => {
    try {
      setProcessingAction(`return-${loanId}`)
      setActionMessage({ type: '', text: '' })
      
      const result = await returnLoan(loanId)
      
      if (result.success) {
        setActionMessage({ type: 'success', text: result.message })
        // Recarregar os dados
        await loadLoansData()
        
        // Remover mensagem após 3 segundos
        setTimeout(() => {
          setActionMessage({ type: '', text: '' })
        }, 3000)
      } else {
        setActionMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      console.error('Erro ao devolver livro:', error)
      setActionMessage({ type: 'error', text: 'Erro ao processar devolução.' })
    } finally {
      setProcessingAction(null)
    }
  }

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informada'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Calcular dias restantes
  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return 0
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Verificar se está atrasado
  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    const daysRemaining = calculateDaysRemaining(dueDate)
    return daysRemaining < 0
  }

  // Loading state durante a verificação de autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não há usuário (será redirecionado pelo useEffect)
  if (!user) {
    return null
  }

  // Loading state durante o carregamento dos dados
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando seu dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      {/* Navbar Component */}
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Mensagens de Ação */}
          {actionMessage.text && (
            <div className={`mb-6 rounded-lg p-4 ${
              actionMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30'
            }`}>
              <div className="flex items-center gap-3">
                {actionMessage.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className={actionMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {actionMessage.text}
                </p>
              </div>
            </div>
          )}

          {/* Header do Dashboard */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                  Olá,{' '}
                  <span className="text-blue-600 dark:text-blue-400">
                    {profile?.username || user?.username || 'Visitante'}
                  </span>
                  <span className="block text-2xl lg:text-3xl text-gray-600 dark:text-gray-400 font-normal mt-2">
                    Bem-vindo(a) à sua biblioteca digital
                  </span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Gerencie seus empréstimos, favoritos e descubra novos livros.
                </p>
              </div>
              
              {/* Status do Usuário */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-blue-800/30">
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {(profile?.username || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de conta</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile?.is_admin ? 'Administrador' : 'Leitor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data atual */}
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }).replace(/^\w/, c => c.toUpperCase())}
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stats.activeLoans}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Empréstimos Ativos</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-800/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                    {stats.totalFavorites}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Favoritos</div>
                </div>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {stats.readingTime}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Dias de Leitura</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Estimados</div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {stats.totalLoans}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Total Emprestado</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Histórico</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {stats.overdueLoans}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Atrasados</div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Grid com duas colunas para Empréstimos e Favoritos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Seção de Empréstimos Ativos */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seus Empréstimos Ativos</h2>
                <Link 
                  href="/catalogue" 
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Alugar Mais
                </Link>
              </div>

              {loans.filter(loan => !loan.returned_at).length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhum empréstimo ativo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Você não possui livros emprestados no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {loans
                    .filter(loan => !loan.returned_at)
                    .map((loan) => {
                      const daysRemaining = calculateDaysRemaining(loan.due_date)
                      const overdue = isOverdue(loan.due_date)
                      const returnDisabled = processingAction === `return-${loan.id}`
                      
                      return (
                        <div key={loan.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                {loan.book_title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>Empréstimo: {formatDate(loan.loan_date)}</span>
                                <span>Devolução: {formatDate(loan.due_date)}</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              overdue 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {overdue ? `Atrasado ${Math.abs(daysRemaining)} dias` : `${daysRemaining} dias restantes`}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Link 
                              href={`/catalogue/details/${loan.book}`}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                            >
                              Ver Livro
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                            
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleReturnLoan(loan.id)}
                                disabled={returnDisabled}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center gap-1 ${
                                  returnDisabled
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                              >
                                {processingAction === `return-${loan.id}` ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processando...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Devolver
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Seção de Livros Favoritos */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seus Livros Favoritos</h2>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhum favorito ainda
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Adicione livros aos seus favoritos para encontrá-los facilmente aqui.
                  </p>
                  <Link 
                    href="/catalogue" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explorar Catálogo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {favorites.slice(0, 5).map((favorite) => (
                    <Link 
                      key={favorite.id} 
                      href={`/catalogue/details/${favorite.id}`}
                      className="group p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-200 block"
                    >
                      <div className="flex items-start gap-4">
                        {/* Imagem do livro */}
                        <div className="w-16 h-24 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-lg overflow-hidden flex-shrink-0">
                          {favorite.image ? (
                            <img
                              src={favorite.image}
                              alt={favorite.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Informações do livro */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                            {favorite.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                            {favorite.author?.name || 'Autor desconhecido'}
                          </p>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {favorite.average_rating ? favorite.average_rating.toFixed(1) : '0.0'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {favorite.page_count ? `${favorite.page_count} páginas` : ''}
                            </span>
                          </div>
                          
                          {/* Botão de ação rápida */}
                          <div className="mt-3 flex items-center gap-2">
                            <button className="text-xs text-pink-600 dark:text-pink-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                              Ver Detalhes
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Coração de favorito */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {favorites.length > 5 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <Link 
                        href="/favorites" 
                        className="text-center block text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium text-sm"
                      >
                        Ver todos os {favorites.length} favoritos
                        <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seção de Recomendações */}
          {recommendedBooks.length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recomendados para Você</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Baseado em seus interesses e histórico de leitura
                  </p>
                </div>
                <Link 
                  href="/catalogue" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2"
                >
                  Ver Catálogo Completo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedBooks.map((book) => (
                  <Link 
                    key={book.id} 
                    href={`/catalogue/details/${book.id}`}
                    className="group bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 overflow-hidden"
                  >
                    {/* Imagem do livro */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {book.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
                        {book.author?.name || 'Autor desconhecido'}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {book.genre || 'Sem gênero'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {book.page_count ? `${book.page_count} páginas` : ''}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Histórico de Empréstimos */}
          {loans.filter(loan => loan.returned_at).length > 0 && (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Histórico de Empréstimos</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Livro</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Data do Empréstimo</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Data de Devolução</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {loans
                      .filter(loan => loan.returned_at)
                      .slice(0, 5) // Limitar a 5 itens no histórico
                      .map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {loan.book_title}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-700 dark:text-gray-300">{formatDate(loan.loan_date)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-700 dark:text-gray-300">{formatDate(loan.returned_at)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                              Devolvido
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl border border-blue-200 dark:border-blue-800/30 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ações Rápidas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link 
                href="/catalogue"
                className="group bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Explorar Catálogo
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Descubra novos livros
                    </p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/profile"
                className="group bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      Meu Perfil
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Atualize suas informações
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Bibliotech. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Dashboard • {stats.activeLoans} empréstimos ativos • {stats.totalFavorites} favoritos</p>
        </div>
      </footer>
    </div>
  )
}