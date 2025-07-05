import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SignInPage } from './auth/pages/SignInPage'
import { HomePage } from './auth/pages/HomePage'
import { NewBondPage } from './auth/pages/NewBondPage'
import { ManageBondsPage } from './auth/pages/ManageBondsPage'
import { Profile } from './auth/pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/sign-in" replace />}/>
        <Route path='/sign-in' element={<SignInPage />}/>
        <Route path='/home' element={<HomePage />}/>
        <Route path='/newbond' element={<NewBondPage />}/>
        <Route path='/manage-bonds' element={<ManageBondsPage />}/>
        <Route path='/profile' element={<Profile />}/>


      </Routes>
    </BrowserRouter>
  )
}

export default App