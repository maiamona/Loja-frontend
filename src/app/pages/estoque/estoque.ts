import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
    EstoqueService,
    MovimentacaoEstoque
} from '../../services/estoque';

import { ProdutoService } from '../../services/produto';

@Component({
    selector: 'app-estoque',
    standalone: true,

    imports: [
        CommonModule,
        FormsModule
    ],

    templateUrl: './estoque.html',
    styleUrl: './estoque.scss'
})
export class EstoqueComponent implements OnInit {

    movimentacoes: MovimentacaoEstoque[] = [];

    produtos: any[] = [];

    carregando = false;

    mensagem = '';

    erro = '';

    // =====================================================
    // FORMULÁRIO DE ENTRADA
    // =====================================================

    produtoSelecionado: number | null = null;

    quantidadeEntrada: number | null = null;

    motivoEntrada = '';

    salvandoEntrada = false;


    constructor(
        private estoqueService: EstoqueService,
        private produtoService: ProdutoService
    ) { }


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    ngOnInit(): void {

        this.carregarProdutos();

        this.carregarMovimentacoes();

    }


    // =====================================================
    // CARREGAR PRODUTOS
    // =====================================================

    carregarProdutos() {
        this.produtoService.listar().subscribe({
            next: (produtos) => {
                this.produtos = produtos;
            },
            error: (erro: any) => {
                console.error('Erro ao carregar produtos:', erro);
                this.erro = 'Não foi possível carregar os produtos.';
            }
        });
    }


    // =====================================================
    // CARREGAR MOVIMENTAÇÕES
    // =====================================================

    carregarMovimentacoes(): void {

        this.carregando = true;

        this.erro = '';

        this.estoqueService
            .listarMovimentacoes()
            .subscribe({

                next: (resposta) => {

                    this.movimentacoes =
                        resposta.movimentacoes || [];

                    this.carregando = false;

                },

                error: (erro) => {

                    console.error(
                        'Erro ao carregar movimentações:',
                        erro
                    );

                    this.erro =
                        'Não foi possível carregar as movimentações de estoque.';

                    this.carregando = false;

                }

            });

    }


    // =====================================================
    // REGISTAR ENTRADA
    // =====================================================

    registrarEntrada(): void {

        this.mensagem = '';

        this.erro = '';


        // ---------------------------------------------------
        // VALIDAÇÕES
        // ---------------------------------------------------

        if (!this.produtoSelecionado) {

            this.erro =
                'Selecione um produto.';

            return;

        }


        if (
            !this.quantidadeEntrada ||
            this.quantidadeEntrada <= 0
        ) {

            this.erro =
                'Informe uma quantidade maior que zero.';

            return;

        }


        if (
            !this.motivoEntrada ||
            this.motivoEntrada.trim() === ''
        ) {

            this.erro =
                'Informe o motivo da entrada.';

            return;

        }


        this.salvandoEntrada = true;


        // ---------------------------------------------------
        // ENVIAR PARA API
        // ---------------------------------------------------

        this.estoqueService
            .registrarEntrada({

                produtoId:
                    this.produtoSelecionado,

                tipo:
                    'ENTRADA',

                quantidade:
                    this.quantidadeEntrada,

                motivo:
                    this.motivoEntrada.trim(),

                pedidoId:
                    null

            })
            .subscribe({

                next: (resposta) => {

                    this.mensagem =
                        resposta.mensagem;

                    this.salvandoEntrada = false;


                    // Limpar formulário

                    this.produtoSelecionado = null;

                    this.quantidadeEntrada = null;

                    this.motivoEntrada = '';


                    // Atualizar dados

                    this.carregarProdutos();

                    this.carregarMovimentacoes();

                },

                error: (erro) => {

                    console.error(
                        'Erro ao registar entrada:',
                        erro
                    );

                    this.erro =
                        erro?.error?.mensagem ||
                        'Erro ao registar entrada de estoque.';

                    this.salvandoEntrada = false;

                },
                complete: () => {
                    this.salvandoEntrada = false;
                }



            });



    }


get produtosParaReposicao(): any[] {

  return this.produtos.filter(produto => {

    const estoque = Number(produto.estoque || 0);
    const minimo = Number(produto.estoqueMinimo || 0);

    return estoque <= minimo;

  });

}

prepararReposicao(produto: any): void {

  this.produtoSelecionado = produto.id;

  this.quantidadeEntrada = null;

  this.motivoEntrada = 'Reposição de estoque';

  this.mensagem = '';

  this.erro = '';

  setTimeout(() => {

    document
      .getElementById('formulario-entrada')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

  }, 100);

}

    // =====================================================
    // SITUAÇÃO DO ESTOQUE
    // =====================================================

    obterSituacao(produto: any): string {

        const estoque = Number(produto.estoque || 0);
        const minimo = Number(produto.estoqueMinimo || 0);

        if (estoque <= 0) {
            return 'Sem estoque';
        }

        if (estoque <= minimo) {
            return 'Estoque baixo';
        }

        return 'Normal';
    }


    // =====================================================
    // CLASSE DA SITUAÇÃO
    // =====================================================

    obterClasseSituacao(produto: any): string {

        const estoque = Number(produto.estoque || 0);
        const minimo = Number(produto.estoqueMinimo || 0);

        if (estoque <= 0) {
            return 'sem-estoque';
        }

        if (estoque <= minimo) {
            return 'estoque-baixo';
        }

        return 'normal';
    }

    // =====================================================
    // CONTADORES
    // =====================================================

    get totalProdutos(): number {

        return this.produtos.length;

    }


    get produtosSemEstoque(): number {

        return this.produtos.filter(
            produto =>
                Number(produto.estoque || 0) <= 0
        ).length;

    }


    get produtosEstoqueBaixo(): number {

        return this.produtos.filter(
            produto => {

                const estoque =
                    Number(produto.estoque || 0);

                const minimo =
                    Number(produto.estoqueMinimo || 0);

                return estoque > 0 &&
                    estoque <= minimo;

            }
        ).length;

    }


    get totalMovimentacoes(): number {

        return this.movimentacoes.length;

    }


    // =====================================================
    // FORMATAÇÃO DE DATA
    // =====================================================

    formatarData(data: string): string {

        if (!data) {
            return '-';
        }

        return new Date(data)
            .toLocaleString('pt-PT');

    }

}