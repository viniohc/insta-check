# InstaCheck

[![Tests](https://github.com/viniohc/insta-check/actions/workflows/tests.yml/badge.svg)](https://github.com/viniohc/insta-check/actions/workflows/tests.yml)

**English:** [Read this README in English](README.en.md)

O InstaCheck analisa seguidores, contas seguidas, conexões mútuas e diferenças entre exportações do Instagram. Selecione o ZIP ou os arquivos JSON exportados; a leitura e a análise acontecem no navegador, sem pedir login ou senha do Instagram e sem enviar as listas para um backend.

- **Aplicação:** [Abrir InstaCheck](https://theinstacheck.vercel.app/)
- **Desenvolvido por:** [@viniohc no Instagram](https://www.instagram.com/viniohc/)
- **Endereço local** (após iniciar o servidor): [http://127.0.0.1:4173/#/](http://127.0.0.1:4173/#/)

## Sumário

- [Como começar](#como-comecar)
- [Recursos principais](#recursos-principais)
- [Privacidade e armazenamento](#privacidade-e-armazenamento)
- [Como obter a exportação](#como-obter-a-exportacao)
- [Arquivos reconhecidos](#arquivos-reconhecidos)
- [Uso e interpretação dos resultados](#uso-e-interpretacao-dos-resultados)
- [Idiomas e rotas](#idiomas-e-rotas)
- [Histórico e backup](#historico-e-backup)
- [Limites de importação](#limites-de-importacao)
- [Limitações](#limitacoes)
- [Execução local e testes](#execucao-local-e-testes)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Publicação](#publicacao)
- [Avisos e licença](#avisos-e-licenca)

<a id="como-comecar"></a>
## Como começar

1. Solicite ao Instagram uma exportação dos dados de **Seguidores e seguindo** no formato JSON.
2. Abra a aplicação, informe o username da conta presente na exportação e selecione o ZIP original. Também é possível escolher os JSONs manualmente.
3. Navegue pelas categorias, pesquise e filtre os resultados. Ao importar uma nova exportação para o mesmo username, compare as análises no histórico.

O username identifica a conta dentro do histórico local e pode ser corrigido depois. Para conhecer a interface sem usar arquivos próprios, use o botão **Demonstração**.

<a id="recursos-principais"></a>
## Recursos principais

- Importação do ZIP original do Instagram sem descompactá-lo e importação manual de JSONs.
- Listas de seguidores, contas seguidas, conexões mútuas, contas que não seguem de volta e seguidores que você não segue.
- Comparação de exportações para destacar novos seguidores e diferenças na lista de seguidores.
- Saldo de seguidores, variação de contas seguidas e datas quando os timestamps estão presentes na exportação.
- Histórico local por conta, com abertura e exclusão individual de análises.
- Edição do username sem perder o histórico associado.
- Backup JSON restaurável no próprio InstaCheck.
- Pesquisa, filtros, ordenação, cópia dos usernames visíveis e exportação CSV.
- Imagens de resultado nos formatos Story e Post.
- Modo demonstração, tutorial e perguntas frequentes.
- Interface responsiva para celular, tablet e computador, disponível em português do Brasil, espanhol e inglês.

### Demonstração

O botão **Demonstração** abre duas análises de exemplo com dados fictícios. Esses dados são criados para a sessão e não entram no histórico salvo.

### Imagens compartilháveis

É possível gerar uma imagem **Story** (1080 × 1920) ou **Post** (1080 × 1080). A imagem mostra estatísticas gerais e a identificação do InstaCheck com `@viniohc`, sem os usernames analisados. Você pode baixar a imagem ou usar o compartilhamento nativo do dispositivo; se ele não estiver disponível, o InstaCheck baixa o arquivo.

<a id="privacidade-e-armazenamento"></a>
## Privacidade e armazenamento

Os arquivos selecionados são lidos e processados no dispositivo. O app usa o Web Worker local [import-worker.js](import-worker.js) para inspecionar o ZIP e interpretar os JSONs. O código do projeto não implementa um backend nem envia as listas para um servidor.

- O InstaCheck não pede senha nem autenticação da conta do Instagram.
- As análises salvas ficam no **IndexedDB** do navegador.
- O progresso de revisão e a preferência de idioma usam o armazenamento local do navegador.
- O histórico não sincroniza entre dispositivos ou perfis de navegador. Limpar os dados do navegador pode removê-lo.
- Depois da importação, você pode apagar o ZIP original; as análises salvas continuam no navegador enquanto os dados locais forem preservados.
- A imagem compartilhável contém estatísticas gerais e a identificação `@viniohc`; não inclui os usernames encontrados nos arquivos.

Faça um backup antes de trocar de dispositivo, perfil do navegador ou limpar os dados locais. O backup contém dados das análises e deve ser guardado com cuidado.

<a id="como-obter-a-exportacao"></a>
## Como obter a exportação

Os nomes exatos dos menus do Instagram podem mudar, mas o fluxo costuma ser:

1. Abra o Instagram, acesse seu perfil e entre na **Central de Contas** pelo menu.
2. Abra **Suas informações e permissões** e escolha **Exportar suas informações**.
3. Selecione **Criar exportação** e escolha o perfil do Instagram.
4. Escolha a exportação para o dispositivo e, nas informações específicas, selecione **Seguidores e seguindo**.
5. Selecione o período **Todo o período** e o formato **JSON**.
6. Confirme o e-mail para receber o aviso de que o ZIP está pronto e solicite a exportação. Não é necessário esperar na tela.
7. Quando receber a notificação ou o e-mail, volte à exportação e baixe o arquivo.
8. Encontre o ZIP em **Downloads** e selecione-o no InstaCheck sem descompactar.

No Android e em aparelhos Samsung, o arquivo normalmente aparece em **Meus Arquivos → Downloads**.

<a id="arquivos-reconhecidos"></a>
## Arquivos reconhecidos

Para uma análise básica, a exportação precisa conter arquivos de seguidores e de contas seguidas, normalmente:

```text
followers_1.json
followers_2.json ...
following.json
```

Também podem ser lidos, quando presentes:

```text
pending_follow_requests.json
pending_follow_requests_sent.json
recent_follow_requests.json
recently_unfollowed_profiles.json
recently_unfollowed_accounts.json
```

Os arquivos podem estar dentro de pastas no ZIP. O leitor aceita as variações conhecidas dos nomes; também é possível selecionar JSONs compatíveis manualmente.

<a id="uso-e-interpretacao-dos-resultados"></a>
## Uso e interpretação dos resultados

1. Informe o username da conta que corresponde à exportação.
2. Selecione o ZIP original ou os JSONs manualmente.
3. Aguarde a leitura local e navegue pelas categorias disponíveis.
4. Use pesquisa, filtros e ordenação para encontrar contas.
5. Abra perfis ou marque o progresso de revisão conforme sua decisão.
6. Mais tarde, importe uma nova exportação com o mesmo username para comparar as listas.

### Categorias

- **Seguidores:** contas que seguem o perfil.
- **Seguindo:** contas seguidas pelo perfil.
- **Conexões mútuas:** contas que se seguem mutuamente.
- **Não seguem de volta:** contas seguidas que não aparecem entre os seguidores.
- **Você não segue:** seguidores que não aparecem na lista de contas seguidas.
- **Novos seguidores:** contas presentes na exportação atual e ausentes na comparação.
- **Deixaram de seguir:** contas presentes na lista anterior de seguidores e ausentes na atual.
- **Pedidos pendentes e recentes:** exibidos quando os arquivos correspondentes estão disponíveis.

### Comparações, datas e ordenação

As comparações mostram diferenças entre exportações. Elas não determinam necessariamente o momento exato em que alguém deixou de seguir; mostram quando a diferença foi detectada entre as análises disponíveis.

Quando a exportação contém timestamps, o InstaCheck pode mostrar quando alguém começou a seguir você, quando você começou a seguir alguém ou a data associada a uma mudança. Datas ausentes não são estimadas.

As listas podem ser ordenadas por username de A a Z ou de Z a A, conexões mais recentes ou mais antigas. Perfis sem data ficam depois dos que têm data na ordenação temporal.

<a id="idiomas-e-rotas"></a>
### Idiomas e rotas

Na primeira visita, o idioma segue a preferência do navegador. Também pode ser alterado pelo seletor no cabeçalho; a escolha fica salva no dispositivo. Os idiomas disponíveis são português do Brasil (`pt-BR`), espanhol (`es`) e inglês (`en`).

| Rota | Tela |
| --- | --- |
| `#/` | Página inicial |
| `#/ajuda` | Tutorial e perguntas frequentes |
| `#/historico` | Histórico local |
| `#/analise` | Análise atual; depende de dados carregados na sessão |

Se a rota de análise for aberta sem uma análise disponível na sessão, o app retorna para a página inicial.

<a id="historico-e-backup"></a>
## Histórico e backup

Quando o IndexedDB está disponível, uma importação válida salva uma análise para o username informado. Se os dados forem idênticos aos da análise mais recente, o histórico atualiza o registro sem criar uma cópia. O histórico permite escolher uma conta, abrir uma análise anterior, comparar com outra análise de conteúdo diferente e excluir uma análise. Ao excluir a última análise, a conta também deixa de aparecer no histórico. O app pede confirmação antes de excluir.

Se o navegador bloquear o armazenamento, o resultado atual ainda pode ser consultado na sessão, mas não fica persistido no histórico.

### Backup e restauração

**Baixar backup** gera um JSON do InstaCheck com as contas, snapshots de seguidores e contas seguidas, timestamps disponíveis e progresso de revisão. Esse arquivo não é o ZIP original do Instagram: ele restaura análises que já haviam sido salvas no navegador.

Restaure pelo botão **Restaurar backup** ou selecione o backup JSON na área principal de importação. Guarde-o em local seguro, pois ele contém dados das análises.

Os snapshots e backups preservam as listas de seguidores e contas seguidas, timestamps disponíveis e progresso de revisão. Arquivos opcionais de pedidos pendentes ou recentes e perfis removidos são usados na análise corrente, mas essas listas não entram nos snapshots salvos.

<a id="limites-de-importacao"></a>
## Limites de importação

Os limites atuais são:

- ZIP comprimido: até **100 MiB**.
- Conteúdo descompactado somado de todas as entradas do ZIP: até **120 MiB**.
- Cada arquivo JSON: até **25 MiB**; soma dos JSONs: até **80 MiB**.
- ZIP: até **10.000 entradas** e **2.000 arquivos**.
- Seleção manual: até **50 arquivos JSON**.
- Backup do InstaCheck selecionado para restauração: até **20 MiB**.

O app verifica os limites antes de processar os arquivos. A inspeção e a descompactação do ZIP, assim como a leitura dos JSONs, acontecem no Web Worker local `import-worker.js`.

<a id="limitacoes"></a>
### Limitações

O formato das exportações pode mudar, e algumas datas podem não estar disponíveis. Navegação privada ou armazenamento bloqueado pode impedir que o histórico seja salvo. O histórico não é sincronizado entre dispositivos.

<a id="execucao-local-e-testes"></a>
## Execução local e testes

O projeto não tem etapa de instalação ou build. Para testar no computador, tenha Python 3 disponível e, na raiz do repositório, execute:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Depois, abra [http://127.0.0.1:4173/#/](http://127.0.0.1:4173/#/). Como a importação carrega um Web Worker de `./import-worker.js`, use HTTP em vez de abrir `index.html` por `file://`: o tratamento de arquivos locais varia entre navegadores e pode bloquear o Worker ([detalhes sobre a política de mesma origem](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)).

O comando de testes foi verificado com Node.js 22.14.0:

```bash
node --test tests/regressions.test.mjs
```

A suíte cobre validação de usernames e progresso, migração local, importação ZIP/JSON e limites, concorrência, comparação de histórico, backup/restauração, falha de armazenamento, datas inválidas, exportação CSV e traduções.

<a id="tecnologias"></a>
## Tecnologias

O projeto usa HTML, CSS responsivo e JavaScript sem framework; IndexedDB para o histórico; Web Storage para progresso e preferências; Canvas API para gerar imagens; e Web Share API quando disponível. A biblioteca `fflate` e as fontes Inter e Poppins são servidas localmente. Não há banco de dados remoto ou serviço de autenticação no app.

<a id="estrutura-do-projeto"></a>
## Estrutura do projeto

```text
.
├── index.html                 # Documento, metadados e interface
├── app.js                     # Importação, análises, histórico e compartilhamento
├── import-worker.js           # Inspeção e leitura local de ZIPs e JSONs
├── i18n.js                    # Traduções e detecção de idioma
├── style.css                  # Estilos e responsividade
├── favicon.svg                # Ícone do site
├── og-image.png               # Arte para compartilhamento social; não é captura da interface
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
├── tests/
│   └── regressions.test.mjs
├── README.en.md              # Inglês
└── README.md                 # Português do Brasil
```

<a id="publicacao"></a>
## Publicação

O InstaCheck é estático e pode ser publicado em uma hospedagem de arquivos estáticos, como Vercel, GitHub Pages, Cloudflare Pages ou Netlify. Não exige framework, comando de build, backend ou variáveis de ambiente; publique os arquivos do projeto juntos para manter o Worker e seus recursos acessíveis.

O metadado Open Graph do `index.html` aponta para `/og-image.png` a partir da raiz do domínio. Em hospedagem sob um subcaminho, a imagem de prévia social pode precisar de ajuste no caminho.

<a id="avisos-e-licenca"></a>
## Avisos e licença

O InstaCheck é um projeto independente, sem vínculo, parceria ou afiliação com Instagram ou Meta. Instagram é uma marca de seus respectivos proprietários.

O InstaCheck não executa unfollows, não cancela solicitações e não realiza ações automáticas na conta. Ele apresenta diferenças encontradas nos arquivos; todas as decisões e ações permanecem sob controle do usuário.

Este repositório ainda não possui uma licença própria. `vendor/fflate.LICENSE` cobre somente a dependência fflate. Para pedir autorização para reutilizar ou redistribuir o InstaCheck, entre em contato comigo pelo [meu perfil no GitHub](https://github.com/viniohc).
