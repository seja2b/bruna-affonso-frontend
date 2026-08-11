import { useState } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const testBackend = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3000/api/test')
      setMessage(response.data.message)
    } catch (error) {
      setMessage('Erro ao conectar com backend')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🚀 Plataforma de Treinos - Bruna Affonso</h1>
      <p>Frontend funcionando!</p>
      
      <button 
        onClick={testBackend}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {loading ? 'Testando...' : 'Testar Conexão com Backend'}
      </button>

      {message && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <strong>Resultado:</strong> {message}
        </div>
      )}
    </div>
  )
}

export default App