
// DADOS DE EXEMPLO 
// por enquanto os alunos são inventados, depois dá pra trocar por dados de verdade

// meses do ano letivo até outubro
const meses = ['Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out'];
const diasSemana = ['Seg','Ter','Qua','Qui','Sex'];

// cores das linhas do gráfico (uma pra cada disciplina)
const cores = ['#2A5BD7','#2E9E6B','#F2A541','#D64550'];

// considerei 20 dias de aula por mês pra calcular a frequência
const DIAS_LETIVOS_MES = 20;

// lista de alunos. Cada um tem notas, faltas por mês e faltas por dia da semana
const alunos = [
  {
    nome:'Ana Souza', turma:'1º A', anterior:7.4,
    notas:{
      'Português':  [7,7.5,8,7.8,8.2,8.5,8.4,8.8,9],
      'Matemática':[6,6.5,6.8,7,7.2,7.5,7.8,8,8.2],
      'Física':    [5.5,6,6.2,6.5,6.4,6.8,7,7.2,7.5],
      'História':  [8,8,8.2,8.5,8.4,8.6,8.8,9,9]
    },
    faltas:[1,0,2,1,0,1,0,1,0],
    porDia:[2,1,1,1,1]
  },
  {
    nome:'Bruno Lima', turma:'1º A', anterior:6.1,
    notas:{
      'Português':  [6,5.8,6,6.2,6,6.5,6.4,6.6,6.8],
      'Matemática':[4.5,4.8,5,5.2,5,5.5,5.8,6,6.2],
      'Física':    [5,4.8,5,5.2,5.5,5.4,5.8,6,6],
      'História':  [6.5,6.8,7,6.8,7,7.2,7,7.4,7.5]
    },
    faltas:[3,4,2,5,3,4,3,5,4],
    porDia:[10,3,4,5,6]   // o Bruno falta muito na segunda, hmm
  },
  {
    nome:'Carla Mendes', turma:'1º B', anterior:8.2,
    notas:{
      'Português':  [8.5,8.6,8.8,9,8.9,9,9.2,9.1,9.3],
      'Matemática':[8,8.2,8,8.5,8.6,8.8,8.7,9,9],
      'Física':    [7.5,7.8,8,8.2,8,8.4,8.5,8.6,8.8],
      'História':  [8.8,9,9,9.2,9,9.3,9.4,9.5,9.5]
    },
    faltas:[0,0,1,0,0,0,1,0,0],
    porDia:[0,0,1,0,1]
  }
];

// cria os 2 avisos de presença que já aparecem pra cada aluno
alunos.forEach(a => {
  const primeiroNome = a.nome.split(' ')[0];       // pega só o primeiro nome
  const faltouOntem = a.faltas[a.faltas.length - 1] > 2;
  a.avisos = [
    { tipo:'presente', txt:`${primeiroNome} chegou à escola às 07:12`, hora:'Hoje, 07:12' },
    {
      tipo: faltouOntem ? 'falta' : 'presente',
      txt:  faltouOntem ? `${primeiroNome} faltou às aulas` : `${primeiroNome} esteve presente`,
      hora: 'Ontem'
    }
  ];
});

// avisos que aparecem no quadro na primeira vez que abre o site
const avisosIniciais = [
  { id:1, cat:'prova',      titulo:'Prova de Matemática', texto:'Dia 20/10, conteúdo: funções do 1º grau. Estudem!', data:'09/10' },
  { id:2, cat:'evento',     titulo:'Feira de Ciências',   texto:'Dia 28/10 no pátio. Os grupos precisam entregar o projeto até sexta.', data:'08/10' },
  { id:3, cat:'importante', titulo:'Reunião de pais',     texto:'Sábado, 24/10, às 9h. A presença dos responsáveis é muito importante.', data:'07/10' }
];

// FUNÇÕES PEQUENAS QUE EU USO NO CÓDIGO TODO

// atalho pra não ficar escrevendo document.getElementById toda hora
const $ = id => document.getElementById(id);

// soma todos os números de uma lista
const soma = lista => lista.reduce((total, n) => total + n, 0);

// média = soma dividida pela quantidade
const media = lista => soma(lista) / lista.length;

// formata número com 1 casa e vírgula (ex: 7.5 vira 7,5)
const f1 = n => n.toFixed(1).replace('.', ',');

// variáveis que guardam quem está usando o site agora
let atual = alunos[0];   // aluno escolhido
let perfil = 'pai';      // 'pai' ou 'edu'

