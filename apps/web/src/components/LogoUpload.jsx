import React, { useState } from 'react';
import './LogoUpload.css';

const LogoUpload = ({ value, onChange, onError }) => {
  const [preview, setPreview] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateImageUrl = async (url) => {
    if (!url) return false;

    try {
      setIsValidating(true);
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.startsWith('image/')) {
        return true;
      } else {
        throw new Error('URL não é uma imagem válida');
      }
    } catch (error) {
      console.error('Erro ao validar imagem:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleUrlChange = async (e) => {
    const url = e.target.value;
    onChange(url);

    if (url) {
      const isValid = await validateImageUrl(url);
      if (isValid) {
        setPreview(url);
        onError && onError(null);
      } else {
        setPreview(null);
        onError && onError('URL inválida ou imagem não encontrada');
      }
    } else {
      setPreview(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Em um ambiente real, você faria upload para um serviço como Cloudinary
      // Por enquanto, vamos simular criando uma URL local
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setPreview(dataUrl);
        onChange(dataUrl);
        onError && onError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="logo-upload">
      <div className="upload-section">
        <label>URL da Logo</label>
        <div className="url-input-container">
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder="https://exemplo.com/logo.png"
            className={isValidating ? 'validating' : ''}
          />
          {isValidating && <div className="loading-spinner"></div>}
        </div>
        <small>
          Insira a URL da sua logo ou faça upload de um arquivo
        </small>
      </div>

      <div className="upload-section">
        <label>Upload de Arquivo</label>
        <div className="file-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            id="logo-file"
          />
          <label htmlFor="logo-file" className="file-upload-btn">
            <i className="fas fa-upload"></i>
            Escolher Arquivo
          </label>
        </div>
        <small>
          Formatos aceitos: PNG, JPG, SVG (máx. 2MB)
        </small>
      </div>

      {preview && (
        <div className="preview-section">
          <label>Preview</label>
          <div className="logo-preview">
            <img
              src={preview}
              alt="Logo Preview"
              onError={() => {
                setPreview(null);
                onError && onError('Erro ao carregar imagem');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;
