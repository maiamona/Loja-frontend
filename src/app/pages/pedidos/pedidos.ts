import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  PedidoService,
  Pedido,
  Cliente,
  Produto,
  ItemPedido
} from '../../services/pedido';

interface ItemFormulario {
  produtoId: number;
  quantidade: number;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class Pedidos implements OnInit {

  pedidos: Pedido[] = [];
  clientes: Cliente[] = [];
  produtos: Produto[] = [];

  mostrarFormulario = false;
  carregando = false;
  salvando = false;

  mensagem = '';
  erro = '';

  clienteId: number | null = null;
  formaPagamento = 'Dinheiro';
  taxaEntrega = 0;

  itens: ItemFormulario[] = [
    {
      produtoId: 0,
      quantidade: 1
    }
  ];

  constructor(private pedidoService: PedidoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregando = true;
    this.pedidos = [];
    this.carregarDados();
  }

carregarDados(): void {

  this.erro = '';
  this.carregando = true;

  // ============================
  // PEDIDOS
  // ============================

  this.pedidoService.listarPedidos().subscribe({

    next: (pedidos) => {

      console.log('Pedidos carregados:', pedidos);

      this.pedidos = pedidos;
      this.carregando = false;

      this.cdr.detectChanges();

    },

    error: (erro) => {

      console.error('Erro ao carregar pedidos:', erro);

      this.pedidos = [];
      this.carregando = false;

      this.erro =
        'Não foi possível carregar os pedidos.';

      this.cdr.detectChanges();
    }

  });


  // ============================
  // CLIENTES
  // ============================

  this.pedidoService.listarClientes().subscribe({

    next: (clientes) => {

      console.log('Clientes carregados:', clientes);

      this.clientes = clientes;

      this.cdr.detectChanges();

    },

    error: (erro) => {

      console.error(
        'Erro ao carregar clientes:',
        erro
      );

    }

  });


  // ============================
  // PRODUTOS
  // ============================

  this.pedidoService.listarProdutos().subscribe({

    next: (produtos) => {

      console.log('Produtos carregados:', produtos);

      this.produtos = produtos;

      this.cdr.detectChanges();

    },

    error: (erro) => {

      console.error(
        'Erro ao carregar produtos:',
        erro
      );

    }

  });

}

  novoPedido(): void {

    this.mostrarFormulario = true;

    this.clienteId = null;
    this.formaPagamento = 'Dinheiro';
    this.taxaEntrega = 0;

    this.itens = [
      {
        produtoId: 0,
        quantidade: 1
      }
    ];

    this.mensagem = '';
    this.erro = '';
  }

  cancelarPedido(): void {
    this.mostrarFormulario = false;
    this.mensagem = '';
    this.erro = '';
  }

  adicionarItem(): void {

    this.itens.push({
      produtoId: 0,
      quantidade: 1
    });
  }

  removerItem(index: number): void {

    if (this.itens.length === 1) {
      return;
    }

    this.itens.splice(index, 1);
  }

  obterProduto(produtoId: number): Produto | undefined {
    return this.produtos.find(
      produto => produto.id === Number(produtoId)
    );
  }

  obterPreco(produtoId: number): number {

    const produto = this.obterProduto(produtoId);

    return produto ? produto.preco : 0;
  }

  obterEstoque(produtoId: number): number {

    const produto = this.obterProduto(produtoId);

    return produto ? produto.estoque : 0;
  }

  obterSubtotalItem(item: ItemFormulario): number {

    const preco = this.obterPreco(item.produtoId);

    return preco * Number(item.quantidade || 0);
  }

  calcularSubtotal(): number {

    return this.itens.reduce(
      (total, item) => total + this.obterSubtotalItem(item),
      0
    );
  }

  calcularTotal(): number {

    return this.calcularSubtotal() + Number(this.taxaEntrega || 0);
  }

  alterarProduto(item: ItemFormulario): void {

    const produto = this.obterProduto(item.produtoId);

    if (!produto) {
      item.quantidade = 1;
      return;
    }

    if (produto.estoque <= 0) {
      item.quantidade = 0;
      return;
    }

    if (item.quantidade < 1) {
      item.quantidade = 1;
    }

    if (item.quantidade > produto.estoque) {
      item.quantidade = produto.estoque;
    }
  }

  alterarQuantidade(item: ItemFormulario): void {

    const produto = this.obterProduto(item.produtoId);

    if (!produto) {
      return;
    }

    if (item.quantidade < 1) {
      item.quantidade = 1;
    }

    if (item.quantidade > produto.estoque) {
      item.quantidade = produto.estoque;
    }
  }

  validarFormulario(): boolean {

    this.erro = '';

    if (!this.clienteId) {
      this.erro = 'Selecione um cliente.';
      return false;
    }

    if (!this.formaPagamento) {
      this.erro = 'Selecione a forma de pagamento.';
      return false;
    }

    if (this.itens.length === 0) {
      this.erro = 'Adicione pelo menos um produto.';
      return false;
    }

    for (const item of this.itens) {

      if (!item.produtoId) {
        this.erro = 'Selecione um produto em todos os itens.';
        return false;
      }

      if (item.quantidade <= 0) {
        this.erro = 'A quantidade deve ser maior que zero.';
        return false;
      }

      const produto = this.obterProduto(item.produtoId);

      if (!produto) {
        this.erro = 'Produto selecionado não encontrado.';
        return false;
      }

      if (item.quantidade > produto.estoque) {
        this.erro =
          `Estoque insuficiente para o produto "${produto.nome}". ` +
          `Disponível: ${produto.estoque}.`;

        return false;
      }
    }

    return true;
  }

  salvarPedido(): void {

    if (!this.validarFormulario()) {
      return;
    }

    this.salvando = true;
    this.erro = '';
    this.mensagem = '';

    const dados = {
      clienteId: Number(this.clienteId),
      formaPagamento: this.formaPagamento,
      taxaEntrega: Number(this.taxaEntrega || 0),
      itens: this.itens.map(item => ({
        produtoId: Number(item.produtoId),
        quantidade: Number(item.quantidade)
      }))
    };

    console.log('Enviando pedido:', dados);

    this.pedidoService.criarPedido(dados).subscribe({

      next: (resposta) => {

        console.log('PEDIDO CRIADO COM SUCESSO:', resposta);

        // Libera o botão
        this.salvando = false;

        // Fecha o formulário
        this.mostrarFormulario = false;

        // Mensagem
        this.mensagem =
          `Pedido ${resposta.numeroPedido} criado com sucesso!`;

        // Limpa formulário
        this.clienteId = null;
        this.formaPagamento = 'Dinheiro';
        this.taxaEntrega = 0;

        this.itens = [
          {
            produtoId: 0,
            quantidade: 1
          }
        ];

        // Atualiza pedidos
        this.carregarPedidos();

        // Atualiza produtos/estoque
        this.carregarProdutos();

        // Força atualização da tela
        this.cdr.detectChanges();

        console.log('salvando:', this.salvando);
        console.log('pedidos atuais:', this.pedidos.length);
      },

      error: (erro) => {

        console.error('ERRO AO CRIAR PEDIDO:', erro);

        this.salvando = false;

        this.erro =
          erro?.error?.mensagem ||
          erro?.error?.erro ||
          'Não foi possível criar o pedido.';

        this.cdr.detectChanges();
      }

    });
  }

gerarFatura(pedido: Pedido): void {

  if (!confirm(`Deseja gerar ou abrir a fatura do pedido ${pedido.NUMERO}?`)) {
    return;
  }

  console.log('Gerando/abrindo fatura para o pedido:', pedido.ID);

  this.erro = '';
  this.mensagem = '';

  this.pedidoService.gerarFatura(pedido.ID).subscribe({

    next: resposta => {

      console.log('Resposta da fatura:', resposta);

      this.router.navigate([
        '/faturas',
        resposta.fatura.id
      ]);

    },

    error: erro => {

      console.error(
        'Erro ao gerar fatura:',
        erro
      );

      this.erro =
        erro?.error?.mensagem ||
        'Não foi possível gerar ou abrir a fatura.';

    }

  });

}

  carregarPedidos(): void {

    this.pedidoService.listarPedidos().subscribe({

      next: (pedidos) => {

        console.log('Lista de pedidos atualizada:', pedidos);

        this.pedidos = pedidos;
        this.carregando = false;

        // Força atualização da interface
        this.cdr.detectChanges();

      },

      error: (erro) => {

        console.error('Erro ao atualizar pedidos:', erro);

        this.carregando = false;

        this.erro =
          'O pedido foi criado, mas não foi possível atualizar a lista.';

        this.cdr.detectChanges();
      }

    });
  }

  carregarProdutos(): void {

    this.pedidoService.listarProdutos().subscribe({

      next: produtos => {

        this.produtos = produtos;

      },

      error: erro => {

        console.error(
          'Erro ao atualizar produtos:',
          erro
        );

      }

    });

  }
}
