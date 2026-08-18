import React from 'react'
import './ContactCard.css'

export default function ContactCard({ whatsappUrl, phone }) {
  return (
    <div className="contact-card-container">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-icon-wrapper">
            <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="contact-info">
            <h3>Fale com sua Personal</h3>
            <p>Dúvidas? Estou aqui para ajudar!</p>
          </div>
        </div>

        <div className="contact-body">
          {phone && (
            <div className="phone-display">
              <span className="phone-label">📱</span>
              <span className="phone-number">{phone}</span>
            </div>
          )}
        </div>

        <div className="contact-footer">
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-whatsapp-pro"
          >
            <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.505-2.337 1.236-3.256 2.154-1.798 1.8-2.823 4.14-2.823 6.556 0 2.417 1.025 4.753 2.823 6.556 1.919 1.919 4.255 2.823 6.556 2.823h.006c2.301 0 4.637-1.025 6.556-2.823 1.798-1.8 2.823-4.14 2.823-6.556 0-2.417-1.025-4.753-2.823-6.556-1.919-1.919-4.255-2.823-6.556-2.823z"/>
            </svg>
            Abrir WhatsApp
          </a>
        </div>

        <div className="contact-badge">
          ⚡ Resposta Rápida
        </div>
      </div>
    </div>
  )
}