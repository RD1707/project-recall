import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateFlashcardsFromText, generateFlashcardsFromFile, generateFlashcardsFromYouTube } from '../../api/flashcards';

const UploadIcon = () => (
    <svg className="drop-zone-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const useDragAndDrop = (onFileDrop) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileDrop(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    return { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop };
};

function AIGenerator({ deckId, onGenerationStart }) {
    const [activeTab, setActiveTab] = useState('text');
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    
    const [formData, setFormData] = useState({
        text: '',
        file: null,
        url: '',
        count: 5,
        difficulty: 'medio',
        type: 'Pergunta e Resposta', 
    });

    const processFile = useCallback((file) => {
        if (!file) return;

        const validTypes = ['text/plain', 'text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 10 * 1024 * 1024; 

        if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|md|docx)$/i)) {
            toast.error('Formato de arquivo não suportado. Use PDF, TXT, MD ou DOCX.');
            return;
        }

        if (file.size > maxSize) {
            toast.error('Arquivo muito grande. O tamanho máximo é 10MB.');
            return;
        }

        setFormData(prev => ({ ...prev, file }));
        setFileName(file.name);
    }, []);

    const { isDragging, ...dragHandlers } = useDragAndDrop(processFile);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setFormData(prev => ({ ...prev, file: null }));
        setFileName('');
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleNumberChange = (amount) => {
        setFormData(prev => ({
            ...prev,
            count: Math.max(1, Math.min(15, prev.count + amount))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const params = { 
                count: formData.count, 
                difficulty: formData.difficulty,
                type: formData.type 
            };
            let generationStarted = false;

            if (activeTab === 'text') {
                if (formData.text.length < 50) {
                    toast.error("O texto precisa ter pelo menos 50 caracteres.");
                    throw new Error("Texto muito curto");
                }
                await generateFlashcardsFromText(deckId, { ...params, textContent: formData.text });
                generationStarted = true;

            } else if (activeTab === 'file') {
                if (!formData.file) {
                    toast.error("Por favor, selecione um arquivo.");
                    throw new Error("Arquivo não encontrado");
                }
                const fileFormData = new FormData();
                fileFormData.append('file', formData.file);
                fileFormData.append('count', params.count);
                fileFormData.append('difficulty', params.difficulty);
                fileFormData.append('type', params.type);

                await generateFlashcardsFromFile(deckId, fileFormData);
                generationStarted = true;

            } else if (activeTab === 'youtube') {
                if (!formData.url.includes('youtube.com') && !formData.url.includes('youtu.be')) {
                    toast.error("Por favor, insira uma URL válida do YouTube.");
                    throw new Error("URL inválida");
                }
                await generateFlashcardsFromYouTube(deckId, { ...params, youtubeUrl: formData.url });
                generationStarted = true;
            }
            
            if(generationStarted) {
                toast.success('Geração iniciada! Os novos cards aparecerão em breve.');
                onGenerationStart();
                setFormData({ text: '', file: null, url: '', count: 5, difficulty: 'medio', type: 'Pergunta e Resposta' });
                setFileName('');
            }
        } catch (error) {
            console.error("Falha na submissão de geração:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside className="ai-generator-section">
            <div className="generator-card">
                <div className="generator-header">
                    <div className="generator-title-container">
                        <i className="fas fa-magic"></i>
                        <h2>Gerar com IA</h2>
                    </div>
                    <p className="generator-subtitle">Crie flashcards automaticamente</p>
                </div>

                <form onSubmit={handleSubmit} className="generator-form">
                    <div className="input-tabs">
                        <button type="button" className={`input-tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}><i className="fas fa-font"></i>Texto</button>
                        <button type="button" className={`input-tab ${activeTab === 'file' ? 'active' : ''}`} onClick={() => setActiveTab('file')}><i className="fas fa-file-alt"></i>Arquivo</button>
                        <button type="button" className={`input-tab ${activeTab === 'youtube' ? 'active' : ''}`} onClick={() => setActiveTab('youtube')}><i className="fab fa-youtube"></i>YouTube</button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'text' && (
                            <div className="tab-pane active">
                                <label htmlFor="text" className="input-label sr-only">Cole ou digite seu texto</label>
                                <textarea id="text" value={formData.text} onChange={handleInputChange} rows="6" placeholder="Ex: O sistema solar é composto por oito planetas..."></textarea>
                            </div>
                        )}
                        {activeTab === 'file' && (
                             <div className="tab-pane active">
                                {!fileName ? (
                                    <label htmlFor="file-input" className={`file-drop-zone ${isDragging ? 'drag-over' : ''}`} {...dragHandlers}>
                                        <div className="drop-zone-content">
                                            <UploadIcon />
                                            <p className="drop-zone-text">Arraste um arquivo ou clique para selecionar</p>
                                            <p className="drop-zone-subtext">PDF, TXT, MD, DOCX • Máx 10MB</p>
                                        </div>
                                        <input type="file" id="file-input" onChange={handleFileChange} accept=".txt,.md,.pdf,.docx" className="sr-only" />
                                    </label>
                                ) : (
                                    <div className="selected-file">
                                        <div className="file-info">
                                            <i className="fas fa-file-check file-icon"></i>
                                            <span className="file-name">{fileName}</span>
                                        </div>
                                        <button type="button" className="remove-file-btn" onClick={handleRemoveFile} title="Remover arquivo"><i className="fas fa-times"></i></button>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'youtube' && (
                            <div className="tab-pane active">
                                <label htmlFor="url" className="input-label sr-only">URL do vídeo</label>
                                <div className="url-input-wrapper">
                                    <input type="url" id="url" value={formData.url} onChange={handleInputChange} placeholder="https://www.youtube.com/watch?v=..." />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="generation-options">
                        <div className="option-group">
                            <label className="option-label" htmlFor="count-input">Quantidade</label>
                            <div className="number-input">
                                <button type="button" className="number-btn" onClick={() => handleNumberChange(-1)} aria-label="Diminuir quantidade"><i className="fas fa-minus"></i></button>
                                <input type="number" id="count-input" value={formData.count} readOnly />
                                <button type="button" className="number-btn" onClick={() => handleNumberChange(1)} aria-label="Aumentar quantidade"><i className="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div className="option-group">
                            <label className="option-label" htmlFor="type">Tipo de Card</label>
                            <select id="type" value={formData.type} onChange={handleInputChange} className="custom-select">
                                <option value="Pergunta e Resposta">Pergunta e Resposta</option>
                                <option value="Múltipla Escolha">Múltipla Escolha</option>
                            </select>
                        </div>
                    </div>
                     <div className="generation-options" style={{marginTop: 0}}>
                        <div className="option-group">
                            <label className="option-label" htmlFor="difficulty">Dificuldade</label>
                            <select id="difficulty" value={formData.difficulty} onChange={handleInputChange} className="custom-select">
                                <option value="facil">Fácil</option>
                                <option value="medio">Médio</option>
                                <option value="dificil">Difícil</option>
                            </select>
                        </div>
                     </div>


                    <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                        {isLoading ? 'Gerando...' : 'Gerar Flashcards'}
                    </button>
                </form>
            </div>
        </aside>
    );
}

export default AIGenerator;