# InstaCheck

**InstaCheck — Análise de conexões do Instagram** é um site estático e responsivo para celular, tablet e computador. Ele analisa seguidores, seguindo, conexões mútuas e mudanças ao longo do tempo usando o ZIP original exportado pelo Instagram.
🌐 **Acesse o site:** https://theinstacheck.vercel.app/

O InstaCheck é um site estático e responsivo para celular, tablet e computador. Ele analisa o ZIP exportado pelo Instagram e mantém um histórico local das suas conexões.

Não há login, senha ou envio das listas para um servidor: a leitura do ZIP, as comparações e o histórico acontecem localmente no navegador. A interface está disponível em português, espanhol e inglês, detecta o idioma do navegador na primeira visita e mantém um seletor manual no cabeçalho.

## Como usar

1. Informe o `@username` usado para identificar o histórico local.
2. No Instagram, abra a Central de Contas e crie uma exportação para o dispositivo.
3. Selecione “Seguidores e seguindo”, período “Todo o período”, formato JSON e confirme o e-mail que receberá o aviso.
4. Aguarde a notificação/e-mail, volte à área de exportação e toque em “Baixar”.
5. Encontre o arquivo na pasta Downloads e selecione o ZIP original no InstaCheck, sem descompactar.
6. Explore seguidores, seguindo, conexões mútuas, quem não segue de volta e as listas extras encontradas.
7. Importe outra exportação futuramente com o mesmo username para ver novos seguidores, quem deixou de seguir, saldo de seguidores e variação de contas seguidas.

O tutorial completo e o FAQ ficam acessíveis pelo botão de ajuda. O modo demonstração usa dados fictícios, mostra todas as áreas da análise e não grava nada no histórico.

Também é possível importar manualmente `following.json`, todos os `followers_*.json` e, quando existirem, `pending_follow_requests.json`, `recent_follow_requests.json` e `recently_unfollowed_profiles.json`.

## Recursos

- Pesquisa, filtros e ordenação alfabética, por conexões mais recentes ou mais antigas.
- Datas de início da conexão quando elas estão presentes no arquivo do Instagram.
- Histórico separado por conta e por análise salva.
- Abertura e exclusão individual de análises, com confirmação.
- Edição do username sem perder o histórico.
- Backup JSON restaurável no próprio InstaCheck.
- Exportação CSV e cópia dos usernames visíveis.
- Imagem de resultado para Story ou Post, contendo apenas estatísticas, com botões separados para baixar ou compartilhar.
- Rotas estáticas por hash para início, tutorial, histórico e análise, compatíveis com hospedagem sem configuração de servidor.

O histórico não sincroniza automaticamente entre dispositivos e pode desaparecer se os dados do navegador forem apagados. Baixe um backup antes de trocar de dispositivo ou limpar os dados do navegador.

## Executar localmente

Abra o `index.html` diretamente ou sirva a pasta com qualquer servidor HTTP estático. Não há backend, banco de dados remoto nem variáveis de ambiente.

## Estrutura

```text
├── index.html
├── style.css
├── app.js
├── i18n.js
├── og-image.png
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

O leitor de ZIP usa o [fflate](https://www.npmjs.com/package/fflate), incluído localmente sob licença MIT. Inter e Poppins também são servidas localmente com suas licenças SIL Open Font License.

<<<<<<< HEAD
## Publicação

O projeto está pronto para hospedagem estática, inclusive na Vercel. As imagens sociais usam um caminho relativo, portanto o domínio pode mudar sem exigir alterações no conteúdo compartilhável.

Feito por [@viniohc](https://www.instagram.com/viniohc/).
=======
As fontes Inter e Poppins também estão incluídas localmente, com suas respectivas licenças SIL Open Font License na pasta `fonts/`. Assim, tipografia e funcionamento permanecem disponíveis sem chamadas externas.
>>>>>>> 79f63cc075aab1ed3e6ec6164ceb7bd3fb22598d
