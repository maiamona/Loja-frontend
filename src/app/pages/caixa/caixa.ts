import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CaixaService,
  ProdutoCaixa,
  ClienteCaixa,
  ItemCaixa
} from '../../services/caixa';

@Component({
  selector: 'app-caixa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caixa.html',
  styleUrl: './caixa.scss'
})
export class Caixa implements OnInit {

  // =====================================================
  // PRODUTOS
  // =====================================================

  produtos: ProdutoCaixa[] = [];
  produtosFiltrados: ProdutoCaixa[] = [];

  pesquisa = '';
  carregandoProdutos = false;

  // =====================================================
  // CARRINHO
  // =====================================================

  carrinho: ItemCaixa[] = [];

  // =====================================================
  // PAGAMENTO
  // =====================================================

  formaPagamento = 'Dinheiro';
  valorRecebido = 0;
  taxaEntrega = 0;

  // =====================================================
  // CLIENTES
  // =====================================================

  clientes: ClienteCaixa[] = [];

  clienteSelecionadoId: number | null = null;

  pesquisaCliente = '';

  clientesFiltrados: ClienteCaixa[] = [];

  // =====================================================
  // MODAL CLIENTE
  // =====================================================

  mostrarModalCliente = false;

  etapaCliente: 'pergunta' | 'selecionar' = 'pergunta';

  // =====================================================
  // NOVO CLIENTE
  // =====================================================

  mostrarModalNovoCliente = false;

  novoCliente = {
    nome: '',
    telefone: '',
    email: ''
  };

  // =====================================================
  // ESTADOS
  // =====================================================

  finalizandoVenda = false;

  erro = '';
  mensagem = '';

  etapaProcessamento:
    'pedido' |
    'estoque' |
    'fatura' |
    'concluido' |
    'erro' = 'pedido';

  // =====================================================
  // CONSTRUTOR
  // =====================================================

