import React from 'react'
import { Link } from 'react-router-dom'
import './Privacy.css'

export default function Privacy() {
  return (
    <main className="privacy-page">
      <article className="privacy-card">
        <Link className="privacy-back" to="/login">← Voltar para a plataforma</Link>
        <span className="privacy-eyebrow">PRIVACIDADE E DADOS PESSOAIS</span>
        <h1>Política de Privacidade</h1>
        <p className="privacy-updated">Última atualização: 27 de agosto de 2026</p>

        <p>
          Esta política explica, de forma transparente, como dados pessoais podem ser tratados na plataforma de acompanhamento de <strong>Bruna Ribeiro Affonso</strong>. Para dúvidas e solicitações relacionadas à privacidade, entre em contato pelo e-mail <a href="mailto:brunaribeiroac@gmail.com">brunaribeiroac@gmail.com</a>.
        </p>

        <h2>Dados que podem ser tratados</h2>
        <p>Conforme o uso da plataforma, podem ser tratados nome, e-mail, telefone/WhatsApp, foto de perfil, dados de autenticação, registros de treino, cargas, repetições, progresso, perguntas, respostas, notificações e observações fornecidas durante o acompanhamento.</p>

        <h2>Finalidades</h2>
        <ul>
          <li>criar e proteger a conta do usuário;</li>
          <li>viabilizar o acompanhamento e os treinos contratados;</li>
          <li>registrar evolução, perguntas, respostas e feedbacks;</li>
          <li>realizar atendimento e comunicações ligadas ao serviço;</li>
          <li>prevenir abuso, fraude e acessos não autorizados;</li>
          <li>cumprir obrigações legais e exercer direitos quando aplicável.</li>
        </ul>

        <h2>Dados relacionados à saúde</h2>
        <p>Campos de perguntas, observações e acompanhamento podem, dependendo do conteúdo fornecido, revelar informações relacionadas à saúde. Envie apenas informações necessárias ao acompanhamento. Quando houver tratamento de dado pessoal sensível, devem ser observadas as hipóteses e salvaguardas específicas previstas na LGPD.</p>

        <h2>Compartilhamento e infraestrutura</h2>
        <p>Os dados podem ser processados por provedores de infraestrutura e serviços necessários ao funcionamento da plataforma, como hospedagem, banco de dados e ferramentas contratadas. A lista operacional de fornecedores deve ser revisada periodicamente pela responsável pelo tratamento, inclusive quanto a eventual processamento fora do Brasil.</p>

        <h2>Segurança</h2>
        <p>A plataforma utiliza autenticação, autorização por perfil, conexão HTTPS, limitação de tentativas e outras medidas técnicas. Nenhum serviço conectado à internet é invulnerável; os controles devem ser revisados continuamente e incidentes devem seguir procedimento de resposta adequado.</p>

        <h2>Retenção</h2>
        <p>Os dados devem ser mantidos somente pelo período necessário às finalidades do acompanhamento, obrigações legais e exercício regular de direitos. A política operacional de retenção e descarte está em processo de formalização e deve definir prazos por categoria de dado.</p>

        <h2>Direitos do titular</h2>
        <p>O titular pode solicitar, nos casos previstos na LGPD, confirmação de tratamento, acesso, correção, informação sobre compartilhamentos, portabilidade quando aplicável, anonimização, bloqueio ou eliminação. Solicitações podem ser enviadas para <a href="mailto:brunaribeiroac@gmail.com?subject=Solicita%C3%A7%C3%A3o%20LGPD">brunaribeiroac@gmail.com</a>. Para proteger o próprio titular, poderá ser necessária confirmação de identidade antes do atendimento.</p>

        <div className="privacy-note">
          Esta página descreve o estado técnico observado da plataforma e não substitui validação jurídica das bases legais, prazos de retenção e contratos com operadores.
        </div>
      </article>
    </main>
  )
}
