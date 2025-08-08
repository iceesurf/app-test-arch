
import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { app, functions } from '../../firebase'; // Import the initialized app and functions

const RegisterModal = ({ modal, closeModal, switchModal }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    if (modal !== 'registerModal') {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        try {
            const registerUser = httpsCallable(functions, 'registerUser');
            
            console.log("Dados enviados para registerUser:", { email, password, displayName: name });
            await registerUser({ email, password, displayName: name });
            alert("Usuário cadastrado com sucesso!");
            closeModal();
        } catch (err) {
            console.error("Erro ao cadastrar usuário:", err);
            setError(err.message);
        }
    };

    return (
        <div id="registerModal" className="modal" style={{ display: 'block' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Cadastro</h3>
                    <span className="close" onClick={closeModal}>&times;</span>
                </div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input 
                            type="text" 
                            id="registerName" 
                            placeholder="Nome Completo" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="email" 
                            id="registerEmail" 
                            placeholder="Email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="password" 
                            id="registerPassword" 
                            placeholder="Senha" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            placeholder="Confirmar Senha" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                    <button type="submit" className="btn-modal">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
