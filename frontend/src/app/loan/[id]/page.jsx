// app/loan/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import { getBookDetail } from '@/lib/books/getBookDetail'
import { getBooks } from '@/lib/books/getBooks'
import { createLoan } from '@/lib/loans/createLoan'
import { useAuth } from '@/context/AuthContext'

export default function LoanPage() {
  const [book, setBook] = useState(null)
  const [otherBooks, setOtherBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()

  // Formulário de pagamento
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    installments: '1',
    termsAccepted: false
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    // Verificar se usuário está logado
    if (!authLoading && !user) {
      router.push('/login?redirect=/loan/' + params.id)
      return
    }

    if (user) {
      loadBook()
      loadOtherBooks()
      // Preencher nome automaticamente se disponível
      if (user.name) {
        setFormData(prev => ({
          ...prev,
          fullName: user.name
        }))
      }
    }
  }, [user, authLoading, params.id])

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
      setError('Erro ao carregar informações do livro')
    } finally {
      setLoading(false)
    }
  }

  const loadOtherBooks = async () => {
    try {
      const result = await getBooks()
      
      if (result && Array.isArray(result.data)) {
        // Filtrar livros, excluindo o atual e pegando os primeiros 4
        const filteredBooks = result.data
          .filter(b => b.id !== params.id)
          .slice(0, 4)
        
        setOtherBooks(filteredBooks)
      }
    } catch (error) {
      console.error('Erro ao carregar outros livros:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'cpf') {
      // Formatar CPF
      const formattedCPF = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
      setFormData(prev => ({ ...prev, [name]: formattedCPF }))
    } else if (name === 'cardNumber') {
      // Formatar número do cartão
      const formattedCard = value
        .replace(/\D/g, '')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})\d+?$/, '$1')
        .trim()
      setFormData(prev => ({ ...prev, [name]: formattedCard }))
    } else if (name === 'cardExpiry') {
      // Formatar data de expiração
      let formattedExpiry = value.replace(/\D/g, '')
      if (formattedExpiry.length >= 2) {
        formattedExpiry = formattedExpiry.substring(0, 2) + '/' + formattedExpiry.substring(2, 4)
      }
      setFormData(prev => ({ ...prev, [name]: formattedExpiry }))
    } else if (name === 'cardCvv') {
      // Limitar CVV a 3-4 dígitos
      const formattedCvv = value.replace(/\D/g, '').substring(0, 4)
      setFormData(prev => ({ ...prev, [name]: formattedCvv }))
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }))
    }
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    // Validar nome completo
    if (!formData.fullName.trim()) {
      errors.fullName = 'Nome completo é obrigatório'
    } else if (formData.fullName.trim().split(' ').length < 2) {
      errors.fullName = 'Digite nome e sobrenome'
    }
    
    // Validar CPF
    const cpfNumbers = formData.cpf.replace(/\D/g, '')
    if (cpfNumbers.length !== 11) {
      errors.cpf = 'CPF deve ter 11 dígitos'
    }
    
    // Validar número do cartão
    const cardNumbers = formData.cardNumber.replace(/\D/g, '')
    if (cardNumbers.length !== 16) {
      errors.cardNumber = 'Número do cartão deve ter 16 dígitos'
    }
    
    // Validar data de expiração
    const [month, year] = formData.cardExpiry.split('/')
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      errors.cardExpiry = 'Data inválida (MM/AA)'
    } else {
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1
      const expiryMonth = parseInt(month)
      const expiryYear = parseInt(year)
      
      if (expiryMonth < 1 || expiryMonth > 12) {
        errors.cardExpiry = 'Mês inválido'
      } else if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        errors.cardExpiry = 'Cartão expirado'
      }
    }
    
    // Validar CVV
    if (!formData.cardCvv || formData.cardCvv.length < 3 || formData.cardCvv.length > 4) {
      errors.cardCvv = 'CVV inválido'
    }
    
    // Validar termos
    if (!formData.termsAccepted) {
      errors.termsAccepted = 'Você deve aceitar os termos e condições'
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setError('Por favor, corrija os erros no formulário')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    try {
      setProcessing(true)
      setError('')
      
      const result = await createLoan(params.id)
      
      if (result.success) {
        setSuccess('Empréstimo realizado com sucesso!')
        setSuccess(result.message)
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('Erro ao processar empréstimo:', error)
      setError('Erro ao processar empréstimo. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informada'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Opções de parcelamento
  const installmentOptions = [
    { value: '1', label: '1x de R$ 4,20 (Sem juros)' },
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirecionamento já foi tratado
  }

  if (error && !book) {
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
              O livro que você está tentando alugar não está disponível.
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
        {/* Mensagens de Status */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">{success}</p>
                <p className="text-green-600 dark:text-green-400 text-sm">Redirecionando para seus empréstimos...</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda - Resumo do Livro */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Card do Livro */}
              <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Livro Selecionado
                </h2>
                
                <div className="flex gap-4 mb-4">
                  <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg overflow-hidden flex-shrink-0">
                    {book.image ? (
                      <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {book.author?.name || 'Autor desconhecido'}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {book.genre || 'Sem gênero'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Páginas:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{book.page_count || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Publicação:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(book.publication_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">Disponível</span>
                  </div>
                </div>
              </div>

              {/* Resumo do Valor */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/30 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Resumo do Valor</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Taxa de empréstimo</span>
                    <span className="font-medium text-gray-900 dark:text-white">R$ 4,20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Taxa de entrega</span>
                    <span className="font-medium text-gray-900 dark:text-white">R$ 4,20</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">R$ 4,20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita - Formulário de Pagamento */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Finalizar Empréstimo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Preencha seus dados de pagamento para finalizar o empréstimo do livro
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações Pessoais</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border ${
                          formErrors.fullName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white`}
                        placeholder="Digite seu nome completo"
                      />
                      {formErrors.fullName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CPF *
                      </label>
                      <input
                        type="text"
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        maxLength={14}
                        className={`w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border ${
                          formErrors.cpf ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white`}
                        placeholder="000.000.000-00"
                      />
                      {formErrors.cpf && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.cpf}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações do Cartão */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações do Cartão</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número do Cartão *
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength={19}
                        className={`w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border ${
                          formErrors.cardNumber ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {formErrors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Validade (MM/AA) *
                        </label>
                        <input
                          type="text"
                          id="cardExpiry"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          maxLength={5}
                          className={`w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border ${
                            formErrors.cardExpiry ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white`}
                          placeholder="MM/AA"
                        />
                        {formErrors.cardExpiry && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.cardExpiry}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CVV *
                        </label>
                        <input
                          type="password"
                          id="cardCvv"
                          name="cardCvv"
                          value={formData.cardCvv}
                          onChange={handleInputChange}
                          maxLength={4}
                          className={`w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border ${
                            formErrors.cardCvv ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white`}
                          placeholder="123"
                        />
                        {formErrors.cardCvv && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.cardCvv}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="installments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Parcelamento *
                        </label>
                        <select
                          id="installments"
                          name="installments"
                          value={formData.installments}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                        >
                          {installmentOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Termos e Condições */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-5">
                      <input
                        id="termsAccepted"
                        name="termsAccepted"
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="text-sm">
                      <label htmlFor="termsAccepted" className="font-medium text-gray-700 dark:text-gray-300">
                        Concordo com os Termos e Condições *
                      </label>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Ao confirmar o empréstimo, concordo com os{' '}
                        <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                          termos de serviço
                        </Link>
                        {' '}e{' '}
                        <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                          política de privacidade
                        </Link>
                        {' '}da Bibliotech. O livro será emprestado por 14 dias e poderá ser renovado.
                      </p>
                      {formErrors.termsAccepted && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.termsAccepted}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-6">
                  <Link 
                    href={`/books/${params.id}`}
                    className="flex-1 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-center"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        CONFIRMAR EMPRÉSTIMO
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Outros Livros */}
            {otherBooks.length > 0 && (
              <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Outros Livros que Você Também Pode Gostar
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherBooks.map((otherBook) => (
                    <Link 
                      key={otherBook.id} 
                      href={`/books/${otherBook.id}`}
                      className="group bg-gray-50 dark:bg-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-4 transition-all duration-200 border border-transparent hover:border-blue-300 dark:hover:border-blue-700"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded overflow-hidden flex-shrink-0">
                          {otherBook.image ? (
                            <img
                              src={otherBook.image}
                              alt={otherBook.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {otherBook.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {otherBook.author?.name || 'Autor desconhecido'}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {otherBook.genre || 'Sem gênero'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Bibliotech. Sistema de empréstimo de livros.</p>
          <p className="text-sm mt-2">
            Todos os empréstimos têm duração de 14 dias e podem ser renovados
          </p>
        </div>
      </footer>
    </div>
  )
}