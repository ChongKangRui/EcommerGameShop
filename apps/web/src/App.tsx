import { useState } from 'react'
import './App.css'
import { Route , Routes } from 'react-router'
import Home from './pages/Home'
import Layout from './components/Layout'
import About from './pages/About'
import { LogIn } from 'lucide-react'



function App() {
 
  return (
    
      <div>
        <Routes >
          {/* Putting layout for every page */}
          <Route element={<Layout/>}>
            <Route path='/' element={<Home/>}></Route>
            <Route path='/about' element={<About/>}></Route>
          </Route>

          <Route path='/login' element={<LogIn/>}></Route>


        </Routes>
      </div>
   
  )
}

export default App
