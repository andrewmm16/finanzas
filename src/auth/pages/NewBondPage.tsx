import React from 'react';

export const NewBondPage: React.FC = () => {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start p-10"
      style={{ backgroundColor: '#efffed' }}
    >
      <h1 className="text-4xl font-bold mb-10">Nuevo Bono Corporativo</h1>

      <form className="bg-white p-10 rounded-md shadow-md w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-1 font-medium">Nombres del cliente</label>
            <input
              type="text"
              placeholder="John Andrew"
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Apellidos del cliente</label>
            <input
              type="text"
              placeholder="Doe Morales"
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Fecha de nacimiento del cliente</label>
            <input
              type="text"
              placeholder="DD/MM/AAAA"
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Monto del bono</label>
            <input
              type="number"
              placeholder="100000"
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Plazo de Gracia del Bono</label>
            <select className="w-full border rounded-md p-2">
              <option>Parcial</option>
              <option>Total</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Número de períodos</label>
            <input
              type="text"
              placeholder="Value"
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            className="px-6 py-2 rounded-md text-white font-semibold"
            style={{ backgroundColor: '#dc2626' }} // rojo base
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b91c1c'; // rojo hover
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-md text-black font-semibold"
            style={{ backgroundColor: '#47FFA9' }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3edb90';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#47FFA9';
            }}
          >
            Confirmar Bono
          </button>
        </div>
      </form>
    </main>
  );
};

export default NewBondPage;