  constructor(
    private caixaService: CaixaService,
    private router: Router
  ) { }

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarClientes();
  }

  // =====================================================
  // PRODUTOS
  // =====================================================

  carregarProdutos(): void {

    this.carregandoProdutos = true;
    this.erro = '';

    this.caixaService.listarProdutos().subscribe({

      next: resposta => {

        console.log(
          'Produtos carregados no Caixa:',
          resposta.produtos
        );

        this.produtos = resposta.produtos;

        this.produtosFiltrados = [
          ...this.produtos
        ];

        this.carregandoProdutos = false;
      },

      error: erro => {

        console.error(
          'Erro ao carregar produtos:',
          erro
        );

        this.erro =
          erro?.error?.mensagem ||
          erro?.error?.erro ||
          'Não foi possível carregar os produtos.';

        this.carregandoProdutos = false;
      }

    });

  }

  // =====================================================
  // PESQUISAR PRODUTO
  // =====================================================

  pesquisarProduto(): void {

    const texto =
      this.pesquisa
        .trim()
        .toLowerCase();

    if (!texto) {

      this.produtosFiltrados = [
        ...this.produtos
      ];

      return;
    }

    this.produtosFiltrados =
      this.produtos.filter(produto =>

        produto.nome
          ?.toLowerCase()
          .includes(texto)

        ||

        produto.codigoBarras
          ?.toLowerCase()
          .includes(texto)

      );

  }

  // =====================================================
  // ADICIONAR PRODUTO
  // =====================================================

  adicionarProduto(
    produto: ProdutoCaixa
  ): void {

    if (produto.estoque <= 0) {

      alert(
        `O produto "${produto.nome}" está sem stock.`
      );

      return;
    }

    const itemExistente =
      this.carrinho.find(
        item => item.produtoId === produto.id
      );

    // ---------------------------------------------------
    // PRODUTO JÁ EXISTE NO CARRINHO
    // ---------------------------------------------------

    if (itemExistente) {

      if (
        itemExistente.quantidade >=
        produto.estoque
      ) {

        alert(
          `Stock insuficiente de "${produto.nome}".\n\n` +
          `Stock disponível: ${produto.estoque}\n` +
          `Quantidade no carrinho: ${itemExistente.quantidade}`
        );

        return;
      }

      itemExistente.quantidade++;

      itemExistente.subtotal =
        itemExistente.quantidade *
        itemExistente.preco;

      return;
    }

    // ---------------------------------------------------
    // NOVO PRODUTO
    // ---------------------------------------------------

    this.carrinho.push({

      produtoId:
        produto.id,

      nome:
        produto.nome,

      codigoBarras:
        produto.codigoBarras,

      preco:
        Number(produto.preco),

      quantidade:
        1,

      subtotal:
        Number(produto.preco)

    });

  }

  obterEstoqueDisponivel(item: ItemCaixa): number {

    const produto = this.produtos.find(
      p => p.id === item.produtoId
    );

    if (!produto) {
      return 0;
    }

    return produto.estoque;
  }


  obterClasseEstoqueCarrinho(item: ItemCaixa): string {

    const estoque = this.obterEstoqueDisponivel(item);

    if (estoque <= 0) {
      return 'stock-sem';
    }

    if (estoque <= 5) {
      return 'stock-baixo';
    }

    return 'stock-normal';
  }
  // =====================================================
  // AUMENTAR QUANTIDADE
  // =====================================================

  aumentarQuantidade(
    item: ItemCaixa
  ): void {

    const produto =
      this.produtos.find(
        p => p.id === item.produtoId
      );

    if (!produto) {
      return;
    }

    if (
      item.quantidade >=
      produto.estoque
    ) {

      alert(
        `Stock insuficiente para "${produto.nome}".\n\n` +
        `Stock disponível: ${produto.estoque}\n` +
        `Quantidade no carrinho: ${item.quantidade}`
      );

      return;
    }

    item.quantidade++;

    item.subtotal =
      item.quantidade *
      item.preco;

  }

  // =====================================================
  // DIMINUIR QUANTIDADE
  // =====================================================

  diminuirQuantidade(
    item: ItemCaixa
  ): void {

    if (item.quantidade <= 1) {

      this.removerProduto(item);

      return;
    }

    item.quantidade--;

    item.subtotal =
      item.quantidade *
      item.preco;

  }

  // =====================================================
  // REMOVER PRODUTO
  // =====================================================

  removerProduto(
    item: ItemCaixa
  ): void {

    this.carrinho =
      this.carrinho.filter(
        produto =>
          produto.produtoId !==
          item.produtoId
      );

  }

  // =====================================================
  // SUBTOTAL
  // =====================================================

  get subtotal(): number {

    return this.carrinho.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

  }

  // =====================================================
  // TOTAL
  // =====================================================

  get total(): number {

    return (
      this.subtotal +
      Number(this.taxaEntrega || 0)
    );

  }

  // =====================================================
// PAGAMENTO EM DINHEIRO
// =====================================================

get troco(): number {

  if (this.formaPagamento !== 'Dinheiro') {
    return 0;
  }

  const recebido =
    Number(this.valorRecebido || 0);

  return Math.max(
    0,
    recebido - this.total
  );

}


// =====================================================
// VALOR AINDA EM FALTA
// =====================================================

get valorEmFalta(): number {

  if (this.formaPagamento !== 'Dinheiro') {
    return 0;
  }

  const recebido =
    Number(this.valorRecebido || 0);

  return Math.max(
    0,
    this.total - recebido
  );

}


// =====================================================
// PAGAMENTO VÁLIDO
// =====================================================

