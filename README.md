# InstaCheck

**Análise de conexões do Instagram, local e privada.**

O InstaCheck ajuda a entender seguidores, contas seguidas, conexões mútuas e mudanças ao longo do tempo usando os arquivos exportados pelo próprio Instagram.

Todo o processamento acontece no navegador. O projeto não solicita login ou senha, não envia as listas para servidores e não automatiza ações na conta.

## Principais recursos

- Importação direta do ZIP original do Instagram, sem descompactar.
- Importação manual dos arquivos JSON compatíveis.
- Listas de seguidores, seguindo e conexões mútuas.
- Identificação de contas que não seguem de volta.
- Comparação entre análises para encontrar novos seguidores e quem deixou de seguir.
- Saldo de seguidores e variação de contas seguidas.
- Datas das conexões quando essa informação estiver disponível na exportação.
- Histórico local separado por conta e por análise.
- Abertura e exclusão individual de análises salvas.
- Edição do username sem perder histórico, comparações ou progresso.
- Backup JSON restaurável no próprio InstaCheck.
- Pesquisa, filtros e ordenação personalizada.
- Cópia dos usernames visíveis e exportação CSV.
- Imagens de resultado para Story e Post, sem usernames analisados.
- Botões separados para baixar a imagem ou abrir o compartilhamento do dispositivo.
- Modo demonstração com dados fictícios e sem gravação no histórico.
- Tutorial completo e FAQ dentro do site.
- Interface responsiva para celular, tablet e computador.
- Português, espanhol e inglês, com detecção automática do idioma do navegador.

## Privacidade

O InstaCheck foi desenvolvido para funcionar localmente:

- O ZIP e os JSONs são processados apenas no dispositivo.
- Nenhuma lista é enviada para um backend.
- Não é necessário informar senha ou autenticar a conta do Instagram.
- O histórico fica no IndexedDB do navegador.
- O progresso de revisão e algumas preferências ficam no armazenamento local.
- As imagens compartilháveis exibem somente números e `@viniohc`; usernames analisados não são incluídos.

Depois da importação, o ZIP pode ser apagado do dispositivo. As análises salvas continuam disponíveis enquanto os dados do navegador forem preservados.

> O histórico não é sincronizado automaticamente entre aparelhos. Faça um backup antes de trocar de dispositivo, limpar o navegador ou usar outro perfil do navegador.

## Como obter o arquivo do Instagram

1. Abra o Instagram e acesse o seu perfil.
2. Abra o menu e entre na **Central de Contas**.
3. Acesse **Suas informações e permissões**.
4. Selecione **Exportar suas informações** e depois **Criar exportação**.
5. Escolha o perfil do Instagram.
6. Selecione a exportação para o dispositivo.
7. Em informações específicas, escolha **Seguidores e seguindo**.
8. Use o período **Todo o período**.
9. Escolha o formato **JSON**.
10. Confirme o e-mail no qual deseja receber o aviso de que o ZIP está pronto.
11. Solicite a exportação. Não é necessário permanecer esperando na tela.
12. Quando receber a notificação ou o e-mail, volte à exportação e toque em **Baixar**.
13. Encontre o ZIP na pasta **Downloads** e selecione-o no InstaCheck sem descompactar.

No Android e em aparelhos Samsung, o arquivo normalmente aparece em **Meus Arquivos → Downloads**.

## Arquivos reconhecidos

Para uma análise básica, a exportação precisa conter:

```text
followers_1.json
followers_2.json ...
following.json
```

O InstaCheck também utiliza estes arquivos quando estiverem disponíveis:

```text
pending_follow_requests.json
recent_follow_requests.json
recently_unfollowed_profiles.json
```

Os nomes podem variar levemente conforme a versão da exportação. O leitor aceita as variações conhecidas de seguidores, seguindo, pedidos pendentes e perfis removidos recentemente.

## Como usar o InstaCheck

1. Informe o `@username` da conta que está sendo analisada.
2. Selecione o ZIP original ou os JSONs manualmente.
3. Aguarde o processamento local.
4. Navegue pelas categorias disponíveis.
5. Use pesquisa, filtros e ordenação para encontrar contas.
6. Abra os perfis no Instagram ou marque o progresso de revisão.
7. Volte futuramente e importe uma nova exportação usando o mesmo username.
8. Consulte o histórico para comparar análises anteriores.

O username serve apenas como identificador local. Ele pode ser corrigido depois da importação sem apagar os dados daquela conta.

## Categorias analisadas

- **Seguidores:** contas que seguem o perfil.
- **Seguindo:** contas seguidas pelo perfil.
- **Conexões mútuas:** contas que se seguem mutuamente.
- **Não seguem de volta:** contas seguidas que não aparecem entre os seguidores.
- **Você não segue:** seguidores que não são seguidos de volta.
- **Novos seguidores:** contas que apareceram desde a análise anterior.
- **Deixaram de seguir:** contas que estavam na análise anterior e desapareceram da lista de seguidores.
- **Pedidos pendentes e recentes:** exibidos quando os respectivos arquivos existirem.

## Datas e ordenação

Quando o Instagram fornece timestamps, o InstaCheck mostra a data em que:

- a pessoa começou a seguir você;
- você começou a seguir a pessoa;
- uma mudança foi detectada na comparação.

