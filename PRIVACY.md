# Política de Privacidade — Murasaki Immerse

_Última atualização: 31 de julho de 2026_

## Resumo

O Murasaki Immerse mede o tempo de reprodução de vídeos do YouTube em idiomas que você está aprendendo. Na versão atual, os dados ficam no navegador; a extensão não possui conta própria, não opera um backend e não envia o histórico de imersão para um servidor.

## Dados tratados localmente

A extensão grava em `chrome.storage.local`:

- segundos de imersão agregados por data e código de idioma;
- idiomas nativos configurados por você;
- um cache limitado de até 500 IDs de vídeo e do idioma detectado, para evitar consultas repetidas.

O histórico de imersão é mantido por até 90 dias. Você pode exportá-lo em um arquivo JSON ou substituí-lo/mesclá-lo por um backup escolhido por você.

## Conexão opcional com o Google

Se você clicar em **Connect Google** no painel de configurações, o Chrome poderá abrir o consentimento da sua conta Google. A extensão solicita somente o escopo `youtube.readonly`, para consultar metadados de um vídeo no YouTube quando não consegue identificar seu idioma na própria página.

Não solicitamos sua senha, não lemos seu e-mail, não acessamos nem alteramos preferências, playlists, inscrições ou histórico do YouTube. O token OAuth é administrado pelo Chrome e usado apenas na chamada à YouTube Data API; não é armazenado pela extensão nem enviado a um servidor próprio.

Você pode escolher **Disconnect** a qualquer momento para limpar a autorização em cache do Chrome. A revogação da autorização no nível da conta também pode ser feita nas configurações de segurança da sua Conta Google.

## Compartilhamento e retenção

Na versão atual, a extensão não compartilha dados pessoais ou de uso com terceiros. A única comunicação externa opcional é a consulta à API do YouTube, autorizada por você, para obter o idioma padrão de áudio de um vídeo específico.

## Alterações futuras

Uma futura versão poderá oferecer sincronização opcional com um backend. Isso não será ativado silenciosamente: haverá aviso no produto, consentimento específico, política atualizada, controles de exclusão/exportação e escolha sobre o uso de dados para análise ou recomendações. Veja [FUTURE_BACKEND_AND_PRIVACY.md](FUTURE_BACKEND_AND_PRIVACY.md).

## Contato

