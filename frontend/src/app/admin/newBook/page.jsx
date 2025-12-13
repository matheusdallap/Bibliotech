// app/admin/newBook/page.jsx
'use client'

import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBook } from '@/lib/createBook'

export default function NewBookPage() {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    page_count: '',
    author_name: '',
    publisher_name: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validações básicas
    if (!formData.title.trim()) {
      setError('O título é obrigatório.')
      setLoading(false)
      return
    }

    if (!formData.author_name.trim()) {
      setError('O nome do autor é obrigatório.')
      setLoading(false)
      return
    }

    if (!formData.page_count || parseInt(formData.page_count) <= 0) {
      setError('O número de páginas deve ser maior que 0.')
      setLoading(false)
      return
    }

    try {

      const result = await createBook(formData)

      if (result && result.success) {
        setSuccess(true)
        
        // Limpar formulário após sucesso
        setFormData({
          title: '',
          genre: '',
          page_count: '',
          author_name: '',
          publisher_name: ''
        })

        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/admin/books')
        }, 2000)
      } else {
        setError(result?.message || 'Erro ao criar livro. Tente novamente.')
      }

    } catch (err) {
      setError('Erro ao criar livro. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Lista de gêneros literários para sugestões
  const genreSuggestions = [
    'Romance', 'Ficção', 'Fantasia', 'Ficção Científica', 'Terror', 'Mistério',
    'Aventura', 'Biografia', 'História', 'Filosofia', 'Poesia', 'Drama',
    'Comédia', 'Autoajuda', 'Infantil', 'Juvenil', 'Acadêmico', 'Educação'
  ]

  return (
    <AdminRoute>
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
                BIBLIOTECH
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400">|</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Criar Novo Livro</div>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/admin" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Voltar ao Painel
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Adicionar Novo Livro
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Preencha os dados do livro para adicioná-lo ao catálogo
              </p>
            </div>

            {/* Mensagens de Status */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Livro criado com sucesso!
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      Redirecionando para a lista de livros...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulário */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título do Livro *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Digite o título do livro"
                  />
                </div>

                {/* Autor */}
                <div>
                  <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Autor *
                  </label>
                  <input
                    type="text"
                    id="author_name"
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Nome do autor"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gênero */}
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gênero
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        list="genre-suggestions"
                        className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Ex: Romance, Ficção"
                      />
                      <datalist id="genre-suggestions">
                        {genreSuggestions.map((genre, index) => (
                          <option key={index} value={genre} />
                        ))}
                      </datalist>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Digite ou selecione um gênero
                    </p>
                  </div>

                  {/* Número de Páginas */}
                  <div>
                    <label htmlFor="page_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Páginas *
                    </label>
                    <input
                      type="number"
                      id="page_count"
                      name="page_count"
                      value={formData.page_count}
                      onChange={handleChange}
                      required
                      min="1"
                      max="5000"
                      className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Ex: 256"
                    />
                  </div>
                </div>

                {/* Editora */}
                <div>
                  <label htmlFor="publisher_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Editora
                  </label>
                  <input
                    type="text"
                    id="publisher_name"
                    name="publisher_name"
                    value={formData.publisher_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Nome da editora"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Opcional - deixe em branco se não souber
                  </p>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                        Informações Importantes
                      </p>
                      <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Campos marcados com * são obrigatórios</li>
                        <li>• O livro será adicionado imediatamente ao catálogo</li>
                        <li>• Verifique as informações antes de enviar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Link href="/admin" className="flex-1">
                    <button
                      type="button"
                      className="w-full py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Cancelar
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Criando...
                      </div>
                    ) : (
                      'Criar Livro'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Exemplo de Dados */}
            <div className="mt-8 bg-gray-50 dark:bg-gray-900/30 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Exemplo de Dados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Título:</p>
                  <p className="font-medium text-gray-900 dark:text-white">Dom Casmurro</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Autor:</p>
                  <p className="font-medium text-gray-900 dark:text-white">Machado de Assis</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Gênero:</p>
                  <p className="font-medium text-gray-900 dark:text-white">Romance</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Páginas:</p>
                  <p className="font-medium text-gray-900 dark:text-white">256</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2025 Bibliotech Admin. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </AdminRoute>
  )
}