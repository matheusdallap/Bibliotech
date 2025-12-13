// app/dashboard/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import { useAuth } from '@/context/AuthContext'
import { getUserProfile } from '@/lib/getUserProfile'

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Proteção: redireciona para login se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Carrega o perfil do usuário
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      
      try {
        const result = await getUserProfile(user.id)
        if (result.success) {
          setProfile(result.data)
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user])

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

  // Loading state durante o carregamento do perfil
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando seu dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
                    Seja bem-vindo(a) à sua biblioteca digital
                  </span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Aqui você pode gerenciar seus livros, acompanhar empréstimos e explorar nosso catálogo.
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

          {/* Área de Conteúdo Principal */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-8">
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Em breve: Sua Biblioteca Pessoal
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Estamos preparando uma experiência incrível para você. Em breve, 
                  aqui você encontrará todos os seus livros, empréstimos ativos, 
                  recomendações personalizadas e muito mais.
                </p>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/30">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">0</div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium">Livros Emprestados</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">No momento</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-800/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800/30">
                    <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">0</div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium">Livros Favoritos</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sua coleção</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800/30">
                    <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">0</div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium">Leitura Atual</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Livro em andamento</div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/catalogue" 
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explorar Catálogo
                  </a>
                  
                  <a 
                    href="/profile" 
                    className="px-6 py-2.5 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Editar Perfil
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Recursos */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Segurança</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sua conta está protegida com autenticação segura e criptografia.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Acesso Imediato</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Comece a ler instantaneamente após encontrar um livro.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Histórico</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Acompanhe todos os livros que você já leu ou emprestou.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Bibliotech. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Dashboard do usuário • Versão 1.0</p>
        </div>
      </footer>
    </div>
  )
}