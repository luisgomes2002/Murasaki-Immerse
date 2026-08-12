const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = [
  'en', 'pt', 'es', 'ja', 'ko', 'fr', 'de', 'it', 'zh',
];

const TRANSLATIONS = {
  en: {
    'popup.subtitle': 'Your language time, automatically',
    'popup.interfaceLanguage': 'Interface language',
    'popup.useBrowserLanguage': 'Use browser language',
    'popup.settings': 'Native language settings',
    'popup.streak': 'Current streak',
    'popup.days': 'days',
    'popup.personalize': 'PERSONALIZE YOUR TRACKER',
    'popup.close': 'Close settings',
    'popup.nativeTitle': 'Which languages are native to you?',
    'popup.nativeDescription': 'Murasaki tracks your YouTube time in every other detected language. Add all of your native languages.',
    'popup.chooseNative': 'Choose a native language',
    'popup.add': 'Add',
    'popup.saveTracking': 'Save & start tracking',
    'popup.backup': 'Backup & restore',
    'popup.backupDescription': 'Export your local data, replace it from a backup, or merge another backup into it.',
    'popup.export': 'Export backup',
    'popup.import': 'Import & replace',
    'popup.merge': 'Merge backup',
    'popup.google': 'Google connection',
    'popup.googleDescription': "Optional. Connect Google so Murasaki can use YouTube's read-only video metadata when it cannot determine a video's language locally.",
    'popup.privacy': 'Your immersion history stays in this browser. We do not collect your Google email, password, or YouTube activity, and we do not send your time data to a server.',
    'popup.checking': 'Checking connection…',
    'popup.connect': 'Connect Google',
    'popup.disconnect': 'Disconnect',
    'popup.videoTitle': 'Current video language',
    'popup.videoPrompt': 'Open a YouTube video to adjust its language.',
    'popup.videoSelect': 'Language of the current YouTube video',
    'popup.apply': 'Apply',
    'popup.totals': 'Immersion totals',
    'popup.today': 'today',
    'popup.week': 'this week',
    'popup.month': 'this month',
    'popup.todayImmersion': "Today's immersion",
    'popup.last7Days': 'Last 7 days',
    'popup.dashboard': 'Dashboard',
    'popup.refresh': 'Refresh dashboard',
    'popup.selectLanguage': 'Select a language',
    'popup.chooseVideoLanguage': 'Choose video language',
    'popup.noNativeLanguages': 'No native languages added yet',
    'popup.removeLanguage': 'Remove {language}',
    'popup.chooseLanguageToAdd': 'Choose a language to add.',
    'popup.addNativeLanguage': 'Add at least one native language before starting.',
    'popup.saving': 'Saving…',
    'popup.settingsLoadFailed': 'Could not load your settings. Please try again.',
    'popup.settingsSaveFailed': 'Could not save your settings. Please try again.',
    'popup.backupStarted': 'Backup download started.',
    'popup.backupExportFailed': 'Could not export the backup. Please try again.',
    'popup.replaceConfirm': 'Replace all current immersion data with this backup? This cannot be undone.',
    'popup.backupTooLarge': 'This backup file is too large.',
    'popup.importing': 'Importing…',
    'popup.backupMerged': 'Backup merged successfully.',
    'popup.backupImported': 'Backup imported successfully.',
    'popup.backupImportFailed': 'Could not import this backup.',
    'popup.openVideo': 'Open a YouTube video to adjust its language.',
    'popup.openWatchPage': 'Open a YouTube watch page to adjust its language.',
    'popup.detectedLanguage': 'Detected: {language}. Change it if needed.',
    'popup.languageNotDetected': 'Language was not detected. Choose it to start tracking.',
    'popup.reloadYouTube': 'Reload the YouTube page, then reopen this popup.',
    'popup.chooseLanguageFirst': 'Choose a language first.',
    'popup.openVideoFirst': 'Open a YouTube video first.',
    'popup.trackingVideoAs': 'Tracking this video as {language}.',
    'popup.videoLanguageFailed': 'Could not change the video language.',
    'popup.updated': 'Updated {time}',
    'popup.loadFailed': 'Failed to load',
    'popup.dayTimeZone': 'Day: {timeZone} (UTC{offset})',
    'popup.timeZoneTitle': 'Immersion is grouped by this browser local time zone.',
    'popup.noImmersion': 'No immersion data yet. Start watching!',
    'popup.noData': 'No data yet',
    'popup.connectionUnavailable': 'Connection status unavailable',
    'popup.connectionCheckFailed': 'Could not check Google connection status.',
    'popup.googleConnected': 'Google connected',
    'popup.googleNotConnected': 'Google not connected',
    'popup.connecting': 'Connecting…',
    'popup.googleAuthorizationFailed': 'Google authorization was not completed.',
    'popup.googleConnectedMessage': 'Google connected. Only read-only YouTube video metadata is used when needed.',
    'popup.googleDisconnectedMessage': 'Google connection removed from this browser.',
    'popup.googleDisconnectFailed': 'Could not remove the Google connection. Please try again.',
    'details.title': 'Immersion details',
    'details.description': 'All saved immersion data, separated by language.',
    'details.refresh': 'Refresh',
    'details.today': 'Today',
    'details.week': 'This week',
    'details.month': 'This month',
    'details.totals': 'Immersion totals',
    'details.insights': 'Study insights',
    'details.dailyGoal': 'Daily goal',
    'details.minutes': 'Minutes',
    'details.saveGoal': 'Save goal',
    'details.activeDays': 'Active days',
    'details.last30': 'in the last 30 days',
    'details.weekComparison': 'Week comparison',
    'details.previous7': 'vs. previous 7 days',
    'details.averageDay': 'Average active day',
    'details.trend': '14-day trend',
    'details.dailyTime': 'Daily immersion time',
    'details.trendLabel': 'Immersion time in the last 14 days',
    'details.activity': 'Study activity',
    'details.last12': 'Last 12 weeks',
    'details.yearFilter': 'Filter by year',
    'details.monthFilter': 'Filter by month',
    'details.languageFilter': 'Filter activity by language',
    'details.allYears': 'All years',
    'details.allMonths': 'All months',
    'details.allLanguages': 'All languages',
    'details.heatmap': 'Study activity heatmap',
    'details.less': 'Less',
    'details.more': 'More',
    'details.timeByLanguage': 'Time by language',
    'details.loading': 'Loading…',
    'details.periodDescription': '{period}, separated by language.',
    'details.timeByLanguagePeriod': 'Time by language — {period}',
    'details.allHistory': 'All saved history',
    'details.noDataPeriod': 'No immersion data in this period.',
    'details.loadFailed': 'Could not load details.',
    'details.goalProgress': '{current} of {goal} ({progress}%)',
    'details.new': 'New',
    'details.firstActiveWeek': 'first active week',
    'details.noActivity': 'no activity yet',
    'details.moreThanPrevious': '{time} more than previous 7 days',
    'details.lessThanPrevious': '{time} less than previous 7 days',
  },
  pt: {
    'popup.subtitle': 'Seu tempo de idiomas, automaticamente', 'popup.interfaceLanguage': 'Idioma da interface', 'popup.useBrowserLanguage': 'Usar idioma do navegador', 'popup.settings': 'Configurações de idiomas nativos', 'popup.streak': 'Sequência atual', 'popup.days': 'dias', 'popup.personalize': 'PERSONALIZE SEU RASTREADOR', 'popup.close': 'Fechar configurações', 'popup.nativeTitle': 'Quais idiomas são nativos para você?', 'popup.nativeDescription': 'Murasaki registra seu tempo no YouTube em todos os outros idiomas detectados. Adicione todos os seus idiomas nativos.', 'popup.chooseNative': 'Escolha um idioma nativo', 'popup.add': 'Adicionar', 'popup.saveTracking': 'Salvar e começar a rastrear', 'popup.backup': 'Backup e restauração', 'popup.backupDescription': 'Exporte seus dados locais, substitua-os por um backup ou mescle outro backup.', 'popup.export': 'Exportar backup', 'popup.import': 'Importar e substituir', 'popup.merge': 'Mesclar backup', 'popup.google': 'Conexão com Google', 'popup.googleDescription': 'Opcional. Conecte o Google para que o Murasaki use os metadados somente leitura do YouTube quando não puder determinar localmente o idioma do vídeo.', 'popup.privacy': 'Seu histórico de imersão fica neste navegador. Não coletamos seu e-mail, senha ou atividade do YouTube, nem enviamos seus dados de tempo a um servidor.', 'popup.checking': 'Verificando conexão…', 'popup.connect': 'Conectar Google', 'popup.disconnect': 'Desconectar', 'popup.videoTitle': 'Idioma do vídeo atual', 'popup.videoPrompt': 'Abra um vídeo do YouTube para ajustar o idioma.', 'popup.videoSelect': 'Idioma do vídeo atual do YouTube', 'popup.apply': 'Aplicar', 'popup.totals': 'Totais de imersão', 'popup.today': 'hoje', 'popup.week': 'esta semana', 'popup.month': 'este mês', 'popup.todayImmersion': 'Imersão de hoje', 'popup.last7Days': 'Últimos 7 dias', 'popup.dashboard': 'Painel', 'popup.refresh': 'Atualizar painel', 'popup.selectLanguage': 'Selecione um idioma', 'popup.chooseVideoLanguage': 'Escolha o idioma do vídeo', 'popup.noNativeLanguages': 'Nenhum idioma nativo adicionado', 'popup.removeLanguage': 'Remover {language}', 'popup.chooseLanguageToAdd': 'Escolha um idioma para adicionar.', 'popup.addNativeLanguage': 'Adicione pelo menos um idioma nativo antes de começar.', 'popup.saving': 'Salvando…', 'popup.settingsLoadFailed': 'Não foi possível carregar suas configurações. Tente novamente.', 'popup.settingsSaveFailed': 'Não foi possível salvar suas configurações. Tente novamente.', 'popup.backupStarted': 'Download do backup iniciado.', 'popup.backupExportFailed': 'Não foi possível exportar o backup. Tente novamente.', 'popup.replaceConfirm': 'Substituir todos os dados atuais de imersão por este backup? Não será possível desfazer.', 'popup.backupTooLarge': 'Este arquivo de backup é grande demais.', 'popup.importing': 'Importando…', 'popup.backupMerged': 'Backup mesclado com sucesso.', 'popup.backupImported': 'Backup importado com sucesso.', 'popup.backupImportFailed': 'Não foi possível importar este backup.', 'popup.openVideo': 'Abra um vídeo do YouTube para ajustar o idioma.', 'popup.openWatchPage': 'Abra uma página de vídeo do YouTube para ajustar o idioma.', 'popup.detectedLanguage': 'Detectado: {language}. Altere se necessário.', 'popup.languageNotDetected': 'O idioma não foi detectado. Escolha-o para começar a rastrear.', 'popup.reloadYouTube': 'Recarregue a página do YouTube e abra este popup novamente.', 'popup.chooseLanguageFirst': 'Escolha um idioma primeiro.', 'popup.openVideoFirst': 'Abra um vídeo do YouTube primeiro.', 'popup.trackingVideoAs': 'Rastreando este vídeo como {language}.', 'popup.videoLanguageFailed': 'Não foi possível alterar o idioma do vídeo.', 'popup.updated': 'Atualizado {time}', 'popup.loadFailed': 'Falha ao carregar', 'popup.dayTimeZone': 'Dia: {timeZone} (UTC{offset})', 'popup.timeZoneTitle': 'A imersão é agrupada pelo fuso horário local deste navegador.', 'popup.noImmersion': 'Ainda não há dados de imersão. Comece a assistir!', 'popup.noData': 'Ainda não há dados', 'popup.connectionUnavailable': 'Status da conexão indisponível', 'popup.connectionCheckFailed': 'Não foi possível verificar a conexão com Google.', 'popup.googleConnected': 'Google conectado', 'popup.googleNotConnected': 'Google não conectado', 'popup.connecting': 'Conectando…', 'popup.googleAuthorizationFailed': 'A autorização do Google não foi concluída.', 'popup.googleConnectedMessage': 'Google conectado. Apenas metadados de vídeo somente leitura são usados quando necessário.', 'popup.googleDisconnectedMessage': 'Conexão com Google removida deste navegador.', 'popup.googleDisconnectFailed': 'Não foi possível remover a conexão com Google. Tente novamente.',
    'details.title': 'Detalhes da imersão', 'details.description': 'Todos os dados de imersão salvos, separados por idioma.', 'details.refresh': 'Atualizar', 'details.today': 'Hoje', 'details.week': 'Esta semana', 'details.month': 'Este mês', 'details.totals': 'Totais de imersão', 'details.insights': 'Insights de estudo', 'details.dailyGoal': 'Meta diária', 'details.minutes': 'Minutos', 'details.saveGoal': 'Salvar meta', 'details.activeDays': 'Dias ativos', 'details.last30': 'nos últimos 30 dias', 'details.weekComparison': 'Comparação semanal', 'details.previous7': 'vs. 7 dias anteriores', 'details.averageDay': 'Média por dia ativo', 'details.trend': 'Tendência de 14 dias', 'details.dailyTime': 'Tempo diário de imersão', 'details.trendLabel': 'Tempo de imersão nos últimos 14 dias', 'details.activity': 'Atividade de estudo', 'details.last12': 'Últimas 12 semanas', 'details.yearFilter': 'Filtrar por ano', 'details.monthFilter': 'Filtrar por mês', 'details.languageFilter': 'Filtrar atividade por idioma', 'details.allYears': 'Todos os anos', 'details.allMonths': 'Todos os meses', 'details.allLanguages': 'Todos os idiomas', 'details.heatmap': 'Mapa de calor da atividade de estudo', 'details.less': 'Menos', 'details.more': 'Mais', 'details.timeByLanguage': 'Tempo por idioma', 'details.loading': 'Carregando…', 'details.periodDescription': '{period}, separado por idioma.', 'details.timeByLanguagePeriod': 'Tempo por idioma — {period}', 'details.allHistory': 'Todo o histórico salvo', 'details.noDataPeriod': 'Não há dados de imersão neste período.', 'details.loadFailed': 'Não foi possível carregar os detalhes.', 'details.goalProgress': '{current} de {goal} ({progress}%)', 'details.new': 'Novo', 'details.firstActiveWeek': 'primeira semana ativa', 'details.noActivity': 'ainda não há atividade', 'details.moreThanPrevious': '{time} a mais que os 7 dias anteriores', 'details.lessThanPrevious': '{time} a menos que os 7 dias anteriores',
  },
};

