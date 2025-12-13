// app/page.jsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      {/* Header Simples */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">BIBLIOTECH</h1>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              Login
            </Link>
            <Link href="/register" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              Cadastro
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Text Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Sua Biblioteca
                  <span className="text-blue-600 dark:text-blue-400 block">Digital</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Descubra milhares de livros, artigos e recursos acadêmicos em uma 
                  plataforma moderna e intuitiva. Conhecimento ao alcance de um clique.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/catalogue" className="flex-1">
                  <button className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Explorar Catálogo
                  </button>
                </Link>
                
                <div className="flex-1 flex gap-4">
                  <Link href="/login" className="flex-1">
                    <button className="w-full py-4 px-6 bg-white dark:bg-[#1e1e1e] border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-md">
                      Entrar
                    </button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <button className="w-full py-4 px-6 bg-white dark:bg-[#1e1e1e] border border-blue-200 dark:border-blue-800/50 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-md">
                      Cadastrar
                    </button>
                  </Link>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Livros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">5K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Usuários</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Disponível</div>
                </div>
              </div>
            </div>

            {/* Imagem */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="/images/imagem1.jpg" 
                  alt="Biblioteca Moderna - Bibliotech"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Busca Avançada</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Encontre exatamente o que precisa com nosso sistema de busca inteligente e filtros avançados.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acesso Rápido</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Leia seus livros favoritos instantaneamente, sem esperas ou processos complicados.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Seguro</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sua privacidade e dados protegidos com as mais modernas tecnologias de segurança.
              </p>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar sua jornada literária?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de leitores e descubra um mundo de conhecimento na Bibliotech.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Criar Conta Gratuita
                </button>
              </Link>
              <Link href="/catalogue">
                <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200">
                  Explorar sem Cadastro
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Simples */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 Bibliotech. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}