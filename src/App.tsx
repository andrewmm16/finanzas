import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SignInPage } from './auth/pages/SignInPage'
import { HomePage } from './auth/pages/HomePage'
import { NewBondPage } from './auth/pages/NewBondPage'
import { EditBondPage } from './auth/pages/EditBondPage'
import { BondsListPage } from './auth/pages/BondListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/sign-in" replace />}/>
        <Route path='/sign-in' element={<SignInPage />}/>
        <Route path='/home' element={<HomePage />}/>
        <Route path='/newbond' element={<NewBondPage />}/>
        <Route path='/editbond' element={<EditBondPage />}/>
        <Route path='/bondslist' element={<BondsListPage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App