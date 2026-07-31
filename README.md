# Murasaki Immerse

Extensão para Chrome que registra automaticamente o tempo de imersão em idiomas enquanto você assiste a vídeos no YouTube. Os dados ficam somente no navegador, em `chrome.storage.local`; não há conta, dashboard web ou servidor próprio.

## Recursos

- Conta somente o tempo em que um vídeo do YouTube está em reprodução.
- Exclui os idiomas nativos escolhidos por você, para destacar a imersão em outros idiomas.
- Mostra os totais de hoje, da semana e do mês, a distribuição de idiomas do dia, os últimos sete dias e a sequência atual de dias com imersão.
- Detecta o idioma pelo cache local, pelas legendas ou metadados disponíveis no player e, quando possível, pela YouTube Data API como último recurso.
- Lida com a navegação interna do YouTube e interrompe a contagem ao pausar, buscar um trecho ou sair de uma página de vídeo.
- Oferece backup em JSON, importação substitutiva e mesclagem de históricos.

## Como usar

1. Clique no ícone da extensão.
2. Na primeira abertura, adicione pelo menos um idioma nativo e selecione **Save & start tracking**.
3. Assista a um vídeo em uma página `youtube.com/watch`.
4. Abra o popup novamente para consultar as estatísticas. Use o ícone de configurações para editar os idiomas nativos ou administrar backups.
5. Se quiser melhorar a identificação de vídeos cujo idioma não aparece na página, abra as configurações e escolha **Connect Google**. O consentimento é opcional e explica a única permissão solicitada: leitura de metadados de vídeo no YouTube.

Vídeos cujo idioma não puder ser identificado não são contabilizados. A detecção usa informações fornecidas pelo YouTube e pode não refletir perfeitamente o idioma falado em todos os vídeos.

## Backup e restauração

Em **Backup & restore**, nas configurações do popup:

- **Export backup** baixa um arquivo JSON com o histórico e os idiomas nativos.
- **Import & replace** substitui todos os dados locais pelo backup, após confirmação.
- **Merge backup** mantém os dados existentes, une os idiomas nativos e soma os segundos quando data e idioma coincidem.

O arquivo deve ser um backup criado pelo Murasaki Immerse. A importação aceita arquivos de até 5 MB.

## Privacidade e permissões

| Permissão | Uso |
| --- | --- |
| `storage` | Guarda histórico, idiomas nativos e cache de idiomas localmente. |
| `downloads` | Salva o backup JSON solicitado por você. |
| `identity` | Após você clicar em **Connect Google**, obtém um token OAuth para o fallback de detecção pela YouTube Data API. |
| `*://*.youtube.com/*` | Observa o player nas páginas do YouTube para registrar o tempo de reprodução. |
| `https://www.googleapis.com/*` | Consulta metadados do vídeo somente quando os métodos locais de detecção não bastam. |

A extensão não altera região, preferências ou cookies do YouTube. O botão **Disconnect** remove a autorização em cache do Chrome; ele não apaga seu histórico local. O histórico de imersão é mantido por até 90 dias e o cache de idiomas por até 500 vídeos.

Leia a [política de privacidade atual](PRIVACY.md) e o [plano para uma futura sincronização com backend](FUTURE_BACKEND_AND_PRIVACY.md). A versão atual não envia dados de uso a nenhum servidor.

## Desenvolvimento

O projeto é uma extensão Chrome Manifest V3 feita com JavaScript, HTML e CSS puros — não há dependências, etapa de build ou suíte de testes automatizada.

1. Abra `chrome://extensions` no Chrome.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta deste repositório.
4. Recarregue a extensão após modificar `manifest.json`, JavaScript, HTML ou CSS.

Para testar manualmente, abra uma página de vídeo do YouTube, configure os idiomas nativos, reproduza e pause um vídeo em outro idioma e confirme o total no popup. Durante a depuração, os consoles da página e do service worker ficam acessíveis em `chrome://extensions`.

## Estrutura

```text
├── manifest.json       # configuração Manifest V3, permissões e OAuth
├── background.js       # service worker e persistência de eventos
├── content.js          # observação do player e detecção de idioma
├── popup/              # interface e lógica do painel da extensão
├── utils/              # armazenamento, idiomas e cliente da YouTube API
└── icons/              # ícones da extensão
```
