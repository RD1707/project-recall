import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSinapse } from '../../context/SinapseContext';

function FileAttachment({ onFileProcessed }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { uploadFile } = useSinapse();

    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];

    const validateFile = (file) => {
        // Validar tipo
        if (!allowedTypes.includes(file.type)) {
            toast.error('Formato não suportado. Use PDF, DOCX, TXT, JPG ou PNG.');
            return false;
        }

        // Validar tamanho (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Arquivo muito grande. Máximo: 10MB');
            return false;
        }

        return true;
    };

    const handleFileUpload = async (file) => {
        if (!validateFile(file)) return;

        setIsUploading(true);
        try {
            const attachment = await uploadFile(file);
            toast.success(`Arquivo "${file.name}" processado com sucesso!`);
            onFileProcessed(attachment);
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            toast.error('Erro ao processar arquivo. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
        // Limpar input para permitir selecionar o mesmo arquivo novamente
        e.target.value = '';
    };

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

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <button
                className="sinapse-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Anexar arquivo (PDF, DOCX, TXT, Imagem)"
            >
                {isUploading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                ) : (
                    <i className="fas fa-paperclip"></i>
                )}
            </button>

            {/* Drop Zone Overlay */}
            {isDragging && (
                <div
                    className="sinapse-drop-zone"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="drop-zone-content">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>Solte o arquivo aqui</p>
                        <span>PDF, DOCX, TXT, JPG, PNG (máx. 10MB)</span>
                    </div>
                </div>
            )}
        </>
    );
}

export default FileAttachment;
