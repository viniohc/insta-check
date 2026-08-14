(() => {
  const STORAGE_KEY = "instacheck.language.v1";
  const SUPPORTED = ["pt-BR", "es", "en"];

  const dictionaries = {
    "pt-BR": {
      meta: { title: "InstaCheck — Quem não segue você de volta", description: "Compare seus arquivos do Instagram e descubra quem não segue você de volta, com processamento local e privado." },
      brand: { home: "InstaCheck — início" }, language: { label: "Idioma" },
      privacy: { local: "100% local e privado", zipTitle: "O ZIP é lido somente neste dispositivo", zipText: "Salvamos apenas snapshots das listas. Depois, você pode apagar o ZIP do celular.", manual: "O InstaCheck não automatiza ações no Instagram. Você decide quais perfis abrir e resolve cada ação manualmente." },
      hero: { eyebrow: "Seu histórico, sob seu controle", title: "Descubra mudanças nas suas conexões.", description: "Selecione o ZIP do Instagram sem descompactar. O InstaCheck guarda snapshots neste aparelho e mostra quem deixou de seguir você no futuro." },
      account: { label: "Qual é o seu @username?", placeholder: "seu_username", help: "Usamos o username somente para separar o histórico de cada conta neste dispositivo.", saved: "Contas salvas", chip: "@{username} · {count} {snapshots}" },
      upload: { step: "Passo 2", title: "Selecione o ZIP do Instagram", subtitle: "Não precisa descompactar nem procurar arquivos no celular", button: "Escolher ZIP do Instagram", manual: "Também aceitamos os JSONs manualmente: <strong>following.json</strong> e <strong>followers_*.json</strong>.", processing: "Processando localmente…", opening: "Abrindo arquivo…" },
      guide: { eyebrow: "Tutorial para celular", title: "Como baixar o ZIP certo", description: "Siga esta configuração para ter uma comparação confiável e um arquivo pequeno.", metaHelp: "Ajuda oficial da Meta ↗", step1Title: "Abra a Central de Contas", step1Text: "Instagram → Perfil → menu ☰ → <strong>Central de Contas</strong>.", step2Title: "Crie uma exportação", step2Text: "<strong>Suas informações e permissões</strong> → <strong>Exportar suas informações</strong> → <strong>Criar exportação</strong>.", step3Title: "Escolha o perfil", step3Text: "Selecione sua conta do Instagram e toque em <strong>Exportar para dispositivo</strong>.", step4Title: "Use estas opções exatas", step4Text: "<strong>Informações específicas:</strong> Seguidores e seguindo<br><strong>Período:</strong> Todo o período<br><strong>Formato:</strong> JSON", step5Title: "Baixe e selecione o ZIP", step5Text: "Quando o Instagram avisar que está pronto, baixe o arquivo e volte ao InstaCheck. Não descompacte.", requiredFiles: "Arquivos obrigatórios dentro do ZIP", optionalFiles: "Insights extras, quando disponíveis" },
      actions: { backup: "Baixar backup", restore: "Restaurar backup", newImport: "Importar novo ZIP", copy: "Copiar visíveis", export: "Exportar CSV", clearProgress: "Limpar progresso", openProfile: "Abrir perfil ↗", copied: "Copiados!", exported: "Exportado!" },
      results: { complete: "Análise concluída", title: "Sua lista está pronta.", initialSummary: "Confira os perfis e avance no seu ritmo.", processedFiles: "Arquivos processados", summary: "Resumo da análise", accountBadge: "@{username} · histórico local", snapshotSaved: "Snapshot de @{username} salvo neste aparelho.", noStorage: "Análise concluída; o histórico não pôde ser salvo neste navegador.", ignoredFiles: "{count} {files} foram ignorados.", archiveChip: "{name} · ZIP processado localmente" },
      history: { comparison: "Comparação histórica", firstTitle: "Primeiro snapshot salvo", firstDescription: "Na próxima importação desta conta, mostraremos claramente quem deixou de seguir você.", lost: "deixaram de seguir", new: "novos seguidores", viewLost: "Ver quem deixou de seguir", unavailableTitle: "Histórico indisponível neste navegador", unavailableDescription: "Saia do modo privado ou permita o armazenamento local para comparar futuras importações.", nobodyLeft: "Ninguém deixou de seguir você", comparisonWith: "Comparação com o snapshot de {date}.", automatic: "Snapshots de @{username} são comparados automaticamente.", unavailable: "O histórico não está disponível neste navegador.", empty: "Nenhum snapshot salvo ainda.", latest: "Snapshot mais recente · {date}", source: "Importação do Instagram", counts: "{followers} seguidores · {following} seguindo", savedHere: "Salvo neste aparelho", title: "Histórico de snapshots", subtitle: "Cada nova importação é comparada com a anterior.", deviceNote: "Este histórico não acompanha você para outro celular automaticamente. Use o backup antes de trocar de aparelho ou limpar o navegador.", lostTitle: "{count} {people} {verb} de seguir você" },
      metrics: { followers: "Seguidores", following: "Seguindo", mutuals: "Seguimento mútuo", nonFollowers: "Não seguem de volta" },
      progress: { label: "Seu progresso", initial: "0 de 0 perfis revisados", aria: "Perfis marcados como removidos", count: "{reviewed} de {total} {items}" },
      list: { explore: "Explorar conexões", connectionType: "Tipo de conexão", search: "Buscar por username", filterProfiles: "Filtrar perfis", zeroProfiles: "0 perfis", visibleCount: "{count} {profiles}", comparisonWith: "Comparação com {date}." },
      filters: { all: "Todos", pending: "Pendentes", reviewed: "Já removidos" },
      empty: { allGood: "Tudo certo por aqui", noMatch: "Nenhum perfil corresponde a este filtro.", noUsername: "Nenhum username encontrado", tryAnother: "Tente buscar por outro nome ou limpe o campo de busca.", nonePending: "Nenhum perfil pendente", noneReviewed: "Nada marcado ainda" },
      footer: { privacy: "Privacidade por padrão. Seus dados são seus." },
      datasets: {
        lostFollowers: { label: "Deixaram de seguir", title: "Deixaram de seguir você", description: "Pessoas que estavam no snapshot anterior e não aparecem mais entre seus seguidores.", emptyTitle: "Ninguém deixou de seguir", emptyDescription: "Nenhum seguidor desapareceu desde o snapshot anterior.", since: "Seguia você desde {date}", detected: "Presente no snapshot de {date}" },
        newFollowers: { label: "Novos seguidores", title: "Novos seguidores", description: "Pessoas que passaram a aparecer desde o snapshot anterior.", emptyTitle: "Nenhum seguidor novo", emptyDescription: "Nenhuma conta nova apareceu desde o snapshot anterior.", since: "Começou a seguir você em {date}", detected: "Detectado em {date}" },
        nonFollowers: { label: "Não seguem", title: "Não seguem você de volta", description: "Contas que você segue e que não seguem você de volta.", emptyTitle: "Tudo certo por aqui", emptyDescription: "Todas as contas que você segue também seguem você de volta.", action: "Já removi", actionAria: "Marcar @{username} como removido", reviewed: "Marcado como removido", reviewedFilter: "Já removidos", progress: "Perfis revisados", reset: "Limpar o progresso desta lista? Os perfis voltarão a aparecer como pendentes.", pendingEmpty: "Você já marcou todos os perfis desta lista como removidos.", reviewedEmpty: "Os perfis que você marcar como removidos aparecerão aqui.", followedAt: "Você seguiu em {date} · Não segue você de volta", status: "Não segue você de volta" },
        followersOnly: { label: "Você não segue", title: "Você não segue de volta", description: "Pessoas que seguem você, mas que você não segue.", emptyTitle: "Você segue todos de volta", emptyDescription: "Não há seguidores fora da sua lista de contas seguidas.", since: "Segue você desde {date}", status: "Segue você" },
        mutuals: { label: "Mútuos", title: "Seguimento mútuo", description: "Contas em que o seguimento acontece nos dois sentidos.", emptyTitle: "Nenhum seguimento mútuo", emptyDescription: "Nenhuma conta aparece nas duas listas importadas.", status: "Vocês se seguem", followedAt: "Você seguiu em {date}", followedYouAt: "Segue você desde {date}" },
        pendingRequests: { label: "Pedidos pendentes", title: "Pedidos para seguir pendentes", description: "Pedidos enviados a contas privadas que ainda aguardam uma resposta.", emptyTitle: "Nenhum pedido pendente", emptyDescription: "O arquivo importado não contém solicitações aguardando resposta.", action: "Já cancelei", actionAria: "Marcar o pedido para @{username} como cancelado", reviewed: "Marcado como cancelado", reviewedFilter: "Já cancelados", progress: "Pedidos revisados", reset: "Limpar o progresso dos pedidos? Todos voltarão a aparecer como pendentes.", pendingEmpty: "Você já marcou todos os pedidos desta lista como cancelados.", reviewedEmpty: "Os pedidos que você marcar como cancelados aparecerão aqui.", date: "Pedido enviado em {date}", status: "Aguardando resposta" },
        recentRequests: { label: "Pedidos recentes", title: "Pedidos para seguir recentes", description: "Histórico de pedidos enviados recentemente; eles podem já ter sido confirmados ou removidos.", emptyTitle: "Nenhum pedido recente", emptyDescription: "O arquivo importado não contém solicitações recentes.", date: "Registrado em {date}", status: "Pedido recente" },
        recentlyUnfollowed: { label: "Deixei de seguir", title: "Perfis deixados de seguir recentemente", description: "Contas que você deixou de seguir e que ainda aparecem no histórico do Instagram.", emptyTitle: "Nenhum perfil recente", emptyDescription: "O arquivo importado não contém perfis deixados de seguir recentemente.", date: "Você deixou de seguir em {date}", status: "Deixou de seguir recentemente" }
      },
      messages: { selectFiles: "Selecione o ZIP baixado do Instagram ou os arquivos JSON.", missingFiles: "Não encontramos {files} dentro da seleção. No Instagram, exporte “Seguidores e seguindo”, use formato JSON e escolha “Todo o período”.", processError: "Não foi possível processar o arquivo. Confira se é o ZIP ou JSON exportado pelo Instagram.", oneZip: "Selecione somente um ZIP por vez. Não misture o ZIP com arquivos JSON.", zipTooLarge: "Este ZIP é muito grande para processar com segurança no celular. Exporte somente “Seguidores e seguindo”, em JSON e com mídia em baixa qualidade.", zipOrJson: "Use o ZIP baixado do Instagram ou apenas arquivos com extensão .json.", zipReader: "O leitor de ZIP não foi carregado. Reabra a página e tente novamente.", zipNoFiles: "O ZIP não contém os arquivos de seguidores em JSON.", zipOpen: "Não conseguimos abrir este ZIP. Baixe novamente pelo Instagram usando o formato JSON e tente sem descompactar.", invalidJson: "O arquivo “{name}” não contém um JSON válido.", username: "Informe seu @username antes de selecionar o ZIP. Use somente letras, números, ponto e sublinhado.", historyUnavailable: "O histórico local não está disponível neste navegador.", noBackup: "Ainda não há snapshots para incluir no backup.", backupCreated: "Backup criado. Guarde este arquivo antes de trocar de aparelho.", backupLarge: "Este backup é grande demais para ser restaurado.", storageUnavailable: "O armazenamento local não está disponível neste navegador.", invalidBackup: "Este arquivo não é um backup válido do InstaCheck.", emptyBackup: "O backup não contém snapshots válidos.", restored: "{count} {snapshots} restaurados.", restoreError: "Não foi possível restaurar este backup.", clearProgress: "Limpar o progresso desta lista?" },
      words: { snapshot: "snapshot", snapshots: "snapshots", file: "arquivo", files: "arquivos", profile: "perfil visível", profiles: "perfis visíveis", reviewedItem: "perfil revisado", reviewedItems: "perfis revisados", requestReviewed: "pedido revisado", requestsReviewed: "pedidos revisados", person: "pessoa", people: "pessoas", left: "deixou", leftPlural: "deixaram" },
      csv: { username: "username", profile: "perfil", followedAt: "data_voce_seguiu", followedYouAt: "data_seguiu_voce", recordDate: "data_do_registro" }
    },
    es: {},
    en: {}
  };

  dictionaries.es = JSON.parse(JSON.stringify(dictionaries["pt-BR"]));
  dictionaries.en = JSON.parse(JSON.stringify(dictionaries["pt-BR"]));

  const es = dictionaries.es;
  Object.assign(es, {
    meta: { title: "InstaCheck — Quién no te sigue", description: "Compara tus archivos de Instagram y descubre quién no te sigue, con procesamiento local y privado." },
    brand: { home: "InstaCheck — inicio" }, language: { label: "Idioma" },
    privacy: { local: "100% local y privado", zipTitle: "El ZIP se lee solo en este dispositivo", zipText: "Solo guardamos instantáneas de las listas. Después puedes borrar el ZIP del teléfono.", manual: "InstaCheck no automatiza acciones en Instagram. Tú decides qué perfiles abrir y realizas cada acción manualmente." },
    hero: { eyebrow: "Tu historial, bajo tu control", title: "Descubre cambios en tus conexiones.", description: "Selecciona el ZIP de Instagram sin descomprimirlo. InstaCheck guarda instantáneas en este dispositivo y te muestra quién dejó de seguirte." },
    account: { label: "¿Cuál es tu @usuario?", placeholder: "tu_usuario", help: "Usamos el usuario solo para separar el historial de cada cuenta en este dispositivo.", saved: "Cuentas guardadas", chip: "@{username} · {count} {snapshots}" },
    upload: { step: "Paso 2", title: "Selecciona el ZIP de Instagram", subtitle: "No necesitas descomprimirlo ni buscar archivos en el teléfono", button: "Elegir ZIP de Instagram", manual: "También aceptamos los JSON manualmente: <strong>following.json</strong> y <strong>followers_*.json</strong>.", processing: "Procesando localmente…", opening: "Abriendo archivo…" },
    guide: { eyebrow: "Tutorial para móvil", title: "Cómo descargar el ZIP correcto", description: "Usa esta configuración para obtener una comparación fiable y un archivo pequeño.", metaHelp: "Ayuda oficial de Meta ↗", step1Title: "Abre el Centro de cuentas", step1Text: "Instagram → Perfil → menú ☰ → <strong>Centro de cuentas</strong>.", step2Title: "Crea una exportación", step2Text: "<strong>Tu información y permisos</strong> → <strong>Exportar tu información</strong> → <strong>Crear exportación</strong>.", step3Title: "Elige el perfil", step3Text: "Selecciona tu cuenta de Instagram y toca <strong>Exportar al dispositivo</strong>.", step4Title: "Usa estas opciones exactas", step4Text: "<strong>Información específica:</strong> Seguidores y seguidos<br><strong>Periodo:</strong> Todo el tiempo<br><strong>Formato:</strong> JSON", step5Title: "Descarga y selecciona el ZIP", step5Text: "Cuando Instagram avise que está listo, descarga el archivo y vuelve a InstaCheck. No lo descomprimas.", requiredFiles: "Archivos obligatorios dentro del ZIP", optionalFiles: "Datos extra, cuando estén disponibles" },
    actions: { backup: "Descargar copia", restore: "Restaurar copia", newImport: "Importar otro ZIP", copy: "Copiar visibles", export: "Exportar CSV", clearProgress: "Borrar progreso", openProfile: "Abrir perfil ↗", copied: "¡Copiados!", exported: "¡Exportado!" },
    results: { complete: "Análisis completado", title: "Tu lista está lista.", initialSummary: "Revisa los perfiles a tu ritmo.", processedFiles: "Archivos procesados", summary: "Resumen del análisis", accountBadge: "@{username} · historial local", snapshotSaved: "Instantánea de @{username} guardada en este dispositivo.", noStorage: "Análisis completado; no se pudo guardar el historial en este navegador.", ignoredFiles: "Se ignoraron {count} {files}.", archiveChip: "{name} · ZIP procesado localmente" },
    history: { comparison: "Comparación histórica", firstTitle: "Primera instantánea guardada", firstDescription: "En la próxima importación de esta cuenta mostraremos claramente quién dejó de seguirte.", lost: "dejaron de seguirte", new: "nuevos seguidores", viewLost: "Ver quién dejó de seguirte", unavailableTitle: "Historial no disponible en este navegador", unavailableDescription: "Sal del modo privado o permite el almacenamiento local para comparar futuras importaciones.", nobodyLeft: "Nadie dejó de seguirte", comparisonWith: "Comparación con la instantánea del {date}.", automatic: "Las instantáneas de @{username} se comparan automáticamente.", unavailable: "El historial no está disponible en este navegador.", empty: "Todavía no hay instantáneas guardadas.", latest: "Instantánea más reciente · {date}", source: "Importación de Instagram", counts: "{followers} seguidores · {following} seguidos", savedHere: "Guardado en este dispositivo", title: "Historial de instantáneas", subtitle: "Cada nueva importación se compara con la anterior.", deviceNote: "Este historial no pasa automáticamente a otro teléfono. Descarga una copia antes de cambiar de dispositivo o borrar los datos del navegador.", lostTitle: "{count} {people} {verb} de seguirte" },
    metrics: { followers: "Seguidores", following: "Seguidos", mutuals: "Seguimiento mutuo", nonFollowers: "No te siguen" },
    progress: { label: "Tu progreso", initial: "0 de 0 perfiles revisados", aria: "Perfiles marcados como eliminados", count: "{reviewed} de {total} {items}" },
    list: { explore: "Explorar conexiones", connectionType: "Tipo de conexión", search: "Buscar por usuario", filterProfiles: "Filtrar perfiles", zeroProfiles: "0 perfiles", visibleCount: "{count} {profiles}", comparisonWith: "Comparación con {date}." },
    filters: { all: "Todos", pending: "Pendientes", reviewed: "Ya eliminados" },
    empty: { allGood: "Todo bien por aquí", noMatch: "Ningún perfil coincide con este filtro.", noUsername: "No se encontró ningún usuario", tryAnother: "Prueba otro nombre o borra la búsqueda.", nonePending: "No hay perfiles pendientes", noneReviewed: "Todavía no hay nada marcado" },
    footer: { privacy: "Privacidad por defecto. Tus datos son tuyos." },
    words: { snapshot: "instantánea", snapshots: "instantáneas", file: "archivo", files: "archivos", profile: "perfil visible", profiles: "perfiles visibles", reviewedItem: "perfil revisado", reviewedItems: "perfiles revisados", requestReviewed: "solicitud revisada", requestsReviewed: "solicitudes revisadas", person: "persona", people: "personas", left: "dejó", leftPlural: "dejaron" },
    csv: { username: "usuario", profile: "perfil", followedAt: "fecha_en_que_seguí", followedYouAt: "fecha_en_que_me_siguió", recordDate: "fecha_del_registro" }
  });

  const en = dictionaries.en;
  Object.assign(en, {
    meta: { title: "InstaCheck — Who doesn't follow you back", description: "Compare your Instagram files and find out who doesn't follow you back, with local and private processing." },
    brand: { home: "InstaCheck — home" }, language: { label: "Language" },
    privacy: { local: "100% local and private", zipTitle: "The ZIP is read only on this device", zipText: "We only save list snapshots. You can delete the ZIP from your phone afterward.", manual: "InstaCheck does not automate actions on Instagram. You choose which profiles to open and perform each action manually." },
    hero: { eyebrow: "Your history, under your control", title: "Discover changes in your connections.", description: "Select the Instagram ZIP without extracting it. InstaCheck saves snapshots on this device and shows who unfollowed you later." },
    account: { label: "What is your @username?", placeholder: "your_username", help: "We use the username only to separate each account's history on this device.", saved: "Saved accounts", chip: "@{username} · {count} {snapshots}" },
    upload: { step: "Step 2", title: "Select the Instagram ZIP", subtitle: "No need to extract it or find files on your phone", button: "Choose Instagram ZIP", manual: "You can also select the JSON files manually: <strong>following.json</strong> and <strong>followers_*.json</strong>.", processing: "Processing locally…", opening: "Opening file…" },
    guide: { eyebrow: "Mobile tutorial", title: "How to download the right ZIP", description: "Use these settings for a reliable comparison and a smaller file.", metaHelp: "Official Meta help ↗", step1Title: "Open Accounts Center", step1Text: "Instagram → Profile → menu ☰ → <strong>Accounts Center</strong>.", step2Title: "Create an export", step2Text: "<strong>Your information and permissions</strong> → <strong>Export your information</strong> → <strong>Create export</strong>.", step3Title: "Choose the profile", step3Text: "Select your Instagram account and tap <strong>Export to device</strong>.", step4Title: "Use these exact settings", step4Text: "<strong>Specific information:</strong> Followers and following<br><strong>Date range:</strong> All time<br><strong>Format:</strong> JSON", step5Title: "Download and select the ZIP", step5Text: "When Instagram says it is ready, download the file and return to InstaCheck. Do not extract it.", requiredFiles: "Required files inside the ZIP", optionalFiles: "Extra insights, when available" },
    actions: { backup: "Download backup", restore: "Restore backup", newImport: "Import another ZIP", copy: "Copy visible", export: "Export CSV", clearProgress: "Clear progress", openProfile: "Open profile ↗", copied: "Copied!", exported: "Exported!" },
    results: { complete: "Analysis complete", title: "Your list is ready.", initialSummary: "Review profiles at your own pace.", processedFiles: "Processed files", summary: "Analysis summary", accountBadge: "@{username} · local history", snapshotSaved: "Snapshot for @{username} saved on this device.", noStorage: "Analysis complete; history could not be saved in this browser.", ignoredFiles: "{count} {files} were ignored.", archiveChip: "{name} · ZIP processed locally" },
    history: { comparison: "History comparison", firstTitle: "First snapshot saved", firstDescription: "On this account's next import, we will clearly show who unfollowed you.", lost: "unfollowed you", new: "new followers", viewLost: "See who unfollowed you", unavailableTitle: "History unavailable in this browser", unavailableDescription: "Leave private mode or allow local storage to compare future imports.", nobodyLeft: "No one unfollowed you", comparisonWith: "Compared with the snapshot from {date}.", automatic: "Snapshots for @{username} are compared automatically.", unavailable: "History is not available in this browser.", empty: "No snapshots saved yet.", latest: "Latest snapshot · {date}", source: "Instagram import", counts: "{followers} followers · {following} following", savedHere: "Saved on this device", title: "Snapshot history", subtitle: "Each new import is compared with the previous one.", deviceNote: "This history does not automatically move to another phone. Download a backup before changing devices or clearing browser data.", lostTitle: "{count} {people} {verb} you" },
    metrics: { followers: "Followers", following: "Following", mutuals: "Mutual follows", nonFollowers: "Don't follow back" },
    progress: { label: "Your progress", initial: "0 of 0 profiles reviewed", aria: "Profiles marked as removed", count: "{reviewed} of {total} {items}" },
    list: { explore: "Explore connections", connectionType: "Connection type", search: "Search by username", filterProfiles: "Filter profiles", zeroProfiles: "0 profiles", visibleCount: "{count} {profiles}", comparisonWith: "Compared with {date}." },
    filters: { all: "All", pending: "Pending", reviewed: "Already removed" },
    empty: { allGood: "All good here", noMatch: "No profiles match this filter.", noUsername: "No username found", tryAnother: "Try another name or clear the search.", nonePending: "No pending profiles", noneReviewed: "Nothing marked yet" },
    footer: { privacy: "Privacy by default. Your data is yours." },
    words: { snapshot: "snapshot", snapshots: "snapshots", file: "file", files: "files", profile: "visible profile", profiles: "visible profiles", reviewedItem: "profile reviewed", reviewedItems: "profiles reviewed", requestReviewed: "request reviewed", requestsReviewed: "requests reviewed", person: "person", people: "people", left: "unfollowed", leftPlural: "unfollowed" },
    csv: { username: "username", profile: "profile", followedAt: "date_you_followed", followedYouAt: "date_they_followed_you", recordDate: "record_date" }
  });

  Object.assign(es.datasets, {
    lostFollowers: { label: "Dejaron de seguirte", title: "Dejaron de seguirte", description: "Personas que estaban en la instantánea anterior y ya no aparecen entre tus seguidores.", emptyTitle: "Nadie dejó de seguirte", emptyDescription: "Ningún seguidor desapareció desde la instantánea anterior.", since: "Te seguía desde el {date}", detected: "Presente en la instantánea del {date}" },
    newFollowers: { label: "Nuevos seguidores", title: "Nuevos seguidores", description: "Personas que aparecieron desde la instantánea anterior.", emptyTitle: "No hay seguidores nuevos", emptyDescription: "No apareció ninguna cuenta nueva desde la instantánea anterior.", since: "Empezó a seguirte el {date}", detected: "Detectado el {date}" },
    nonFollowers: { label: "No te siguen", title: "No te siguen de vuelta", description: "Cuentas que sigues y no te siguen de vuelta.", emptyTitle: "Todo bien por aquí", emptyDescription: "Todas las cuentas que sigues también te siguen.", action: "Ya eliminé", actionAria: "Marcar a @{username} como eliminado", reviewed: "Marcado como eliminado", reviewedFilter: "Ya eliminados", progress: "Perfiles revisados", reset: "¿Borrar el progreso de esta lista? Los perfiles volverán a aparecer como pendientes.", pendingEmpty: "Ya marcaste todos los perfiles de esta lista como eliminados.", reviewedEmpty: "Los perfiles que marques como eliminados aparecerán aquí.", followedAt: "Seguiste el {date} · No te sigue", status: "No te sigue de vuelta" },
    followersOnly: { label: "No los sigues", title: "No los sigues de vuelta", description: "Personas que te siguen pero que tú no sigues.", emptyTitle: "Sigues a todos", emptyDescription: "No hay seguidores fuera de tu lista de cuentas seguidas.", since: "Te sigue desde el {date}", status: "Te sigue" },
    mutuals: { label: "Mutuos", title: "Seguimiento mutuo", description: "Cuentas en las que el seguimiento ocurre en ambos sentidos.", emptyTitle: "No hay seguimientos mutuos", emptyDescription: "Ninguna cuenta aparece en ambas listas importadas.", status: "Se siguen mutuamente", followedAt: "Seguiste el {date}", followedYouAt: "Te sigue desde el {date}" },
    pendingRequests: { label: "Solicitudes pendientes", title: "Solicitudes para seguir pendientes", description: "Solicitudes enviadas a cuentas privadas que esperan respuesta.", emptyTitle: "No hay solicitudes pendientes", emptyDescription: "El archivo importado no contiene solicitudes pendientes.", action: "Ya cancelé", actionAria: "Marcar la solicitud a @{username} como cancelada", reviewed: "Marcada como cancelada", reviewedFilter: "Ya canceladas", progress: "Solicitudes revisadas", reset: "¿Borrar el progreso de las solicitudes? Todas volverán a aparecer como pendientes.", pendingEmpty: "Ya marcaste todas las solicitudes como canceladas.", reviewedEmpty: "Las solicitudes que marques como canceladas aparecerán aquí.", date: "Solicitud enviada el {date}", status: "Esperando respuesta" },
    recentRequests: { label: "Solicitudes recientes", title: "Solicitudes para seguir recientes", description: "Historial de solicitudes enviadas recientemente; pueden haber sido aceptadas o eliminadas.", emptyTitle: "No hay solicitudes recientes", emptyDescription: "El archivo importado no contiene solicitudes recientes.", date: "Registrada el {date}", status: "Solicitud reciente" },
    recentlyUnfollowed: { label: "Dejé de seguir", title: "Perfiles que dejaste de seguir recientemente", description: "Cuentas que dejaste de seguir y aún aparecen en el historial de Instagram.", emptyTitle: "No hay perfiles recientes", emptyDescription: "El archivo importado no contiene perfiles que dejaste de seguir recientemente.", date: "Dejaste de seguir el {date}", status: "Dejaste de seguir recientemente" }
  });

  Object.assign(en.datasets, {
    lostFollowers: { label: "Unfollowed you", title: "People who unfollowed you", description: "People who were in the previous snapshot and no longer appear among your followers.", emptyTitle: "No one unfollowed you", emptyDescription: "No followers disappeared since the previous snapshot.", since: "Had followed you since {date}", detected: "Present in the {date} snapshot" },
    newFollowers: { label: "New followers", title: "New followers", description: "People who appeared since the previous snapshot.", emptyTitle: "No new followers", emptyDescription: "No new accounts appeared since the previous snapshot.", since: "Started following you on {date}", detected: "Detected on {date}" },
    nonFollowers: { label: "Don't follow back", title: "Don't follow you back", description: "Accounts you follow that do not follow you back.", emptyTitle: "All good here", emptyDescription: "Every account you follow also follows you.", action: "Already removed", actionAria: "Mark @{username} as removed", reviewed: "Marked as removed", reviewedFilter: "Already removed", progress: "Profiles reviewed", reset: "Clear progress for this list? Profiles will appear as pending again.", pendingEmpty: "You have marked every profile in this list as removed.", reviewedEmpty: "Profiles you mark as removed will appear here.", followedAt: "You followed on {date} · Doesn't follow you back", status: "Doesn't follow you back" },
    followersOnly: { label: "You don't follow", title: "You don't follow back", description: "People who follow you but you do not follow.", emptyTitle: "You follow everyone back", emptyDescription: "There are no followers outside your following list.", since: "Has followed you since {date}", status: "Follows you" },
    mutuals: { label: "Mutuals", title: "Mutual follows", description: "Accounts where following goes both ways.", emptyTitle: "No mutual follows", emptyDescription: "No account appears in both imported lists.", status: "You follow each other", followedAt: "You followed on {date}", followedYouAt: "Has followed you since {date}" },
    pendingRequests: { label: "Pending requests", title: "Pending follow requests", description: "Requests sent to private accounts that are still awaiting a response.", emptyTitle: "No pending requests", emptyDescription: "The imported file contains no requests awaiting a response.", action: "Already canceled", actionAria: "Mark the request to @{username} as canceled", reviewed: "Marked as canceled", reviewedFilter: "Already canceled", progress: "Requests reviewed", reset: "Clear request progress? All requests will appear as pending again.", pendingEmpty: "You have marked every request as canceled.", reviewedEmpty: "Requests you mark as canceled will appear here.", date: "Request sent on {date}", status: "Awaiting response" },
    recentRequests: { label: "Recent requests", title: "Recent follow requests", description: "History of recently sent requests; they may already have been accepted or removed.", emptyTitle: "No recent requests", emptyDescription: "The imported file contains no recent requests.", date: "Recorded on {date}", status: "Recent request" },
    recentlyUnfollowed: { label: "You unfollowed", title: "Recently unfollowed profiles", description: "Accounts you unfollowed that still appear in Instagram history.", emptyTitle: "No recent profiles", emptyDescription: "The imported file contains no recently unfollowed profiles.", date: "You unfollowed on {date}", status: "Recently unfollowed" }
  });

  Object.assign(es.messages, { selectFiles: "Selecciona el ZIP descargado de Instagram o los archivos JSON.", missingFiles: "No encontramos {files} en la selección. En Instagram, exporta “Seguidores y seguidos”, usa formato JSON y elige “Todo el tiempo”.", processError: "No se pudo procesar el archivo. Comprueba que sea el ZIP o JSON exportado por Instagram.", oneZip: "Selecciona un solo ZIP. No mezcles el ZIP con archivos JSON.", zipTooLarge: "Este ZIP es demasiado grande para procesarlo de forma segura en el teléfono. Exporta solo “Seguidores y seguidos” en JSON.", zipOrJson: "Usa el ZIP descargado de Instagram o solo archivos .json.", zipReader: "No se cargó el lector de ZIP. Vuelve a abrir la página e inténtalo de nuevo.", zipNoFiles: "El ZIP no contiene los archivos JSON de seguidores.", zipOpen: "No pudimos abrir este ZIP. Descárgalo de nuevo desde Instagram en formato JSON y no lo descomprimas.", invalidJson: "El archivo “{name}” no contiene un JSON válido.", username: "Escribe tu @usuario antes de seleccionar el ZIP. Usa solo letras, números, puntos y guiones bajos.", historyUnavailable: "El historial local no está disponible en este navegador.", noBackup: "Todavía no hay instantáneas para incluir en la copia.", backupCreated: "Copia creada. Guarda este archivo antes de cambiar de dispositivo.", backupLarge: "Esta copia es demasiado grande para restaurarla.", storageUnavailable: "El almacenamiento local no está disponible en este navegador.", invalidBackup: "Este archivo no es una copia válida de InstaCheck.", emptyBackup: "La copia no contiene instantáneas válidas.", restored: "Se restauraron {count} {snapshots}.", restoreError: "No se pudo restaurar esta copia." });
  Object.assign(en.messages, { selectFiles: "Select the ZIP downloaded from Instagram or the JSON files.", missingFiles: "We could not find {files} in the selection. In Instagram, export “Followers and following”, use JSON format, and choose “All time”.", processError: "The file could not be processed. Make sure it is the ZIP or JSON exported by Instagram.", oneZip: "Select only one ZIP at a time. Do not mix the ZIP with JSON files.", zipTooLarge: "This ZIP is too large to process safely on a phone. Export only “Followers and following” in JSON format.", zipOrJson: "Use the ZIP downloaded from Instagram or only .json files.", zipReader: "The ZIP reader did not load. Reopen the page and try again.", zipNoFiles: "The ZIP does not contain the follower JSON files.", zipOpen: "We could not open this ZIP. Download it again from Instagram in JSON format and do not extract it.", invalidJson: "The file “{name}” does not contain valid JSON.", username: "Enter your @username before selecting the ZIP. Use only letters, numbers, periods, and underscores.", historyUnavailable: "Local history is not available in this browser.", noBackup: "There are no snapshots to include in a backup yet.", backupCreated: "Backup created. Keep this file before changing devices.", backupLarge: "This backup is too large to restore.", storageUnavailable: "Local storage is not available in this browser.", invalidBackup: "This file is not a valid InstaCheck backup.", emptyBackup: "The backup contains no valid snapshots.", restored: "Restored {count} {snapshots}.", restoreError: "This backup could not be restored." });

  Object.assign(dictionaries["pt-BR"].results, { nonFollowersCount: "{count} contas não seguem você de volta.", allFollowBack: "Todas as contas analisadas seguem você de volta." });
  Object.assign(es.results, { nonFollowersCount: "{count} cuentas no te siguen de vuelta.", allFollowBack: "Todas las cuentas analizadas te siguen de vuelta." });
  Object.assign(en.results, { nonFollowersCount: "{count} accounts don't follow you back.", allFollowBack: "Every analyzed account follows you back." });
  dictionaries["pt-BR"].results.accountPlaceholder = "@conta · histórico local";
  es.results.accountPlaceholder = "@cuenta · historial local";
  en.results.accountPlaceholder = "@account · local history";

  Object.assign(dictionaries["pt-BR"].actions, { openProfileAria: "Abrir perfil de @{username} no Instagram" });
  Object.assign(es.actions, { openProfileAria: "Abrir el perfil de @{username} en Instagram" });
  Object.assign(en.actions, { openProfileAria: "Open @{username}'s profile on Instagram" });

  Object.assign(dictionaries["pt-BR"].messages, { jsonFiles: "{count} arquivos JSON", restoredOne: "1 snapshot restaurado.", restoredMany: "{count} snapshots restaurados." });
  Object.assign(es.messages, { jsonFiles: "{count} archivos JSON", restoredOne: "1 instantánea restaurada.", restoredMany: "{count} instantáneas restauradas." });
  Object.assign(en.messages, { jsonFiles: "{count} JSON files", restoredOne: "1 snapshot restored.", restoredMany: "{count} snapshots restored." });

  dictionaries["pt-BR"].history.restoredBackup = "Backup restaurado";
  es.history.restoredBackup = "Copia restaurada";
  en.history.restoredBackup = "Restored backup";
  dictionaries["pt-BR"].words.and = "e";
  es.words.and = "y";
  en.words.and = "and";

  Object.assign(dictionaries["pt-BR"].privacy, { zipText: "Salvamos apenas snapshots das listas. Depois, você pode apagar o ZIP do dispositivo." });
  Object.assign(es.privacy, { zipText: "Solo guardamos instantáneas de las listas. Después puedes borrar el ZIP del dispositivo." });
  Object.assign(en.privacy, { zipText: "We only save list snapshots. You can delete the ZIP from your device afterward." });

  Object.assign(dictionaries["pt-BR"].upload, { subtitle: "Não precisa descompactar nem procurar arquivos no dispositivo" });
  Object.assign(es.upload, { subtitle: "No necesitas descomprimirlo ni buscar archivos en el dispositivo" });
  Object.assign(en.upload, { subtitle: "No need to extract it or find files on your device" });

  Object.assign(dictionaries["pt-BR"].guide, { eyebrow: "Tutorial passo a passo", quickAction: "Não sabe como obter o arquivo? Veja o tutorial", floatingAction: "Como obter o ZIP?" });
  Object.assign(es.guide, { eyebrow: "Tutorial paso a paso", quickAction: "¿No sabes cómo obtener el archivo? Mira el tutorial", floatingAction: "¿Cómo obtener el ZIP?" });
  Object.assign(en.guide, { eyebrow: "Step-by-step tutorial", quickAction: "Not sure how to get the file? View the tutorial", floatingAction: "How do I get the ZIP?" });

  Object.assign(dictionaries["pt-BR"].history, { deviceNote: "Este histórico não acompanha você automaticamente. Baixe o backup JSON e depois use “Restaurar backup JSON” neste ou em outro dispositivo." });
  Object.assign(es.history, { deviceNote: "Este historial no pasa automáticamente a otro dispositivo. Descarga la copia JSON y después usa “Restaurar copia JSON”." });
  Object.assign(en.history, { deviceNote: "This history does not move automatically. Download the JSON backup and later use “Restore JSON backup” on this or another device." });

  Object.assign(dictionaries["pt-BR"].messages, { zipTooLarge: "Este ZIP é muito grande para processar com segurança neste dispositivo. Exporte somente “Seguidores e seguindo”, em JSON e com mídia em baixa qualidade." });
  Object.assign(es.messages, { zipTooLarge: "Este ZIP es demasiado grande para procesarlo de forma segura en este dispositivo. Exporta solo “Seguidores y seguidos” en JSON." });
  Object.assign(en.messages, { zipTooLarge: "This ZIP is too large to process safely on this device. Export only “Followers and following” in JSON format." });

  Object.assign(dictionaries["pt-BR"].account, { edit: "Editar username", editEyebrow: "Conta do histórico", editTitle: "Editar username", editHelp: "Corrija o username sem perder snapshots, progresso ou comparações desta conta.", newUsername: "Novo @username", mergeNote: "Se já existir um histórico com esse username, os snapshots serão unidos sem duplicar.", renamed: "Username alterado para @{username}.", renameError: "Não foi possível alterar o username." });
  Object.assign(es.account, { edit: "Editar usuario", editEyebrow: "Cuenta del historial", editTitle: "Editar usuario", editHelp: "Corrige el usuario sin perder las instantáneas, el progreso ni las comparaciones de esta cuenta.", newUsername: "Nuevo @usuario", mergeNote: "Si ya existe un historial con ese usuario, las instantáneas se unirán sin duplicarse.", renamed: "Usuario cambiado a @{username}.", renameError: "No se pudo cambiar el usuario." });
  Object.assign(en.account, { edit: "Edit username", editEyebrow: "History account", editTitle: "Edit username", editHelp: "Correct the username without losing this account's snapshots, progress, or comparisons.", newUsername: "New @username", mergeNote: "If a history already exists for that username, snapshots will be merged without duplicates.", renamed: "Username changed to @{username}.", renameError: "The username could not be changed." });

  Object.assign(dictionaries["pt-BR"].actions, { close: "Fechar", cancel: "Cancelar", save: "Salvar username" });
  Object.assign(es.actions, { close: "Cerrar", cancel: "Cancelar", save: "Guardar usuario" });
  Object.assign(en.actions, { close: "Close", cancel: "Cancel", save: "Save username" });

  Object.assign(dictionaries["pt-BR"].actions, { backup: "Baixar backup JSON", restore: "Restaurar backup JSON" });
  Object.assign(es.actions, { backup: "Descargar copia JSON", restore: "Restaurar copia JSON" });
  Object.assign(en.actions, { backup: "Download JSON backup", restore: "Restore JSON backup" });

  Object.assign(dictionaries["pt-BR"].results, { snapshotViewing: "Visualizando o snapshot de {date}. Nenhum snapshot novo foi criado.", snapshotChip: "Snapshot de {date} · {source}" });
  Object.assign(es.results, { snapshotViewing: "Viendo la instantánea del {date}. No se creó una instantánea nueva.", snapshotChip: "Instantánea del {date} · {source}" });
  Object.assign(en.results, { snapshotViewing: "Viewing the snapshot from {date}. No new snapshot was created.", snapshotChip: "Snapshot from {date} · {source}" });

  Object.assign(dictionaries["pt-BR"].history, { openSnapshot: "Abrir resultados do snapshot de {date}", viewResults: "Ver resultados", viewing: "Visualizando" });
  Object.assign(es.history, { openSnapshot: "Abrir los resultados de la instantánea del {date}", viewResults: "Ver resultados", viewing: "Viendo" });
  Object.assign(en.history, { openSnapshot: "Open snapshot results from {date}", viewResults: "View results", viewing: "Viewing" });

  Object.assign(dictionaries["pt-BR"].guide, { step4Text: "<strong>Informações específicas:</strong> Seguidores e seguindo<br><strong>Período:</strong> Todo o período<br><strong>Formato:</strong> JSON<br><strong>E-mail de notificação:</strong> confirme em qual endereço você quer receber o aviso de que o ZIP está pronto." });
  Object.assign(es.guide, { step4Text: "<strong>Información específica:</strong> Seguidores y seguidos<br><strong>Periodo:</strong> Todo el tiempo<br><strong>Formato:</strong> JSON<br><strong>Correo de notificación:</strong> confirma en qué dirección quieres recibir el aviso de que el ZIP está listo." });
  Object.assign(en.guide, { step4Text: "<strong>Specific information:</strong> Followers and following<br><strong>Date range:</strong> All time<br><strong>Format:</strong> JSON<br><strong>Notification email:</strong> confirm the address where you want to receive the message that the ZIP is ready." });

  Object.assign(dictionaries["pt-BR"].actions, { openHistory: "Acessar meu histórico" });
  Object.assign(es.actions, { openHistory: "Acceder a mi historial" });
  Object.assign(en.actions, { openHistory: "Open my history" });
  Object.assign(dictionaries["pt-BR"].history, { openLatestHelp: "Abrir os resultados do último snapshot desta conta" });
  Object.assign(es.history, { openLatestHelp: "Abrir los resultados de la última instantánea de esta cuenta" });
  Object.assign(en.history, { openLatestHelp: "Open the latest snapshot results for this account" });
  Object.assign(dictionaries["pt-BR"].messages, { noAccountHistory: "Selecione uma conta salva para acessar o histórico." });
  Object.assign(es.messages, { noAccountHistory: "Selecciona una cuenta guardada para acceder al historial." });
  Object.assign(en.messages, { noAccountHistory: "Select a saved account to open its history." });

  dictionaries["pt-BR"].sort = { label: "Ordenar", aria: "Ordenar conexões", alphabetical: "Alfabética: A–Z", reverseAlphabetical: "Alfabética: Z–A", newest: "Mais recentes", oldest: "Mais antigas" };
  es.sort = { label: "Ordenar", aria: "Ordenar conexiones", alphabetical: "Alfabético: A–Z", reverseAlphabetical: "Alfabético: Z–A", newest: "Más recientes", oldest: "Más antiguas" };
  en.sort = { label: "Sort", aria: "Sort connections", alphabetical: "Alphabetical: A–Z", reverseAlphabetical: "Alphabetical: Z–A", newest: "Newest", oldest: "Oldest" };

  function getPath(object, path) {
    return path.split(".").reduce((value, key) => value?.[key], object);
  }

  function interpolate(template, values = {}) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  }

  function detectLanguage() {
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const candidate of candidates) {
      const normalized = String(candidate || "").toLowerCase();
      if (normalized.startsWith("es")) return "es";
      if (normalized.startsWith("en")) return "en";
      if (normalized.startsWith("pt")) return "pt-BR";
    }
    return "pt-BR";
  }

  function readSavedLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.includes(saved) ? saved : null;
    } catch {
      return null;
    }
  }

  let currentLanguage = readSavedLanguage() || detectLanguage();
  const languageNames = { "pt-BR": "Português", es: "Español", en: "English" };

  function t(key, values) {
    const translated = getPath(dictionaries[currentLanguage], key);
    const fallback = getPath(dictionaries["pt-BR"], key);
    return interpolate(translated ?? fallback ?? key, values);
  }

  function applyTranslations(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    root.querySelectorAll("[data-i18n-html]").forEach((element) => { element.innerHTML = t(element.dataset.i18nHtml); });
    ["aria-label", "placeholder", "content"].forEach((attribute) => {
      const datasetKey = `i18n${attribute.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("")}`;
      root.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => { element.setAttribute(attribute, t(element.dataset[datasetKey])); });
    });
    document.documentElement.lang = currentLanguage;
    document.title = t("meta.title");
    const select = document.querySelector("#languageSelect");
    if (select) select.value = currentLanguage;
    updateLanguagePicker();
  }

  function updateLanguagePicker() {
    const current = document.querySelector("#languageCurrent");
    if (current) current.textContent = languageNames[currentLanguage];
    document.querySelectorAll("#languageMenu [data-language]").forEach((button) => {
      const isSelected = button.dataset.language === currentLanguage;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-selected", String(isSelected));
    });
  }

  function closeLanguagePicker(returnFocus = false) {
    const button = document.querySelector("#languageButton");
    const menu = document.querySelector("#languageMenu");
    if (!button || !menu) return;
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (returnFocus) button.focus();
  }

  function bindLanguagePicker() {
    const button = document.querySelector("#languageButton");
    const menu = document.querySelector("#languageMenu");
    if (!button || !menu) return;
    const options = [...menu.querySelectorAll("[data-language]")];
    button.addEventListener("click", () => {
      const shouldOpen = menu.hidden;
      menu.hidden = !shouldOpen;
      button.setAttribute("aria-expanded", String(shouldOpen));
      if (shouldOpen) (options.find((option) => option.dataset.language === currentLanguage) || options[0])?.focus();
    });
    options.forEach((option) => option.addEventListener("click", () => {
      setLanguage(option.dataset.language);
      closeLanguagePicker(true);
    }));
    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLanguagePicker(true);
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const currentIndex = options.indexOf(document.activeElement);
      const nextIndex = event.key === "Home" ? 0
        : event.key === "End" ? options.length - 1
          : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options[nextIndex]?.focus();
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".language-picker")) closeLanguagePicker();
    });
  }

  function setLanguage(language, persist = true) {
    if (!SUPPORTED.includes(language)) return;
    currentLanguage = language;
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, language); } catch { /* A troca continua funcionando sem persistência. */ }
    }
    applyTranslations();
    window.dispatchEvent(new CustomEvent("instacheck:languagechange", { detail: { language } }));
  }

  window.InstaCheckI18n = {
    t,
    applyTranslations,
    setLanguage,
    getLanguage: () => currentLanguage,
    getLocale: () => currentLanguage === "pt-BR" ? "pt-BR" : currentLanguage
  };

  applyTranslations();
  bindLanguagePicker();
  document.querySelector("#languageSelect")?.addEventListener("change", (event) => setLanguage(event.target.value));
})();
