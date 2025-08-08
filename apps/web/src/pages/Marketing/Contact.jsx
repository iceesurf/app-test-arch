import React, { useEffect } from "react";

const Contact = () => {
  useEffect(() => {
    const form = document.getElementById("contactForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch("/api/new-contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert("Mensagem enviada com sucesso!");
          form.reset();
        } else {
          alert("Ocorreu um erro ao enviar a mensagem.");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Ocorreu um erro ao enviar a mensagem.");
      }
    });
  }, []);

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Entre em Contato</h2>
          <p className="section-subtitle">
            Vamos conversar sobre seu próximo projeto
          </p>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <div>
                <h4>Email</h4>
                <p>samuel@dnxtai.com</p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <div>
                <h4>Telefone</h4>
                <p>+55 (38) 9 9182 3797 </p>
              </div>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <h4>Localização</h4>
                <p>Brasil</p>
              </div>
            </div>
          </div>
          <form className="contact-form" id="contactForm">
            <div className="form-group">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Seu Nome"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Seu Email"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Seu Telefone"
              />
            </div>
            <div className="form-group">
              <select id="service" name="service" required>
                <option value="">Selecione um serviço</option>
                <option value="web">Desenvolvimento Web</option>
                <option value="mobile">App Mobile</option>
                <option value="ai">Inteligência Artificial</option>
                <option value="cloud">Cloud & DevOps</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <textarea
                id="message"
                name="message"
                placeholder="Descreva seu projeto"
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn-submit">
              <i className="fas fa-paper-plane"></i>
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
