import React, { useState } from 'react'

const OllamaChat = () => {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResponse('')
    setError('')

    try {
      console.log('Sending request to Ollama...')
      
      // Using fetch instead of axios for better error handling
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3',
          prompt,
          stream: false
        })
      })

      console.log('Response status:', res.status)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log('Response data:', data)
      
      setResponse(data.response?.trim() || 'No response received')
    } catch (error) {
      console.error('Error communicating with Ollama:', error)
      setError(`Error: ${error.message}`)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>🦙 Ollama Chat (Llama3) - Debug Version</h2>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e8f4f8', borderRadius: '4px' }}>
        <h4>Debug Info:</h4>
        <p>Make sure:</p>
        <ul>
          <li>Ollama is running on your system</li>
          <li>llama3 model is installed</li>
          <li>Your backend API endpoint is working</li>
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={4}
          style={{ width: '100%', fontSize: '16px', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button 
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()} 
          style={{ 
            padding: '0.75rem', 
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Thinking...' : 'Send Prompt'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '1rem', background: '#ffebee', padding: '1rem', borderRadius: '8px', color: '#c62828' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div style={{ marginTop: '2rem', background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h3>Response:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{response}</pre>
        </div>
      )}
    </div>
  )
}

export default OllamaChat