// GRÁFICOS (feitos em SVG, sem biblioteca)
// gráfico de barras: usei pras faltas
function barras(el, rotulos, valores, cor){
  const W = 600, H = 220, margem = 30;
  const maximo = Math.max(...valores, 1);            // maior valor (mínimo 1 pra não dividir por zero)
  const larguraBarra = (W - margem*2) / valores.length;

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img">`;

  valores.forEach((v, i) => {
    const altura = (H - margem*2) * v / maximo;      // altura proporcional ao valor
    const x = margem + i*larguraBarra + larguraBarra*0.2;
    svg += `
      <rect x="${x}" y="${H - margem - altura}" width="${larguraBarra*0.6}" height="${altura}" rx="6" fill="${cor}"/>
      <text x="${x + larguraBarra*0.3}" y="${H - margem - altura - 6}" text-anchor="middle" font-size="13" font-weight="700">${v}</text>
      <text x="${x + larguraBarra*0.3}" y="${H - 8}" text-anchor="middle" font-size="12" fill="#5B6B84">${rotulos[i]}</text>`;
  });

  el.innerHTML = svg + '</svg>';
}

// gráfico de linhas: usei pras notas
function linhas(el, series){
  const W = 600, H = 260, margem = 34, n = meses.length;
  const px = i => margem + i * (W - margem*2) / (n - 1);   // posição horizontal
  const py = v => H - margem - (H - margem*2) * v / 10;    // posição vertical (nota vai de 0 a 10)

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img">`;

  // linhas horizontais de fundo (a tracejada verde é a média 7)
  [0, 5, 7, 10].forEach(v => {
    svg += `<line x1="${margem}" x2="${W - margem}" y1="${py(v)}" y2="${py(v)}"
              stroke="${v === 7 ? '#2E9E6B' : '#DCE4EE'}" stroke-dasharray="${v === 7 ? '5' : '0'}"/>
            <text x="4" y="${py(v) + 4}" font-size="11" fill="#5B6B84">${v}</text>`;
  });

  // nome dos meses embaixo
  meses.forEach((mes, i) => {
    svg += `<text x="${px(i)}" y="${H - 8}" text-anchor="middle" font-size="12" fill="#5B6B84">${mes}</text>`;
  });

  // uma linha pra cada disciplina
  series.forEach(([nome, valores], k) => {
    const pontos = valores.map((v, i) => px(i) + ',' + py(v)).join(' ');
    svg += `<polyline fill="none" stroke="${cores[k]}" stroke-width="3" stroke-linejoin="round" points="${pontos}"/>`;
    // bolinhas em cada mês (passa o mouse e aparece a nota)
    valores.forEach((v, i) => {
      svg += `<circle cx="${px(i)}" cy="${py(v)}" r="4" fill="${cores[k]}"><title>${nome} em ${meses[i]}: ${f1(v)}</title></circle>`;
    });
  });

  el.innerHTML = svg + '</svg>';
}

// VISÃO GERAL
function renderVisao(){
  const a = atual;
  const ultimasNotas = Object.values(a.notas).map(lista => lista[lista.length - 1]);
  const mediaAtual = media(ultimasNotas);
  const totalFaltas = soma(a.faltas);
  // frequência = 100% menos a porcentagem de faltas
  const freq = 100 - totalFaltas / (DIAS_LETIVOS_MES * meses.length) * 100;

  // os 4 cards de cima
  $('resumo').innerHTML = `
    <div class="card verde"><span>Frequência no ano</span><strong>${f1(freq)}%</strong></div>
    <div class="card verm"><span>Total de faltas</span><strong>${totalFaltas}</strong></div>
    <div class="card"><span>Média atual</span><strong>${f1(mediaAtual)}</strong></div>
    <div class="card ambar"><span>Média do ano anterior</span><strong>${f1(a.anterior)}</strong></div>`;

  // botões de registrar presença/falta (só o professor vê)
  $('acoes').innerHTML = perfil === 'edu'
    ? `<button style="background:#2E9E6B" onclick="registrar('presente')">Registrar presença</button>
       <button style="background:#D64550" onclick="registrar('falta')">Registrar falta</button>`
    : '';

  // lista de avisos de presença
  $('avisos').innerHTML = a.avisos.map(v =>
    `<li class="${v.tipo}"><span>${v.txt}</span><small>${v.hora}</small></li>`
  ).join('');

  // tabela comparando os alunos (só professor vê)
  if (perfil === 'edu') {
    const linhasTabela = alunos.map(x => {
      const m = media(Object.values(x.notas).map(lista => lista[lista.length - 1]));
      const seta = m >= x.anterior ? '▲' : '▼';   // sobe ou desce em relação ao ano passado
      return `<tr><td>${x.nome}</td><td>${x.turma}</td><td>${f1(m)} ${seta}</td><td>${f1(x.anterior)}</td><td>${soma(x.faltas)}</td></tr>`;
    }).join('');
    $('painelEdu').innerHTML = `
      <h2>Comparação entre alunos</h2>
      <div class="caixa"><table>
        <tr><th>Aluno</th><th>Turma</th><th>Média atual</th><th>Ano anterior</th><th>Faltas</th></tr>
        ${linhasTabela}
      </table></div>`;
  } else {
    $('painelEdu').innerHTML = '';
  }
}

