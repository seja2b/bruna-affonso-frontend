# Auditoria de Segurança e Preparação LGPD — Frontend

Data: 2026-08-27

> Revisão técnica e de preparação. Não representa certificação de segurança nem parecer jurídico de conformidade com a LGPD.

## Controles positivos

- React Router com guards de autenticação e role;
- chamadas à API centralizadas em `src/services/api.js`;
- access token enviado por `Authorization: Bearer`;
- refresh de sessão centralizado;
- erros de autenticação apresentados sem expor detalhes internos;
- React escapa texto renderizado normalmente por JSX, reduzindo risco de XSS em comparação com montagem manual de HTML;
- arquivos `.env` locais são ignorados pelo Git;
- não foi identificado segredo privado no código cliente revisado.

## Achados

### ALTO — access token e refresh token em `localStorage`

`AuthContext.jsx` e `services/api.js` armazenam ambos os tokens em `localStorage`. Qualquer XSS executado na mesma origem pode ler e exfiltrar esses tokens. O refresh token tem duração maior, portanto é o item mais sensível.

Recomendação prioritária: coordenar frontend e backend para que o refresh token seja entregue em cookie `HttpOnly`, `Secure` e `SameSite`, com rotação e revogação no servidor. O access token pode permanecer apenas em memória e ser renovado por sessão.

Essa migração não foi feita neste PR porque altera o contrato de autenticação e deve ser implantada de forma coordenada para não derrubar sessões em produção.

### MÉDIO — CSP depende da superfície atual

Foram adicionados headers do Cloudflare Pages. O CSP permite imagens e conexões HTTPS necessárias ao funcionamento atual. Sempre que novos provedores forem adicionados, a política deve ser revisada em vez de liberar origens indiscriminadamente.

### MÉDIO — dados sensíveis podem aparecer em telas de acompanhamento

A aplicação permite que alunos e profissional registrem observações e informações de treino. Dependendo do conteúdo, podem existir informações de saúde. O frontend deve evitar solicitar dados além do necessário e informar claramente a finalidade de campos sensíveis.

### MÉDIO — ausência de self-service de direitos do titular

Foi adicionada uma página de privacidade e canal por e-mail. Não há ainda uma tela automatizada para exportar/excluir dados. Isso não impede um processo manual, mas o procedimento operacional precisa existir, validar identidade do solicitante e ser documentado.

## Alterações desta branch

- rota pública `/privacidade`;
- Política de Privacidade visível na tela de login;
- canal de privacidade `brunaribeiroac@gmail.com`;
- arquivo `public/_headers` para Cloudflare Pages com:
  - HSTS;
  - `X-Content-Type-Options`;
  - anti-clickjacking;
  - Referrer Policy;
  - Permissions Policy;
  - Content Security Policy;
  - `Cache-Control: no-store` nas áreas autenticadas e login.

## Próxima etapa de autenticação

1. adicionar tabela/sessão de refresh no backend com token armazenado por hash ou `jti`;
2. rotacionar refresh token a cada renovação;
3. revogar sessão no logout e em mudança de senha/status;
4. entregar refresh via cookie HttpOnly/Secure/SameSite;
5. remover `refreshToken` do `localStorage`;
6. manter access token em memória com TTL curto;
7. testar login, refresh, múltiplas abas, expiração e logout forçado.

## LGPD — itens administrativos ainda necessários

- definir bases legais por finalidade;
- formalizar tratamento de eventual dado sensível;
- listar operadores/fornecedores e transferências internacionais;
- definir retenção e descarte;
- procedimento de incidentes;
- procedimento de atendimento aos direitos dos titulares;
- revisão jurídica da política antes de declarar conformidade integral.
