# Murasaki Lens 🔍

Extensão para Google Chrome que permite buscar vídeos do YouTube com filtros de **idioma** e **país/região**, usando a YouTube Data API v3.

Tema escuro Murasaki — elegante, compacto e direto ao ponto.

---

## Funcionalidades

- 🔎 Busca vídeos do YouTube por termo textual
- 🌐 Filtro por **idioma** (30+ idiomas com código ISO)
- 🗺️ Filtro por **país/região** (48 países)
- 🔐 Autenticação OAuth 2.0 via Google (chrome.identity)
- 📋 Histórico das últimas 20 buscas
- 💾 Preferências salvas automaticamente
- 🏷️ Badge "Lens" discreto nas páginas do YouTube
- 🎨 Interface compacta (~380px), tema escuro Murasaki

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Plataforma | Chrome Extension Manifest V3 |
| Linguagem | Vanilla JavaScript (ES Modules) |
| Estilo | CSS3 puro (variáveis, flexbox) |
| API externa | YouTube Data API v3 |
| Autenticação | OAuth 2.0 via `chrome.identity.getAuthToken` |
| Armazenamento | `chrome.storage.local` |
| Sem dependências | Zero bibliotecas externas |

---

## Estrutura de arquivos

```
murasaki-lens/
├── manifest.json          # Manifest V3 da extensão
├── background.js           # Service Worker (ES module)
├── content.js              # Content script (badge no YouTube)
├── popup/
│   ├── popup.html          # Interface do popup
│   ├── popup.css           # Estilos (tema Murasaki dark)
│   └── popup.js            # Lógica do popup
├── utils/
│   ├── languages.js        # Mapeamento de idiomas e países
│   ├── youtube-api.js      # Wrapper da YouTube Data API v3
│   └── storage.js          # Preferências e histórico
└── icons/
    └── icon.svg            # Ícone vetorial (base para PNGs)
```

---

## Como instalar (modo desenvolvimento)

1. Clone ou baixe este repositório:
   ```bash
   git clone https://github.com/seu-usuario/murasaki-lens.git
   ```

2. Acesse `chrome://extensions` no Chrome.

3. Ative o **Modo do desenvolvedor** (canto superior direito).

4. Clique em **Carregar sem compactação**.

5. Selecione a pasta do projeto (`murasaki-lens/`).

6. A extensão aparecerá na barra de ferramentas com o ícone da lente roxa.

---

## Como configurar (Google Cloud)

A extensão usa a YouTube Data API v3, que exige credenciais do Google Cloud.

### 1. Criar projeto no Google Cloud Console

- Acesse [console.cloud.google.com](https://console.cloud.google.com)
- Crie um novo projeto ou selecione um existente

### 2. Ativar a YouTube Data API v3

- Vá em **APIs e Serviços** → **Biblioteca**
- Busque por "YouTube Data API v3" e clique em **Ativar**

### 3. Criar credencial OAuth 2.0

- Vá em **APIs e Serviços** → **Credenciais**
- Clique em **Criar credenciais** → **ID do cliente OAuth**
- Tipo de aplicação: **Aplicativo do Chrome**
- Preencha os dados e anote o **Client ID**

### 4. Obter chave de API

- Na mesma tela de Credenciais, clique em **Criar credenciais** → **Chave de API**
- Anote a chave gerada

### 5. Substituir placeholders no código

- Abra `manifest.json` e substitua `MURASAKI_LENS_CLIENT_ID` pelo Client ID real
- Abra `utils/youtube-api.js` e substitua `MURASAKI_LENS_API_KEY` pela chave de API real

### 6. Recarregar a extensão

- Volte em `chrome://extensions` e clique no ícone de recarregar da extensão

---

## Fluxo de uso

1. Clique no ícone da extensão na barra de ferramentas.
2. Selecione o **idioma** e o **país** desejados nos dropdowns.
3. Digite sua busca e pressione **Enter** ou clique na lupa.
4. Na primeira busca, o Chrome solicitará autorização da sua conta Google.
5. Os resultados aparecem como cards com thumbnail, título, canal e duração.
6. Clique em qualquer card para abrir o vídeo no YouTube.

---

## Permissões

| Permissão | Motivo |
|-----------|--------|
| `storage` | Salvar preferências e histórico |
| `identity` | OAuth 2.0 com conta Google |
| `https://www.googleapis.com/*` | Chamadas à YouTube Data API |

---

## Licença

MIT © 2026 Murasaki Lens