Object.assign(TRANSLATIONS, {
  es: {
    "popup.subtitle": "Tu tiempo de idiomas, automáticamente", "popup.settings": "Configuración de idiomas nativos", "popup.streak": "Racha actual", "popup.days": "días", "popup.personalize": "PERSONALIZA TU SEGUIMIENTO", "popup.close": "Cerrar configuración", "popup.nativeTitle": "¿Qué idiomas son nativos para ti?", "popup.nativeDescription": "Murasaki registra tu tiempo de YouTube en todos los demás idiomas detectados. Añade todos tus idiomas nativos.", "popup.chooseNative": "Elige un idioma nativo", "popup.add": "Añadir", "popup.saveTracking": "Guardar y empezar a registrar", "popup.backup": "Copia de seguridad y restauración", "popup.backupDescription": "Exporta tus datos locales, sustitúyelos con una copia o fusiona otra copia.", "popup.export": "Exportar copia", "popup.import": "Importar y sustituir", "popup.merge": "Fusionar copia", "popup.google": "Conexión con Google", "popup.checking": "Comprobando conexión…", "popup.connect": "Conectar Google", "popup.disconnect": "Desconectar", "popup.videoTitle": "Idioma del vídeo actual", "popup.videoPrompt": "Abre un vídeo de YouTube para ajustar su idioma.", "popup.apply": "Aplicar", "popup.today": "hoy", "popup.week": "esta semana", "popup.month": "este mes", "popup.todayImmersion": "Inmersión de hoy", "popup.last7Days": "Últimos 7 días", "popup.dashboard": "Panel", "popup.refresh": "Actualizar panel", "details.title": "Detalles de inmersión", "details.description": "Todos los datos de inmersión guardados, separados por idioma.", "details.refresh": "Actualizar", "details.today": "Hoy", "details.week": "Esta semana", "details.month": "Este mes", "details.dailyGoal": "Meta diaria", "details.minutes": "Minutos", "details.saveGoal": "Guardar meta", "details.activeDays": "Días activos", "details.weekComparison": "Comparación semanal", "details.averageDay": "Media por día activo", "details.trend": "Tendencia de 14 días", "details.activity": "Actividad de estudio", "details.allYears": "Todos los años", "details.allMonths": "Todos los meses", "details.allLanguages": "Todos los idiomas", "details.less": "Menos", "details.more": "Más", "details.timeByLanguage": "Tiempo por idioma", "details.loading": "Cargando…"
  },
  ja: {
    "popup.subtitle": "あなたの言語学習時間を自動で記録", "popup.settings": "母語の設定", "popup.streak": "連続記録", "popup.days": "日", "popup.personalize": "トラッカーを設定", "popup.close": "設定を閉じる", "popup.nativeTitle": "あなたの母語は何ですか？", "popup.nativeDescription": "Murasaki は検出した母語以外の YouTube 視聴時間を記録します。すべての母語を追加してください。", "popup.chooseNative": "母語を選択", "popup.add": "追加", "popup.saveTracking": "保存して記録を開始", "popup.backup": "バックアップと復元", "popup.backupDescription": "ローカルデータをエクスポート、バックアップで置換、または別のバックアップと統合できます。", "popup.export": "バックアップをエクスポート", "popup.import": "インポートして置換", "popup.merge": "バックアップを統合", "popup.google": "Google 接続", "popup.checking": "接続を確認中…", "popup.connect": "Google に接続", "popup.disconnect": "切断", "popup.videoTitle": "現在の動画の言語", "popup.videoPrompt": "言語を調整するには YouTube 動画を開いてください。", "popup.apply": "適用", "popup.today": "今日", "popup.week": "今週", "popup.month": "今月", "popup.todayImmersion": "今日のイマージョン", "popup.last7Days": "過去 7 日間", "popup.dashboard": "ダッシュボード", "popup.refresh": "ダッシュボードを更新", "details.title": "イマージョンの詳細", "details.description": "保存されたすべてのイマージョンデータ（言語別）。", "details.refresh": "更新", "details.today": "今日", "details.week": "今週", "details.month": "今月", "details.dailyGoal": "1日の目標", "details.minutes": "分", "details.saveGoal": "目標を保存", "details.activeDays": "アクティブな日", "details.weekComparison": "週の比較", "details.averageDay": "アクティブな日の平均", "details.trend": "14日間の推移", "details.activity": "学習アクティビティ", "details.allYears": "すべての年", "details.allMonths": "すべての月", "details.allLanguages": "すべての言語", "details.less": "少ない", "details.more": "多い", "details.timeByLanguage": "言語別の時間", "details.loading": "読み込み中…"
  },
  ko: {
    "popup.subtitle": "언어 학습 시간을 자동으로 기록", "popup.settings": "모국어 설정", "popup.streak": "연속 기록", "popup.days": "일", "popup.personalize": "추적기 맞춤 설정", "popup.close": "설정 닫기", "popup.nativeTitle": "모국어는 무엇인가요?", "popup.nativeDescription": "Murasaki는 감지된 모국어 이외의 YouTube 시청 시간을 기록합니다. 모든 모국어를 추가하세요.", "popup.chooseNative": "모국어 선택", "popup.add": "추가", "popup.saveTracking": "저장하고 기록 시작", "popup.backup": "백업 및 복원", "popup.backupDescription": "로컬 데이터를 내보내거나 백업으로 교체하거나 다른 백업과 병합할 수 있습니다.", "popup.export": "백업 내보내기", "popup.import": "가져와서 교체", "popup.merge": "백업 병합", "popup.google": "Google 연결", "popup.checking": "연결 확인 중…", "popup.connect": "Google 연결", "popup.disconnect": "연결 해제", "popup.videoTitle": "현재 동영상 언어", "popup.videoPrompt": "언어를 조정하려면 YouTube 동영상을 여세요.", "popup.apply": "적용", "popup.today": "오늘", "popup.week": "이번 주", "popup.month": "이번 달", "popup.todayImmersion": "오늘의 몰입", "popup.last7Days": "최근 7일", "popup.dashboard": "대시보드", "popup.refresh": "대시보드 새로고침", "details.title": "몰입 상세 정보", "details.description": "저장된 모든 몰입 데이터가 언어별로 표시됩니다.", "details.refresh": "새로고침", "details.today": "오늘", "details.week": "이번 주", "details.month": "이번 달", "details.dailyGoal": "일일 목표", "details.minutes": "분", "details.saveGoal": "목표 저장", "details.activeDays": "활동 일수", "details.weekComparison": "주간 비교", "details.averageDay": "활동일 평균", "details.trend": "14일 추세", "details.activity": "학습 활동", "details.allYears": "모든 연도", "details.allMonths": "모든 월", "details.allLanguages": "모든 언어", "details.less": "적음", "details.more": "많음", "details.timeByLanguage": "언어별 시간", "details.loading": "불러오는 중…"
  },
  fr: { "popup.subtitle": "Votre temps de langues, automatiquement", "popup.settings": "Paramètres des langues maternelles", "popup.streak": "Série actuelle", "popup.days": "jours", "popup.close": "Fermer les paramètres", "popup.nativeTitle": "Quelles sont vos langues maternelles ?", "popup.chooseNative": "Choisir une langue maternelle", "popup.add": "Ajouter", "popup.saveTracking": "Enregistrer et commencer le suivi", "popup.backup": "Sauvegarde et restauration", "popup.export": "Exporter la sauvegarde", "popup.import": "Importer et remplacer", "popup.merge": "Fusionner la sauvegarde", "popup.google": "Connexion Google", "popup.connect": "Connecter Google", "popup.disconnect": "Déconnecter", "popup.videoTitle": "Langue de la vidéo actuelle", "popup.apply": "Appliquer", "popup.today": "aujourd’hui", "popup.week": "cette semaine", "popup.month": "ce mois-ci", "popup.todayImmersion": "Immersion du jour", "popup.last7Days": "7 derniers jours", "popup.dashboard": "Tableau de bord", "popup.refresh": "Actualiser le tableau de bord", "details.title": "Détails de l’immersion", "details.refresh": "Actualiser", "details.dailyGoal": "Objectif quotidien", "details.saveGoal": "Enregistrer l’objectif", "details.timeByLanguage": "Temps par langue", "details.loading": "Chargement…" },
  de: { "popup.subtitle": "Deine Sprachzeit, automatisch", "popup.settings": "Einstellungen für Muttersprachen", "popup.streak": "Aktuelle Serie", "popup.days": "Tage", "popup.close": "Einstellungen schließen", "popup.nativeTitle": "Welche Sprachen sind deine Muttersprachen?", "popup.chooseNative": "Muttersprache auswählen", "popup.add": "Hinzufügen", "popup.saveTracking": "Speichern und Aufzeichnung starten", "popup.backup": "Sicherung und Wiederherstellung", "popup.export": "Sicherung exportieren", "popup.import": "Importieren und ersetzen", "popup.merge": "Sicherung zusammenführen", "popup.google": "Google-Verbindung", "popup.connect": "Google verbinden", "popup.disconnect": "Trennen", "popup.videoTitle": "Sprache des aktuellen Videos", "popup.apply": "Anwenden", "popup.today": "heute", "popup.week": "diese Woche", "popup.month": "dieser Monat", "popup.todayImmersion": "Heutige Immersion", "popup.last7Days": "Letzte 7 Tage", "popup.dashboard": "Übersicht", "popup.refresh": "Übersicht aktualisieren", "details.title": "Immersionsdetails", "details.refresh": "Aktualisieren", "details.dailyGoal": "Tagesziel", "details.saveGoal": "Ziel speichern", "details.timeByLanguage": "Zeit nach Sprache", "details.loading": "Wird geladen…" },
  it: { "popup.subtitle": "Il tuo tempo di lingua, automaticamente", "popup.settings": "Impostazioni lingue native", "popup.streak": "Serie attuale", "popup.days": "giorni", "popup.close": "Chiudi impostazioni", "popup.nativeTitle": "Quali lingue sono native per te?", "popup.chooseNative": "Scegli una lingua nativa", "popup.add": "Aggiungi", "popup.saveTracking": "Salva e avvia il monitoraggio", "popup.backup": "Backup e ripristino", "popup.export": "Esporta backup", "popup.import": "Importa e sostituisci", "popup.merge": "Unisci backup", "popup.google": "Connessione Google", "popup.connect": "Connetti Google", "popup.disconnect": "Disconnetti", "popup.videoTitle": "Lingua del video corrente", "popup.apply": "Applica", "popup.today": "oggi", "popup.week": "questa settimana", "popup.month": "questo mese", "popup.todayImmersion": "Immersione di oggi", "popup.last7Days": "Ultimi 7 giorni", "popup.dashboard": "Pannello", "popup.refresh": "Aggiorna pannello", "details.title": "Dettagli immersione", "details.refresh": "Aggiorna", "details.dailyGoal": "Obiettivo giornaliero", "details.saveGoal": "Salva obiettivo", "details.timeByLanguage": "Tempo per lingua", "details.loading": "Caricamento…" },
  zh: { "popup.subtitle": "自动记录您的语言学习时间", "popup.settings": "母语设置", "popup.streak": "当前连续记录", "popup.days": "天", "popup.close": "关闭设置", "popup.nativeTitle": "您的母语是什么？", "popup.chooseNative": "选择母语", "popup.add": "添加", "popup.saveTracking": "保存并开始记录", "popup.backup": "备份与恢复", "popup.export": "导出备份", "popup.import": "导入并替换", "popup.merge": "合并备份", "popup.google": "Google 连接", "popup.connect": "连接 Google", "popup.disconnect": "断开连接", "popup.videoTitle": "当前视频语言", "popup.apply": "应用", "popup.today": "今天", "popup.week": "本周", "popup.month": "本月", "popup.todayImmersion": "今日沉浸", "popup.last7Days": "最近 7 天", "popup.dashboard": "仪表板", "popup.refresh": "刷新仪表板", "details.title": "沉浸详情", "details.refresh": "刷新", "details.dailyGoal": "每日目标", "details.saveGoal": "保存目标", "details.timeByLanguage": "按语言统计时间", "details.loading": "正在加载…" }
});

let activeLocale = DEFAULT_LOCALE;

export function initializeI18n(preferredLocale = 'auto') {
  const preferred = String(preferredLocale || 'auto').toLowerCase().split('-')[0];
  if (preferred !== 'auto' && TRANSLATIONS[preferred]) {
    activeLocale = preferred;
    document.documentElement.lang = activeLocale;
    return activeLocale;
  }

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  activeLocale =
    browserLanguages
      .map((language) => String(language || '').toLowerCase().split('-')[0])
      .find((language) => TRANSLATIONS[language]) || DEFAULT_LOCALE;
  document.documentElement.lang = activeLocale;
  return activeLocale;
}

export function t(key, values = {}) {
  const message = TRANSLATIONS[activeLocale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((element) => {
    element.title = t(element.dataset.i18nTitle);
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });
}

export function getLanguageDisplayName(code, fallbackName = code) {
  const normalizedCode = String(code || "").toLowerCase().split("-")[0];
  const fallback = fallbackName || code;
  try {
    const displayName = new Intl.DisplayNames([activeLocale], { type: "language" }).of(normalizedCode);
    return displayName && displayName.toLowerCase() !== normalizedCode
      ? displayName
      : fallback;
  } catch {
    return fallback;
  }
}
