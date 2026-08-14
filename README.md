# InstaCheck

🌐 **Acesse o site:** https://theinstacheck.vercel.app/

O InstaCheck é um site estático e responsivo para celular, tablet e computador. Ele analisa o ZIP exportado pelo Instagram e mantém um histórico local das suas conexões.

A interface está disponível em português, espanhol e inglês. Na primeira visita, o idioma é escolhido automaticamente pelas preferências do navegador; depois, a pessoa pode trocá-lo no seletor do cabeçalho. A escolha fica salva somente no aparelho.

Antes da importação, um botão de ajuda flutuante e uma chamada junto ao seletor levam diretamente ao tutorial passo a passo. Depois de importar, o username pode ser corrigido pela tela de resultados sem perder o histórico ou o progresso. Se a conta corrigida já existir, os históricos são unidos.

Quando já existem snapshots no aparelho, a página inicial mostra o botão “Acessar meu histórico”. Basta selecionar uma das contas salvas para reabrir imediatamente os resultados do snapshot mais recente, sem importar outro ZIP.

## Como usar

1. No Instagram, abra a Central de Contas e crie uma exportação para o dispositivo.
2. Selecione somente “Seguidores e seguindo”, período “Todo o período” e formato JSON.
3. Informe seu `@username` no InstaCheck e selecione o ZIP baixado, sem descompactar.
4. Navegue entre contas que não seguem de volta, pessoas que você não segue, seguimentos mútuos e as listas extras encontradas. Quando o Instagram fornece a informação, cada perfil mostra a data em que você o seguiu e/ou em que ele começou a seguir você.
5. Em uma data futura, importe um ZIP novo usando o mesmo username. O InstaCheck mostrará quem deixou de seguir e quem começou a seguir desde o snapshot anterior.
6. Pesquise, abra perfis, copie usernames, exporte CSV ou marque o progresso de revisão.

Todas as listas podem ser ordenadas alfabeticamente (A–Z ou Z–A), das conexões mais recentes para as mais antigas ou no sentido inverso. Perfis sem data disponível ficam no final da ordenação por data.

Também é possível selecionar manualmente `following.json`, todos os `followers_*.json` e, quando existirem, `pending_follow_requests.json`, `recent_follow_requests.json` e `recently_unfollowed_profiles.json`.

Os arquivos são lidos e processados somente no dispositivo. Nenhum dado é enviado para servidores e o InstaCheck não pede login nem automatiza unfollows ou cancelamentos de pedidos.

## Histórico e backup

Cada username tem seu próprio histórico de snapshots no navegador. As listas de seguidores e seguindo são guardadas no IndexedDB do aparelho e o progresso de revisão fica no armazenamento local.

Esse histórico não sincroniza automaticamente entre dispositivos e pode desaparecer se os dados do navegador forem apagados. Use “Baixar backup” antes de trocar de dispositivo e “Restaurar backup” para recuperar ou mover o histórico.

O backup é um arquivo JSON próprio do InstaCheck. Ele pode ser restaurado pelo botão “Restaurar backup JSON” ou selecionado diretamente na área principal de importação; o sistema reconhece o formato automaticamente e abre o snapshot restaurado mais recente. Cada item do histórico também é clicável e reabre os resultados completos daquela data, comparados com o snapshot imediatamente anterior quando houver.

## Executar localmente

Você pode abrir o `index.html` diretamente no navegador. Se preferir, sirva a pasta com qualquer servidor HTTP estático local.

## Estrutura

```text
├── index.html
├── style.css
├── app.js
├── i18n.js
├── fonts/
│   ├── Inter-Latin.woff2
│   ├── Poppins-SemiBold-Latin.woff2
│   ├── Poppins-Bold-Latin.woff2
│   ├── Poppins-ExtraBold-Latin.woff2
│   ├── Inter-OFL.txt
│   └── Poppins-OFL.txt
├── vendor/
│   ├── fflate.js
│   └── fflate.LICENSE
└── README.md
```

O leitor de ZIP usa o [fflate](https://www.npmjs.com/package/fflate), distribuído sob licença MIT e incluído localmente para que a página não dependa de um CDN.

As fontes Inter e Poppins também estão incluídas localmente, com suas respectivas licenças SIL Open Font License na pasta `fonts/`. Assim, tipografia e funcionamento permanecem disponíveis sem chamadas externas.