get pagamentoValido(): boolean {

  if (this.formaPagamento !== 'Dinheiro') {
    return true;
  }

  return (
    Number(this.valorRecebido || 0) >=
    this.total
  );

}

  // =====================================================
  // CARREGAR CLIENTES
  // =====================================================

  carregarClientes(): void {

    this.caixaService.listarClientes().subscribe({

      next: resposta => {

        console.log(
          'Clientes carregados no Caixa:',
          resposta.clientes
        );

        this.clientes =
          resposta.clientes;

        this.clientesFiltrados =
          [...this.clientes];

      },

      error: erro => {

        console.error(
          'Erro ao carregar clientes:',
          erro
        );

        this.erro =
          erro?.error?.mensagem ||
          erro?.error?.erro ||
          'Não foi possível carregar os clientes.';

      }

    });

  }

  // =====================================================
  // PESQUISAR CLIENTE
  // =====================================================

  pesquisarCliente(): void {

    const texto =
      this.pesquisaCliente
        .trim()
        .toLowerCase();

    if (!texto) {

      this.clientesFiltrados =
        [...this.clientes];

      return;
    }

    this.clientesFiltrados =
      this.clientes.filter(cliente =>

        cliente.nome
          ?.toLowerCase()
          .includes(texto)

        ||

        cliente.telefone
          ?.toLowerCase()
          .includes(texto)

        ||

        cliente.email
          ?.toLowerCase()
          .includes(texto)

      );

  }

  // =====================================================
  // FINALIZAR VENDA
  // =====================================================

  finalizarVenda(): void {

    if (this.carrinho.length === 0) {

      alert(
        'Adicione pelo menos um produto à venda.'
      );

      return;
    }

    this.erro = '';
    this.mensagem = '';

    this.mostrarModalCliente = true;

    this.etapaCliente = 'pergunta';

  }

  // =====================================================
  // CLIENTE JÁ CADASTRADO
  // =====================================================

  clienteJaCadastrado(): void {

    this.etapaCliente = 'selecionar';

    this.pesquisaCliente = '';

    this.clientesFiltrados =
      [...this.clientes];

  }

  // =====================================================
  // SELECIONAR CLIENTE
  // =====================================================

  selecionarCliente(
    cliente: ClienteCaixa
  ): void {

    this.clienteSelecionadoId =
      cliente.id;

    this.mostrarModalCliente = false;

    this.confirmarVenda();

  }

  // =====================================================
  // QUERO CADASTRAR CLIENTE
  // =====================================================

  queroCadastrarCliente(): void {

    this.mostrarModalCliente = false;

    this.novoCliente = {

      nome: '',

      telefone: '',

      email: ''

    };

    this.mostrarModalNovoCliente = true;

  }

  // =====================================================
  // VENDA ANÓNIMA
  // =====================================================

  vendaAnonima(): void {

    this.clienteSelecionadoId = null;

    this.mostrarModalCliente = false;

    this.confirmarVenda();

  }

  // =====================================================
  // CANCELAR MODAL CLIENTE
  // =====================================================

  cancelarIdentificacaoCliente(): void {

    this.mostrarModalCliente = false;

  }

  // =====================================================
  // CANCELAR NOVO CLIENTE
  // =====================================================

  cancelarNovoCliente(): void {

    this.mostrarModalNovoCliente = false;

  }

  // =====================================================
  // CADASTRAR CLIENTE
  // =====================================================

  cadastrarCliente(): void {

    const nome =
      this.novoCliente.nome.trim();

    if (!nome) {

      alert(
        'Informe o nome do cliente.'
      );

      return;
    }

    this.erro = '';
    this.mensagem = '';

    this.caixaService
      .cadastrarCliente({

        nome:

          nome,

        telefone:

          this.novoCliente.telefone
            ?.trim() || '',

        email:

          this.novoCliente.email
            ?.trim() || '',

        endereco:
          '',

        cidade:
          ''

      })
      .subscribe({

        next: resposta => {

          console.log(
            'Cliente cadastrado:',
            resposta
          );

          if (
            !resposta.sucesso ||
            !resposta.cliente
          ) {

            this.erro =
              resposta.mensagem ||
              'Não foi possível cadastrar o cliente.';

            return;
          }

          // ---------------------------------------------
          // ASSOCIAR CLIENTE À VENDA
          // ---------------------------------------------

          this.clienteSelecionadoId =
            resposta.cliente.id;

          // ---------------------------------------------
          // ATUALIZAR LISTA DE CLIENTES
          // ---------------------------------------------

          this.clientes = [
            resposta.cliente,
            ...this.clientes
          ];

          this.clientesFiltrados = [
            ...this.clientes
          ];

          // ---------------------------------------------
          // LIMPAR FORMULÁRIO
          // ---------------------------------------------

          this.novoCliente = {

            nome: '',

            telefone: '',

            email: ''

          };

          // ---------------------------------------------
          // FECHAR MODAIS
          // ---------------------------------------------

          this.mostrarModalNovoCliente =
            false;

          this.mostrarModalCliente =
            false;

          // ---------------------------------------------
          // CONTINUAR VENDA
          // ---------------------------------------------

          alert(
            `Cliente "${resposta.cliente.nome}" cadastrado com sucesso.`
          );

          this.confirmarVenda();

        },

        error: erro => {

          console.error(
            'Erro ao cadastrar cliente:',
            erro
          );

          this.erro =
            erro?.error?.mensagem ||
            erro?.error?.erro ||
            'Erro ao cadastrar cliente.';

          alert(this.erro);

        }

      });

  }

  // =====================================================
  // CONFIRMAR VENDA
  // =====================================================

  confirmarVenda(): void {

    if (this.carrinho.length === 0) {

      alert(
        'O carrinho está vazio.'
      );

      return;
    }

    const clienteTexto =
  this.clienteSelecionadoId === null
    ? 'Venda anónima'
    : `Cliente ID: ${this.clienteSelecionadoId}`;

let pagamentoTexto =
  `Pagamento: ${this.formaPagamento}`;

if (this.formaPagamento === 'Dinheiro') {

  pagamentoTexto +=
    `\nValor recebido: ` +
    `${this.valorRecebido.toLocaleString('pt-AO')} AOA`;

  pagamentoTexto +=
    `\nTroco: ` +
    `${this.troco.toLocaleString('pt-AO')} AOA`;

}

const confirmar =
  confirm(

    `Confirmar venda?\n\n` +

    `${clienteTexto}\n` +

    `${pagamentoTexto}\n` +

    `Subtotal: ${this.subtotal.toLocaleString('pt-AO')} AOA\n` +

    `Taxa de entrega: ${Number(this.taxaEntrega || 0).toLocaleString('pt-AO')} AOA\n` +

    `TOTAL: ${this.total.toLocaleString('pt-AO')} AOA`

  );

    if (!confirmar) {
      return;
    }

    this.criarPedido();

  }

  // =====================================================