As listas podem ser ordenadas por:

- ordem alfabética A–Z;
- ordem alfabética Z–A;
- conexões mais recentes;
- conexões mais antigas.

Perfis sem uma data disponível ficam depois dos perfis que possuem data ao usar a ordenação temporal.

## Histórico e comparações

Cada importação válida cria uma análise salva para o username informado. O histórico permite:

- escolher uma conta;
- consultar todas as análises daquela conta;
- abrir novamente os resultados de uma data específica;
- comparar uma análise com a anterior;
- excluir somente uma análise;
- remover automaticamente a conta do histórico quando sua última análise for excluída.

Antes de excluir qualquer análise, o sistema solicita confirmação.

## Backup e restauração

O botão **Baixar backup** gera um JSON próprio do InstaCheck contendo as análises locais. Esse arquivo pode ser importado novamente pelo botão **Restaurar backup** ou selecionado na área principal de importação.

O backup é diferente do ZIP do Instagram:

- **ZIP do Instagram:** cria uma nova análise a partir dos dados exportados.
- **Backup do InstaCheck:** restaura contas e análises que já haviam sido salvas no navegador.

Guarde o backup em um local seguro, pois ele contém as listas utilizadas nas análises.

## Modo demonstração

O modo demonstração permite conhecer o sistema sem baixar arquivos do Instagram. Ele apresenta dados claramente fictícios, várias categorias, duas análises de exemplo e uma comparação histórica.

Nada utilizado na demonstração é salvo no histórico.

## Compartilhamento de resultados

É possível gerar uma imagem nos formatos:

- **Story:** 1080 × 1920.
- **Post:** 1080 × 1080.

A imagem contém somente estatísticas gerais, a identidade do InstaCheck e `@viniohc`. Nenhum username encontrado nos arquivos é incluído.

O usuário pode baixar a imagem diretamente ou abrir o compartilhamento nativo do dispositivo. Quando o compartilhamento nativo não estiver disponível, o navegador baixa o arquivo.

## Idiomas

Na primeira visita, o idioma é escolhido a partir das preferências do navegador. Também é possível trocar manualmente pelo seletor do cabeçalho.

Idiomas disponíveis:

- Português do Brasil (`pt-BR`).
- Espanhol (`es`).
- Inglês (`en`).

A preferência fica salva somente no dispositivo.

## Rotas

O projeto usa rotas por hash, compatíveis com hospedagem estática e com os botões voltar e avançar do navegador:

```text
#/            Página inicial
#/ajuda       Tutorial e FAQ
#/historico   Histórico local
#/analise     Análise atual
```

A rota de análise depende dos dados carregados na sessão. Ao acessá-la sem uma análise disponível, o sistema retorna para a página inicial.

## Tecnologias

- HTML5.
- CSS responsivo.
- JavaScript sem framework.
- IndexedDB para análises e contas.
- Web Storage para preferências e progresso.
- Canvas API para gerar imagens compartilháveis.
- Web Share API quando disponível.
- [fflate](https://www.npmjs.com/package/fflate) para leitura local dos ZIPs.
- Inter e Poppins servidas localmente.

Não há backend, banco de dados remoto, serviço de autenticação ou rastreamento externo.

## Executar localmente

O projeto não possui etapa de instalação ou build. É possível abrir `index.html` diretamente no navegador.

Para testar por um servidor HTTP local, use uma das opções abaixo.

Com Python:

```bash
python -m http.server 4173
```

Com Node.js:

```bash
npx serve .
```

Depois, abra o endereço exibido pelo comando.

## Estrutura do projeto

```text
├── index.html              # Estrutura, metadados e interface
├── style.css               # Identidade visual e responsividade
├── app.js                  # Importação, análises, histórico e compartilhamento
├── i18n.js                 # Traduções e detecção de idioma
├── favicon.svg             # Ícone vetorial do site
├── og-image.png            # Imagem de compartilhamento social
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

## Publicação

Por ser totalmente estático, o InstaCheck pode ser publicado na Vercel, GitHub Pages, Cloudflare Pages, Netlify ou qualquer hospedagem de arquivos estáticos.

Na Vercel, não é necessário configurar framework, comando de build, backend ou variáveis de ambiente. Basta publicar a raiz do repositório.

As referências à imagem Open Graph usam um caminho relativo, permitindo trocar o domínio sem alterar o conteúdo compartilhável.

## Limitações

- O InstaCheck depende do formato dos arquivos fornecidos pelo Instagram, que pode mudar.
- Algumas datas podem não existir na exportação.
- Uma conta que desapareceu entre duas análises é tratada como mudança detectada entre aquelas exportações; o Instagram não fornece necessariamente o instante exato do unfollow.
- Navegação privada, bloqueio de armazenamento ou limpeza dos dados do navegador podem impedir a persistência do histórico.
- O histórico não sincroniza automaticamente entre dispositivos.

## Aviso

O InstaCheck é um projeto independente e não possui vínculo, parceria ou afiliação com Instagram ou Meta. Instagram é uma marca de seus respectivos proprietários.

O projeto não executa unfollows, não cancela solicitações e não realiza ações automáticas. Todas as decisões e ações permanecem sob controle do usuário.

## Autor

Feito por [@viniohc](https://www.instagram.com/viniohc/).
