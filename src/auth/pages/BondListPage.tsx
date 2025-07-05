import { useState } from 'react'

interface Bond {
  id: number
  name: string
}

export const BondsListPage = () => {
  // Datos de ejemplo - en el futuro vendrán de una API
  const [bonds] = useState<Bond[]>([
    { id: 12372173, name: 'Hernán Barcos' },
    { id: 12372171, name: 'John Doe' },
    { id: 12372170, name: 'Pedro Kunimoto' },
    { id: 12372169, name: 'Paolo Guerrero' },
    { id: 12372168, name: 'Mariana Ames' },
    { id: 12372167, name: 'Carlos Mendoza' },
    { id: 12372166, name: 'Ana García' },
    { id: 12372165, name: 'Luis Rodríguez' },
    { id: 12372164, name: 'María González' },
    { id: 12372163, name: 'Roberto Silva' },
    { id: 12372162, name: 'Carmen Torres' },
    { id: 12372161, name: 'Diego Morales' },
    { id: 12372160, name: 'Sofía Ramos' },
    { id: 12372159, name: 'Alberto Vega' },
    { id: 12372158, name: 'Patricia Herrera' }
  ])

  const [currentPage, setCurrentPage] = useState<number>(1)
  const bondsPerPage: number = 10

  // Calcular índices para la paginación
  const indexOfLastBond: number = currentPage * bondsPerPage
  const indexOfFirstBond: number = indexOfLastBond - bondsPerPage
  const currentBonds: Bond[] = bonds.slice(indexOfFirstBond, indexOfLastBond)

  // Calcular número total de páginas
  const totalPages: number = Math.ceil(bonds.length / bondsPerPage)

  const handlePageChange = (pageNumber: number): void => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-5xl font-bold text-center mb-10 text-gray-800">Lista de Bonos</h1>
      
      <div className="flex flex-col gap-5 mb-10">
        {currentBonds.map((bond) => (
          <div key={bond.id} className="bg-green-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <span className="text-lg font-medium text-gray-800">
              Bono #{bond.id} - {bond.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-3 mb-5">
        <button 
          className="px-5 py-2 border-2 border-green-500 bg-white text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`px-4 py-2 border-2 border-green-500 rounded transition-colors ${
                currentPage === index + 1 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-green-500 hover:bg-green-500 hover:text-white'
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        <button 
          className="px-5 py-2 border-2 border-green-500 bg-white text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>

      <div className="text-center text-gray-600 text-sm">
        Página {currentPage} de {totalPages} - Mostrando {currentBonds.length} de {bonds.length} bonos
      </div>
    </div>
  )
}