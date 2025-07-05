import React from 'react';

export const EditBondPage: React.FC = () => {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-10"
      style={{ backgroundColor: '#efffed' }}
    >
      <form className="bg-white p-10 rounded-md shadow-md w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <label className="block mb-1 font-medium">Monto del bono</label>
            <input
              type="number"
              placeholder="10000"
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Número de períodos</label>
            <input
              type="text"
              placeholder="Value"
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Número de períodos</label>
            <input
              type="text"
              placeholder="Value"
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
        </div>

        <div className="flex justify-center">
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
            Guardar Cambios
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditBondPage;