// PROCESSAMENTO DA VENDA
// =====================================================

obterMensagemProcessamento(): string {

  switch (this.etapaProcessamento) {

    case 'pedido':
      return 'A criar o pedido...';

    case 'estoque':
      return 'A atualizar o stock...';

    case 'fatura':
      return 'A gerar a fatura...';

    case 'concluido':
      return 'Venda concluída com sucesso!';

    case 'erro':
      return 'Ocorreu um problema ao processar a venda.';

    default:
      return 'A processar venda...';

  }

}

// =====================================================
// CRIAR PEDIDO / VENDA
// =====================================================

criarPedido(): void {

  if (this.finalizandoVenda) {
    return;
  }

  if (this.carrinho.length === 0) {

    alert(
      'O carrinho está vazio.'
    );

    return;
  }

  // =====================================================
  // INICIAR PROCESSAMENTO
  // =====================================================

  this.finalizandoVenda = true;

  this.etapaProcessamento = 'pedido';

  this.erro = '';
  this.mensagem = '';

  const dados = {

    clienteId:
      this.clienteSelecionadoId,

    formaPagamento:
      this.formaPagamento,

    taxaEntrega:
      Number(this.taxaEntrega || 0),

    itens:
      this.carrinho.map(item => ({

        produtoId:
          item.produtoId,

        quantidade:
          item.quantidade

      }))

  };

  console.log(
    'Enviando venda para API:',
    dados
  );

  // =====================================================
  // 1. CRIAR PEDIDO
  // =====================================================

  this.caixaService
    .criarPedido(dados)
    .subscribe({

      next: resposta => {

        console.log(
          'Pedido criado:',
          resposta
        );

        const pedidoId =
          resposta.pedidoId;

        const numeroPedido =
          resposta.numeroPedido;

        // =================================================
        // VALIDAR RESPOSTA
        // =================================================

        if (!pedidoId) {

          this.finalizandoVenda = false;

          this.etapaProcessamento = 'erro';

          this.erro =
            'O pedido foi criado, mas o ID do pedido não foi recebido.';

          alert(this.erro);

          return;
        }

        // =================================================
        // 2. ESTOQUE
        // =================================================

        this.etapaProcessamento = 'estoque';

        console.log(
          'Pedido criado. O procedimento já atualizou o stock:',
          pedidoId
        );

        // =================================================
        // 3. FINALIZAR VENDA
        // =================================================

        this.caixaService
          .finalizarVendaCaixa(pedidoId)
          .subscribe({

            next: respostaFinalizacao => {

              console.log(
                'Venda finalizada:',
                respostaFinalizacao
              );

              // =================================================
              // 4. GERAR FATURA
              // =================================================

              this.etapaProcessamento = 'fatura';

              console.log(
                'Gerando fatura para pedido:',
                pedidoId
              );

              this.caixaService
                .gerarFatura(pedidoId)
                .subscribe({

                  next: respostaFatura => {

                    console.log(
                      'Fatura gerada:',
                      respostaFatura
                    );

                    const faturaId =
                      respostaFatura?.fatura?.id;

                    console.log(
                      'ID DA FATURA RECEBIDO:',
                      faturaId
                    );

                    // =================================================
                    // VALIDAR FATURA
                    // =================================================

                    if (!faturaId) {

                      this.finalizandoVenda = false;

                      this.etapaProcessamento = 'erro';

                      this.erro =
                        'A venda foi concluída, mas o ID da fatura não foi recebido.';

                      alert(this.erro);

                      return;
                    }

                    // =================================================
                    // VENDA CONCLUÍDA
                    // =================================================

                    this.etapaProcessamento = 'concluido';

                    this.finalizandoVenda = false;

                    this.mensagem =
                      `Venda ${numeroPedido} e fatura geradas com sucesso.`;

                    // =================================================
                    // ATUALIZAR PRODUTOS / STOCK
                    // =================================================

                    this.carregarProdutos();

                    // =================================================
                    // LIMPAR CARRINHO
                    // =================================================

                    this.carrinho = [];

                    this.clienteSelecionadoId =
                      null;

                    this.pesquisa = '';

                    this.pesquisaCliente = '';

                    // =================================================
                    // SUCESSO
                    // =================================================

                    alert(
                      `Venda concluída com sucesso!\n\n` +
                      `Pedido: ${numeroPedido}\n` +
                      `Fatura: ${respostaFatura?.fatura?.numeroFatura || faturaId}`
                    );

                    // =================================================
                    // ABRIR FATURA
                    // =================================================

                    this.router.navigate([
                      '/faturas',
                      faturaId
                    ]);

                  },

                  error: erroFatura => {

                    console.error(
                      'Erro ao gerar fatura:',
                      erroFatura
                    );

                    this.finalizandoVenda = false;

                    this.etapaProcessamento = 'erro';

                    this.erro =
                      erroFatura?.error?.mensagem ||
                      erroFatura?.error?.erro ||
                      'Venda finalizada, mas não foi possível gerar a fatura.';

                    this.mensagem =
                      `Pedido ${numeroPedido} foi criado e finalizado, mas a fatura não foi gerada.`;

                    alert(
                      `Venda ${numeroPedido} finalizada.\n\n` +
                      `Erro ao gerar fatura:\n` +
                      `${this.erro}`
                    );

                  }

                });

            },

            error: erroFinalizacao => {

              console.error(
                'Erro ao finalizar venda:',
                erroFinalizacao
              );

              this.finalizandoVenda = false;

              this.etapaProcessamento = 'erro';

              this.erro =
                erroFinalizacao?.error?.mensagem ||
                erroFinalizacao?.error?.erro ||
                'O pedido foi criado, mas não foi possível finalizar a venda.';

              alert(this.erro);

            }

          });

      },

      error: erro => {

        console.error(
          'Erro ao criar pedido:',
          erro
        );

        console.error(
          'Status:',
          erro?.status
        );

        console.error(
          'Resposta do servidor:',
          erro?.error
        );

        this.finalizandoVenda = false;

        this.etapaProcessamento = 'erro';

        this.erro =
          erro?.error?.mensagem ||
          erro?.error?.erro ||
          'Não foi possível criar a venda.';

        alert(this.erro);

      }

    });

}

  // =====================================================
  // LIMPAR CARRINHO
  // =====================================================

  limparCarrinho(): void {

    if (this.carrinho.length === 0) {
      return;
    }

    const confirmar =
      confirm(
        'Deseja limpar todos os produtos da venda?'
      );

    if (!confirmar) {
      return;
    }

    this.carrinho = [];

    this.clienteSelecionadoId = null;

    this.pesquisa = '';

    this.erro = '';

    this.mensagem = '';

  }

}