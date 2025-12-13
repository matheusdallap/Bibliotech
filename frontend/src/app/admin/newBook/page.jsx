// app/admin/newBook/page.jsx
'use client'

import AdminRoute from '@/components/AdminRoute'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBook } from '@/lib/books/createBook'

export default function NewBookPage() {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    page_count: '',
    author_name: '',
    publisher_name: '',
    description: '',
    publication_date: '',
    short_description: ''
  })
  
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validação do tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Por favor, selecione uma imagem válida (JPEG, PNG, GIF, WebP)')
      setTimeout(() => setError(''), 3000)
      return
    }

    // Validação do tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      setTimeout(() => setError(''), 3000)
      return
    }

    setImageFile(file)
    
    // Criar preview da imagem
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

    if (!formData.description.trim()) {
      setError('A descrição do livro é obrigatória.')
      setLoading(false)
      return
    }

    // Validação da imagem
    if (!imageFile) {
      setError('Por favor, selecione uma imagem para a capa do livro.')
      setLoading(false)
      return
    }

    try {
      console.log('=== Iniciando envio do livro ===')
      console.log('Arquivo de imagem:', imageFile)
      
      // Preparar dados para envio
      const bookData = {
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        page_count: parseInt(formData.page_count),
        author_name: formData.author_name,
        publisher_name: formData.publisher_name,
        publication_date: formData.publication_date || null,
        short_description: formData.short_description,
        image_file: imageFile // Enviar o arquivo diretamente
      }

      console.log('Dados a serem enviados:', {
        ...bookData,
        image_file: `File: ${imageFile.name} (${imageFile.size} bytes)`
      })

      const result = await createBook(bookData)
      console.log('Resposta do backend:', result)

      if (result && result.success) {
        setSuccess(true)
        
        // Limpar formulário após sucesso
        setFormData({
          title: '',
          genre: '',
          page_count: '',
          author_name: '',
          publisher_name: '',
          description: '',
          publication_date: '',
          short_description: ''
        })
        setImageFile(null)
        setImagePreview('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/admin/books')
        }, 2000)
      } else {
        setError(result?.message || 'Erro ao criar livro. Tente novamente.')
      }

    } catch (err) {
      console.error('Erro detalhado:', err)
      setError('Erro ao criar livro. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Lista de gêneros literários para sugestões
  const genreSuggestions = [
    'Romance', 'Ficção', 'Fantasia', 'Ficção Científica', 'Terror', 'Mistério',
    'Aventura', 'Biografia', 'História', 'Filosofia', 'Poesia', 'Drama',
    'Comédia', 'Autoajuda', 'Infantil', 'Juvenil', 'Acadêmico', 'Educação',
    'Negócios', 'Tecnologia', 'Saúde', 'Culinária', 'Viagem', 'Arte',
    'Musica', 'Esportes', 'Religião', 'Espiritualidade', 'Humor', 'Policial'
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
                href="/admin/books" 
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Ver Lista de Livros
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
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

                {/* Descrição Completa */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição do Livro *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    placeholder="Descreva o livro em detalhes, incluindo enredo, temas principais, público-alvo..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Descreva o livro de forma completa. Esta descrição aparecerá na página de detalhes.
                  </p>
                </div>

                {/* Descrição Curta */}
                <div>
                  <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição Curta (Opcional)
                  </label>
                  <textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    placeholder="Uma breve descrição para mostrar no card do livro (máx. 200 caracteres)"
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.short_description.length}/200 caracteres - Esta descrição aparecerá nos cards do catálogo.
                  </p>
                </div>

                {/* Grid de Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {/* Data de Publicação */}
                  <div>
                    <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Publicação
                    </label>
                    <input
                      type="date"
                      id="publication_date"
                      name="publication_date"
                      value={formData.publication_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Data em que o livro foi publicado
                    </p>
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

                {/* Upload de Imagem - OBRIGATÓRIO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagem da Capa *
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
                              required
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
                          PNG, JPG, GIF ou WebP. Máx. 5MB. *
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
                        <li>• A imagem deve ter no máximo 5MB</li>
                        <li>• Formatos de imagem aceitos: JPEG, PNG, GIF, WebP</li>
                        <li>• A imagem da capa é obrigatória</li>
                        <li>• O livro será adicionado imediatamente ao catálogo</li>
                        <li>• Verifique todas as informações antes de enviar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Link href="/admin/books" className="flex-1">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Data Publicação:</p>
                  <p className="font-medium text-gray-900 dark:text-white">1899-01-01</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Editora:</p>
                  <p className="font-medium text-gray-900 dark:text-white">Livros Brasil</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Descrição:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  Romance que explora temas como ciúme, traição e as complexidades das relações humanas na sociedade brasileira do século XIX.
                </p>
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