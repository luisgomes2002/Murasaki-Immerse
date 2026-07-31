# Backend futuro, login Google e privacidade

Este documento separa o funcionamento atual da extensão do plano futuro. Hoje o Murasaki Immerse é local: não há conta própria, sincronização ou análise em servidor. Não envie dados antes de definir finalidade, política pública e controles para o usuário.

## Separar os dois usos de Google

1. **OAuth da extensão para YouTube.** Continua opcional e limitado ao escopo `youtube.readonly`, apenas para identificar o idioma de vídeos. Não é um login na sua plataforma e não deve ser usado como sessão do seu site.
2. **Login da sua plataforma.** Site e backend devem usar OAuth/OIDC próprio, com cliente do tipo **Web application**, redirect URIs exatas e validação de `state`, `nonce`, emissor, audiência e expiração do ID token. A extensão deve autenticar-se no backend por fluxo próprio — por exemplo, `chrome.identity.launchWebAuthFlow` com PKCE — e receber uma sessão/token curto do backend.

Não reutilize o token da YouTube Data API como credencial da sua API e não o envie ao backend. Mantenha clientes OAuth separados para Chrome Extension e Web application; segredos do cliente web ficam somente no servidor, nunca na extensão ou no repositório.

```text
Extensão ── OAuth YouTube opcional ──> Google / YouTube Data API
    │
    └── login/sessão própria com PKCE ──> Seu backend ──> banco de dados
                                           │
                                           └── análise e recomendações consentidas
Site ── Google Sign-In / OIDC ───────────> Seu backend
```

## Dados mínimos para sincronizar

- identificador interno pseudônimo do usuário, não o e-mail como chave;
- data, idioma e segundos agregados;
- versão do esquema, fuso horário escolhido e data de sincronização.

Evite enviar URL, título, ID do vídeo, transcrições, cookies, e-mail ou histórico de navegação, a menos que um recurso específico realmente necessite deles e o usuário concorde separadamente. Para recomendações, comece pelos agregados de idioma/tempo e explique os sinais usados.

## Consentimento e controles

- Mostre uma tela separada antes da primeira sincronização, com campos enviados, finalidade e prazo de retenção.
- Peça escolha separada para análise de produto e recomendações personalizadas; a sincronização não deve depender de análise desnecessária.
- Ofereça recusa sem prejudicar o rastreamento local, pausa de sincronização, exportação e exclusão de conta/dados.
- Registre a versão da política e o momento do consentimento; permita revogação e informe o prazo de remoção de backups.

## Segurança de implementação

- Use HTTPS, tokens curtos, rotação e validação no servidor.
- Use PKCE, `state` e `nonce` nos fluxos OAuth. Nunca coloque `client_secret`, refresh token ou chave privada na extensão.
- Se guardar refresh tokens, cifre-os no servidor, limite o acesso, audite-o e permita revogação.
- Aplique limite de taxa, validação de esquema/tamanho, logs sem tokens e separação entre desenvolvimento e produção.

## Retenção e análise

“Tempo indeterminado” não deve ser a retenção padrão. Defina prazos justificáveis por categoria: dados da conta enquanto ela estiver ativa, logs técnicos por período curto e agregados anonimizados apenas quando a reidentificação não for viável. Publique os prazos e revise-os.

## Checklist antes de publicar a sincronização

- [ ] Definir entidade controladora, contato de privacidade e países de tratamento.
- [ ] Mapear dados, finalidades, bases legais e fornecedores/subprocessadores.
- [ ] Criar política de privacidade pública e configurar seu link na Chrome Web Store.
- [ ] Criar clientes OAuth distintos para extensão e site; configurar consentimento, domínios e redirects.
- [ ] Implementar login do site e sessão da extensão com PKCE; validar tokens no backend.
- [ ] Implementar sincronização **opt-in** e configurações de dados.
- [ ] Implementar exportação, exclusão, revogação e prazos de retenção reais.
- [ ] Avaliar contratos, transferências internacionais e obrigações aplicáveis, incluindo LGPD/GDPR, com assessoria jurídica.
- [ ] Atualizar a declaração de privacidade da Chrome Web Store e testar perfis novos e contas já conectadas.

## Referências oficiais

- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/api/identity): solicitações interativas devem partir de uma ação explícita da interface; tokens são gerenciados pelo Chrome.
- [OAuth 2.0 do Google](https://developers.google.com/identity/protocols/oauth2): use clientes adequados a cada plataforma, escopos incrementais e armazenamento seguro de tokens de longa duração.
- [Política de privacidade da Chrome Web Store](https://developer.chrome.com/docs/webstore/program-policies/privacy): produtos que tratam dados de usuário precisam de uma política precisa, atualizada e acessível na ficha da loja.