// quando o professor clica em "registrar presença/falta"
// por enquanto só simula, não manda mensagem de verdade pros pais
function registrar(tipo){
  const nome = atual.nome.split(' ')[0];
  const hora = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
  atual.avisos.unshift({   // unshift coloca no começo da lista
    tipo: tipo,
    txt: tipo === 'falta'
      ? `${nome} faltou hoje. Aviso enviado aos responsáveis.`
      : `${nome} chegou à escola. Aviso enviado aos responsáveis.`,
    hora: 'Hoje, ' + hora
  });
  renderVisao();
}

// FREQUÊNCIA
function renderFrequencia(){
  barras($('gMes'), meses, atual.faltas, '#D64550');
  barras($('gDia'), diasSemana, atual.porDia, '#F2A541');

  // descobre qual dia da semana tem mais faltas
  const total = soma(atual.porDia);
  const maior = Math.max(...atual.porDia);
  const posicao = atual.porDia.indexOf(maior);

  if (total === 0) {
    $('insightFaltas').textContent = 'Nenhuma falta registrada. Continue assim!';
  } else {
    const percentual = Math.round(maior / total * 100);
    let texto = `Maior concentração de faltas: ${diasSemana[posicao]} (${percentual}% do total).`;
    if (percentual > 35) texto += ' Vale conversar com o aluno sobre esse padrão.';
    $('insightFaltas').textContent = texto;
  }
}

//NOTAS 
function renderNotas(){
  const series = Object.entries(atual.notas);   // vira lista de [nome, notas]
  linhas($('gNotas'), series);

  // legenda colorida embaixo do gráfico
  $('legenda').innerHTML = series.map(([nome], k) =>
    `<span><i style="background:${cores[k]}"></i>${nome}</span>`
  ).join('');

  // trimestres: 
  const trimestres = [[0,4], [4,7], [7,9]];
  $('tabTri').innerHTML =
    `<tr><th>Disciplina</th><th>1º tri</th><th>2º tri</th><th>3º tri</th></tr>` +
    series.map(([nome, notas]) =>
      `<tr><td>${nome}</td>${trimestres.map(([ini, fim]) => `<td>${f1(media(notas.slice(ini, fim)))}</td>`).join('')}</tr>`
    ).join('');
}

// METAS 
function renderMetas(){
  // meta de cada matéria = nota atual + 0,5 arredondada pra cima (mínimo 7, máximo 10)
  $('metasNotas').innerHTML = Object.entries(atual.notas).map(([nome, notas]) => {
    const nota = notas[notas.length - 1];
    const meta = Math.min(10, Math.max(7, Math.ceil(nota + 0.5)));
    const bateu = nota >= meta;
    return `
      <div class="meta"><b>${nome}</b>: nota ${f1(nota)} → meta ${meta}
        <div class="barra"><div class="${bateu ? 'ok' : ''}" style="width:${nota / meta * 100}%"></div></div>
        <small>${bateu ? 'Meta batida!' : 'Faltam ' + f1(meta - nota) + ' pontos'}</small>
      </div>`;
  }).join('');

  // meta de faltas: no máximo 4 por trimestre (inventei esse número)
  const faltasTri = soma(atual.faltas.slice(7));   // Set e Out
  const limite = 4;
  const dentro = faltasTri <= limite;
  $('metaFaltas').innerHTML = `
    <div class="meta"><b>3º trimestre</b>: ${faltasTri} faltas de no máximo ${limite}
      <div class="barra"><div class="${dentro ? 'ok' : ''}"
        style="width:${Math.min(100, faltasTri / limite * 100)}%;${dentro ? '' : 'background:#D64550'}"></div></div>
      <small>${dentro ? 'Dentro da meta.' : 'Acima da meta. Atenção nas próximas aulas.'}</small>
    </div>`;
}

