
import React from 'react';

const ContactModal = ({ modal, closeModal }) => {
    if (modal !== 'contactModal') {
        return null;
    }

    return (
        <div id="contactModal" className="modal" style={{ display: 'block' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Iniciar Projeto</h3>
                    <span className="close" onClick={closeModal}>&times;</span>
                </div>
                <form className="modal-form" id="projectForm">
                    <div className="form-group">
                        <input type="text" id="projectName" placeholder="Seu Nome" required />
                    </div>
                    <div className="form-group">
                        <input type="email" id="projectEmail" placeholder="Seu Email" required />
                    </div>
                    <div className="form-group">
                        <input type="text" id="projectCompany" placeholder="Empresa" />
                    </div>
                    <div className="form-group">
                        <select id="projectType" required>
                            <option value="">Tipo de Projeto</option>
                            <option value="web">Site/Sistema Web</option>
                            <option value="mobile">Aplicativo Mobile</option>
                            <option value="ai">Solução com IA</option>
                            <option value="ecommerce">E-commerce</option>
                            <option value="custom">Projeto Personalizado</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <textarea id="projectDescription" placeholder="Descreva seu projeto" rows="4" required></textarea>
                    </div>
                    <button type="submit" className="btn-modal">Enviar Proposta</button>
                </form>
            </div>
        </div>
    );
};

export default ContactModal;
