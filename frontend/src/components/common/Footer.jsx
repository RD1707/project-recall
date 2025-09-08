import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/landing.css'; 

function Footer() {
  return (
    <footer className="landing-footer">
        <div className="landing-container">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <i className="fas fa-brain"></i>
                        <span>Recall</span>
                    </div>
                    <p>Aprendizado acelerado com inteligência artificial.</p>
                    <div className="footer-social">
                        <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                        <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                        <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>
                <div className="footer-links">
                    <div className="footer-column">
                        <h4>Produto</h4>
                        <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/progress">Meu Progresso</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Empresa</h4>
                        <ul>
                            <li><a href="#">Sobre</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Carreiras</a></li>
                            <li><a href="#">Contato</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Suporte</h4>
                        <ul>
                            <li><Link to="/ajuda">Central de Ajuda</Link></li>
                            <li><a href="#">Guias</a></li>
                            <li><a href="#">API Docs</a></li>
                            <li><a href="#">Status</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#">Privacidade</a></li>
                            <li><a href="#">Termos</a></li>
                            <li><a href="#">Cookies</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Recall. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>
  );
}

export default Footer;