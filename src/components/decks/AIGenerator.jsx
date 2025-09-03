import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { generateFlashcardsFromText, generateFlashcardsFromFile, generateFlashcardsFromYouTube } from '../../api/flashcards';

function AIGenerator({ deckId, onGenerationStart }) {
  const [activeTab, setActiveTab] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    file: null,
    url: '',
    count: 5,
  });

  const handleInputChange = (e) => {
    const { id, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      const params = { count: formData.count };

      if (activeTab === 'text') {
        if (formData.text.length < 50) {
            toast.error("O texto precisa ter pelo menos 50 caracteres.");
            throw new Error("Texto curto");
        }
        params.text = formData.text;
        result = await generateFlashcardsFromText(deckId, params);
      } else if (activeTab === 'file') {
         if (!formData.file) {
            toast.error("Por favor, selecione um ficheiro.");
            throw new Error("Ficheiro em falta");
        }
        const fileFormData = new FormData();
        fileFormData.append('file', formData.file);
        fileFormData.append('count', formData.count);
        fileFormData.append('type', 'Pergunta e Resposta'); 
        result = await generateFlashcardsFromFile(deckId, fileFormData);
      } else if (activeTab === 'youtube') {
        if (!formData.url.includes('youtube.com') && !formData.url.includes('youtu.be')) {
            toast.error("Por favor, insira um URL válido do YouTube.");
            throw new Error("URL inválida");
        }
        params.url = formData.url;
        result = await generateFlashcardsFromYouTube(deckId, params);
      }
      
      toast.success('Geração iniciada! Os novos cards aparecerão em breve.');
      onGenerationStart(); 
      setFormData({ text: '', file: null, url: '', count: 5 }); 

    } catch (error) {
      console.error("Falha na submissão de geração:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="ai-generator-section">
      <div className="generator-card">
        <div className="generator-header">
          <div className="generator-title-container">
            <h2>Gerar com IA</h2>
          </div>
          <p className="generator-subtitle">Crie flashcards automaticamente</p>
        </div>

        <form onSubmit={handleSubmit} className="generator-form">
          <div className="input-tabs">
            <button type="button" className={`input-tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>Texto</button>
            <button type="button" className={`input-tab ${activeTab === 'file' ? 'active' : ''}`} onClick={() => setActiveTab('file')}>Ficheiro</button>
            <button type="button" className={`input-tab ${activeTab === 'youtube' ? 'active' : ''}`} onClick={() => setActiveTab('youtube')}>YouTube</button>
          </div>

          <div className="tab-content">
            {activeTab === 'text' && (
              <div className="tab-pane active">
                <label htmlFor="text" className="input-label">Cole o seu texto</label>
                <textarea id="text" value={formData.text} onChange={handleInputChange} rows="6"></textarea>
              </div>
            )}
            {activeTab === 'file' && (
              <div className="tab-pane active">
                <label htmlFor="file" className="input-label">Envie um ficheiro</label>
                <input type="file" id="file" onChange={handleInputChange} accept=".txt,.md,.pdf,.docx"/>
              </div>
            )}
            {activeTab === 'youtube' && (
              <div className="tab-pane active">
                <label htmlFor="url" className="input-label">URL do vídeo</label>
                <input type="url" id="url" value={formData.url} onChange={handleInputChange} placeholder="https://www.youtube.com/watch?v=..."/>
              </div>
            )}
          </div>
          
          <div className="generation-options">
             <div className="option-group">
                <label className="option-label">Quantidade</label>
                 <input type="number" id="count" value={formData.count} onChange={handleInputChange} min="1" max="15" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            {isLoading ? 'A gerar...' : 'Gerar Flashcards'}
          </button>
        </form>
      </div>
    </aside>
  );
}

export default AIGenerator;