// QUADRO DE AVISOS

let categoriaFiltro = 'todos';   // qual filtro está ligado

// o localStorage guarda os avisos no navegador, então não somem quando recarrega a página
// (coloquei try/catch porque às vezes o navegador bloqueia e dá erro)
function carregarAvisos(){
  try {
    const salvo = localStorage.getItem('eremagAvisos');
    if (salvo) return JSON.parse(salvo);
  } catch (erro) {
    console.log('Não consegui ler os avisos salvos', erro);
  }
  return avisosIniciais;
}

function salvarAvisos(){
  try {
    localStorage.setItem('eremagAvisos', JSON.stringify(listaAvisos));
  } catch (erro) {
    console.log('Não consegui salvar os avisos', erro);
  }
}

let listaAvisos = carregarAvisos();

// nomes bonitinhos das categorias
const nomesCategoria = { evento:'Evento', prova:'Prova', importante:'Importante' };

function renderQuadro(){
  // o formulário só aparece pro professor
  $('formAviso').classList.toggle('visivel', perfil === 'edu');

  // filtra por categoria (se for "todos" mostra tudo)
  const mostrar = listaAvisos.filter(av => categoriaFiltro === 'todos' || av.cat === categoriaFiltro);

  if (mostrar.length === 0) {
    $('mural').innerHTML = '<p class="vazio">Nenhum aviso por aqui ainda.</p>';
    return;
  }

  $('mural').innerHTML = mostrar.map(av => `
    <article class="postit ${av.cat}">
      ${perfil === 'edu' ? `<button class="apagar" onclick="apagarAviso(${av.id})" aria-label="Apagar aviso">×</button>` : ''}
      <h3>${av.titulo}</h3>
      <p>${av.texto}</p>
      <small>${nomesCategoria[av.cat]} · ${av.data}</small>
    </article>
  `).join('');
}

// função pra evitar que alguém escreva código HTML dentro do aviso
// (a professora de informática falou que isso é perigoso)
function limpar(texto){
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function apagarAviso(id){
  listaAvisos = listaAvisos.filter(av => av.id !== id);   // tira o aviso da lista
  salvarAvisos();
  renderQuadro();
}

// quando o professor clica em "Publicar aviso"
$('formAviso').onsubmit = evento => {
  evento.preventDefault();   // impede a página de recarregar
  const hoje = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });

  listaAvisos.unshift({
    id: Date.now(),          // o id é a hora atual em número, nunca repete
    cat: $('avCat').value,
    titulo: limpar($('avTitulo').value),
    texto: limpar($('avTexto').value),
    data: hoje
  });

  salvarAvisos();
  $('formAviso').reset();    // limpa os campos
  renderQuadro();
};

// botões de filtro
$('filtros').onclick = evento => {
  const botao = evento.target.closest('button');
  if (!botao) return;
  categoriaFiltro = botao.dataset.cat;
  document.querySelectorAll('#filtros button').forEach(b => b.classList.remove('ativa'));
  botao.classList.add('ativa');
  renderQuadro();
};

//JUNTANDO TUDO

// desenha todas as abas que dependem do aluno
function tudo(){
  renderVisao();
  renderFrequencia();
  renderNotas();
  renderMetas();
}

// preenche a lista de alunos no select
$('aluno').innerHTML = alunos.map((a, i) => `<option value="${i}">${a.nome} (${a.turma})</option>`).join('');

// quando troca o aluno, redesenha tudo
$('aluno').onchange = evento => {
  atual = alunos[evento.target.value];
  tudo();
};

// quando troca o perfil (pai/professor), atualiza o que muda
$('perfil').onchange = evento => {
  perfil = evento.target.value;
  renderVisao();
  renderQuadro();
};

// troca de aba ao clicar no menu
$('abas').onclick = evento => {
  const botao = evento.target.closest('button');
  if (!botao) return;
  // tira "ativa" de todo mundo
  document.querySelectorAll('.abas button, .aba').forEach(x => x.classList.remove('ativa'));
  // e coloca só no botão clicado e na seção dele
  botao.classList.add('ativa');
  $(botao.dataset.aba).classList.add('ativa');
};

// começa o site!
tudo();
renderQuadro();
