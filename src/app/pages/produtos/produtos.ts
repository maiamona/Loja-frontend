import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Produto,
  ProdutoService
} from '../../services/produto';

@Component({
  selector: 'app-produtos',
  imports: [
    DecimalPipe,
    FormsModule
  ],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss'
})
export class Produtos implements OnInit {

  // =====================================================
  // LISTA DE PRODUTOS
  // =====================================================

  produtos = signal<Produto[]>([]);

  // =====================================================
  // CARREGAMENTO
  // =====================================================

  carregando = signal(true);

  // =====================================================
  // ERRO
  // =====================================================

  erro = signal('');

  // =====================================================
  // FORMULÁRIO
  // =====================================================

  mostrarFormulario = signal(false);

  cadastrandoProduto = signal(false);

  mensagemCadastro = signal('');

  // =====================================================
  // NOVO PRODUTO
  // =====================================================

  novoProduto = {
    codigoBarras: '',
    nome: '',
    descricao: '',
    categoria: '',
    preco: null as number | null,
    estoque: null as number | null
  };

  // =====================================================
  // IMAGEM DO NOVO PRODUTO
  // =====================================================

  imagemNovoProduto = signal<File | null>(null);

  // =====================================================
  // NOME DA IMAGEM NOVA
  // =====================================================

  nomeImagemNovoProduto = signal('');

  // =====================================================
  // IMAGEM SELECIONADA PARA PRODUTO EXISTENTE
  // =====================================================

  imagemSelecionada = signal<File | null>(null);

  produtoImagemId = signal<number | null>(null);

  enviandoImagem = signal(false);

  mensagemImagem = signal('');

  // =====================================================
  // ATUALIZAR URL DA IMAGEM
  // =====================================================

  versaoImagem = signal(Date.now());

  // =====================================================
  // CONSTRUTOR
  // =====================================================

  constructor(
    private produtoService: ProdutoService
  ) {}

  // =====================================================
  // NG ON INIT
  // =====================================================

  ngOnInit(): void {

    this.carregarProdutos();

  }

  // =====================================================
  // CARREGAR PRODUTOS
  // =====================================================

  carregarProdutos(): void {

    console.log(
      'Iniciando carregamento dos produtos...'
    );

    this.produtoService.listar().subscribe({

      next: (dados: Produto[]) => {

        console.log(
          'Produtos recebidos:',
          dados
        );

        this.produtos.set(dados);

        this.carregando.set(false);

      },

      error: (erro) => {

        console.error(
          'Erro ao carregar produtos:',
          erro
        );

        this.erro.set(
          'Não foi possível carregar os produtos.'
        );

        this.carregando.set(false);

      }

    });

  }

  // =====================================================
  // ABRIR FORMULÁRIO
  // =====================================================

  abrirFormulario(): void {

    this.limparFormulario();

    this.mensagemCadastro.set('');

    this.mostrarFormulario.set(true);

  }

  // =====================================================
  // FECHAR FORMULÁRIO
  // =====================================================

  fecharFormulario(): void {

    if (this.cadastrandoProduto()) {

      return;

    }

    this.mostrarFormulario.set(false);

    this.limparFormulario();

  }

  // =====================================================
  // LIMPAR FORMULÁRIO
  // =====================================================

  limparFormulario(): void {

    this.novoProduto = {

      codigoBarras: '',
      nome: '',
      descricao: '',
      categoria: '',
      preco: null,
      estoque: null

    };

    this.imagemNovoProduto.set(null);

    this.nomeImagemNovoProduto.set('');

    this.mensagemCadastro.set('');

  }

  // =====================================================
  // SELECIONAR IMAGEM DO NOVO PRODUTO
  // =====================================================

  selecionarImagemNovoProduto(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.imagemNovoProduto.set(null);

      this.nomeImagemNovoProduto.set('');

      return;

    }

    const arquivo =
      input.files[0];

    // -----------------------------------------------------
    // VERIFICAR TIPO
    // -----------------------------------------------------

    if (
      !arquivo.type.startsWith('image/')
    ) {

      this.imagemNovoProduto.set(null);

      this.nomeImagemNovoProduto.set('');

      this.mensagemCadastro.set(
        'Selecione apenas arquivos de imagem.'
      );

      input.value = '';

      return;

    }

    // -----------------------------------------------------
    // TAMANHO MÁXIMO: 5 MB
    // -----------------------------------------------------

    const tamanhoMaximo =
      5 * 1024 * 1024;

    if (
      arquivo.size > tamanhoMaximo
    ) {

      this.imagemNovoProduto.set(null);

      this.nomeImagemNovoProduto.set('');

      this.mensagemCadastro.set(
        'A imagem não pode ultrapassar 5 MB.'
      );

      input.value = '';

      return;

    }

    // -----------------------------------------------------
    // GUARDAR IMAGEM
    // -----------------------------------------------------

    this.imagemNovoProduto.set(
      arquivo
    );

    this.nomeImagemNovoProduto.set(
      arquivo.name
    );

    this.mensagemCadastro.set('');

    console.log(
      'Imagem do novo produto:',
      arquivo.name
    );

  }

  // =====================================================
  // CADASTRAR NOVO PRODUTO
  // =====================================================

  cadastrarProduto(): void {

    // -----------------------------------------------------
    // CÓDIGO DE BARRAS
    // -----------------------------------------------------

    if (
      !this.novoProduto.codigoBarras.trim()
    ) {

      this.mensagemCadastro.set(
        'Informe o código de barras.'
      );

      return;

    }

    // -----------------------------------------------------
    // NOME
    // -----------------------------------------------------

    if (
      !this.novoProduto.nome.trim()
    ) {

      this.mensagemCadastro.set(
        'Informe o nome do produto.'
      );

      return;

    }

    // -----------------------------------------------------
    // CATEGORIA
    // -----------------------------------------------------

    if (
      !this.novoProduto.categoria.trim()
    ) {

      this.mensagemCadastro.set(
        'Informe a categoria.'
      );

      return;

    }

    // -----------------------------------------------------
    // PREÇO
    // -----------------------------------------------------

    if (
      this.novoProduto.preco === null ||
      this.novoProduto.preco < 0
    ) {

      this.mensagemCadastro.set(
        'Informe um preço válido.'
      );

      return;

    }

    // -----------------------------------------------------
    // ESTOQUE
    // -----------------------------------------------------

    if (
      this.novoProduto.estoque === null ||
      this.novoProduto.estoque < 0
    ) {

      this.mensagemCadastro.set(
        'Informe um estoque válido.'
      );

      return;

    }

    // -----------------------------------------------------
    // IMAGEM OBRIGATÓRIA
    // -----------------------------------------------------

    const imagem =
      this.imagemNovoProduto();

    if (!imagem) {

      this.mensagemCadastro.set(
        'Selecione uma imagem para o produto.'
      );

      return;

    }

    // -----------------------------------------------------
    // OBJETO DO PRODUTO
    // -----------------------------------------------------

    const produto = {

      codigoBarras:
        this.novoProduto.codigoBarras.trim(),

      nome:
        this.novoProduto.nome.trim(),

      descricao:
        this.novoProduto.descricao.trim(),

      categoria:
        this.novoProduto.categoria.trim(),

      preco:
        this.novoProduto.preco,

      estoque:
        this.novoProduto.estoque

    };

    console.log(
      'Cadastrando produto:',
      produto
    );

    // -----------------------------------------------------
    // INICIAR CADASTRO
    // -----------------------------------------------------

    this.cadastrandoProduto.set(true);

    this.mensagemCadastro.set(
      'Cadastrando produto...'
    );

    // =====================================================
    // 1º PASSO:
    // CADASTRAR PRODUTO
    // =====================================================

    this.produtoService
      .cadastrar(produto)
      .subscribe({

        next: (resposta) => {

          console.log(
            'Resposta do cadastro:',
            resposta
          );

          if (!resposta.sucesso) {

            this.mensagemCadastro.set(
              resposta.mensagem ||
              'Não foi possível cadastrar o produto.'
            );

            this.cadastrandoProduto.set(false);

            return;

          }

          // -------------------------------------------------
          // PEGAR PRODUTO CRIADO
          // -------------------------------------------------

          const produtoCriado =
            resposta.produto;

          if (!produtoCriado) {

            this.mensagemCadastro.set(
              'Produto cadastrado, mas o ID não foi retornado.'
            );

            this.cadastrandoProduto.set(false);

            this.carregarProdutos();

            return;

          }

          console.log(
            'Produto criado com ID:',
            produtoCriado.id
          );

          // =================================================
          // 2º PASSO:
          // ENVIAR IMAGEM
          // =================================================

          this.mensagemCadastro.set(
            'Produto cadastrado. Enviando imagem...'
          );

          this.produtoService
            .enviarImagem(
              produtoCriado.id,
              imagem
            )
            .subscribe({

              next: (respostaImagem) => {

                console.log(
                  'Resposta da imagem:',
                  respostaImagem
                );

                if (
                  respostaImagem.sucesso
                ) {

                  this.mensagemCadastro.set(
                    'Produto e imagem cadastrados com sucesso!'
                  );

                  // ------------------------------------------------
                  // ATUALIZAR LISTA
                  // ------------------------------------------------

                  this.carregarProdutos();

                  // ------------------------------------------------
                  // ATUALIZAR CACHE DA IMAGEM
                  // ------------------------------------------------

                  this.versaoImagem.set(
                    Date.now()
                  );

                  // ------------------------------------------------
                  // FECHAR DEPOIS DE 1 SEGUNDO
                  // ------------------------------------------------

                  setTimeout(() => {

                    this.mostrarFormulario.set(false);

                    this.limparFormulario();

                  }, 1000);

                }
                else {

                  this.mensagemCadastro.set(
                    'Produto cadastrado, mas houve um erro ao enviar a imagem.'
                  );

                  this.carregarProdutos();

                }

                this.cadastrandoProduto.set(false);

              },

              error: (erroImagem) => {

                console.error(
                  'Erro ao enviar imagem:',
                  erroImagem
                );

                this.mensagemCadastro.set(
                  'Produto cadastrado, mas não foi possível enviar a imagem.'
                );

                this.carregarProdutos();

                this.cadastrandoProduto.set(false);

              }

            });

        },

        error: (erro) => {

          console.error(
            'Erro ao cadastrar produto:',
            erro
          );

          this.mensagemCadastro.set(
            erro?.error?.mensagem ||
            'Erro ao cadastrar o produto.'
          );

          this.cadastrandoProduto.set(false);

        }

      });

  }

  // =====================================================
  // SELECIONAR IMAGEM DE PRODUTO EXISTENTE
  // =====================================================

  selecionarImagem(
    event: Event,
    produtoId: number
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }

    const arquivo =
      input.files[0];

    if (
      !arquivo.type.startsWith('image/')
    ) {

      this.mensagemImagem.set(
        'Selecione apenas arquivos de imagem.'
      );

      return;

    }

    const tamanhoMaximo =
      5 * 1024 * 1024;

    if (
      arquivo.size > tamanhoMaximo
    ) {

      this.mensagemImagem.set(
        'A imagem não pode ultrapassar 5 MB.'
      );

      return;

    }

    this.imagemSelecionada.set(
      arquivo
    );

    this.produtoImagemId.set(
      produtoId
    );

    this.mensagemImagem.set('');

  }

  // =====================================================
  // ENVIAR IMAGEM DE PRODUTO EXISTENTE
  // =====================================================

  enviarImagem(): void {

    const arquivo =
      this.imagemSelecionada();

    const produtoId =
      this.produtoImagemId();

    if (!arquivo) {

      this.mensagemImagem.set(
        'Selecione uma imagem primeiro.'
      );

      return;

    }

    if (produtoId === null) {

      this.mensagemImagem.set(
        'Produto não identificado.'
      );

      return;

    }

    this.enviandoImagem.set(true);

    this.mensagemImagem.set(
      'Enviando imagem...'
    );

    this.produtoService
      .enviarImagem(
        produtoId,
        arquivo
      )
      .subscribe({

        next: (resposta) => {

          if (resposta.sucesso) {

            this.mensagemImagem.set(
              'Imagem enviada com sucesso!'
            );

            this.versaoImagem.set(
              Date.now()
            );

            this.imagemSelecionada.set(null);

            this.produtoImagemId.set(null);

          }
          else {

            this.mensagemImagem.set(
              resposta.mensagem ||
              'Não foi possível enviar a imagem.'
            );

          }

          this.enviandoImagem.set(false);

        },

        error: (erro) => {

          console.error(
            'Erro ao enviar imagem:',
            erro
          );

          this.mensagemImagem.set(
            'Erro ao enviar a imagem para o servidor.'
          );

          this.enviandoImagem.set(false);

        }

      });

  }

  // =====================================================
  // URL DA IMAGEM
  // =====================================================

  obterUrlImagem(
    produtoId: number
  ): string {

    return (
      this.produtoService
        .obterUrlImagem(produtoId) +
      '?v=' +
      this.versaoImagem()
    );

  }

  // =====================================================
  // CANCELAR IMAGEM
  // =====================================================

  cancelarImagem(): void {

    this.imagemSelecionada.set(null);

    this.produtoImagemId.set(null);

    this.mensagemImagem.set('');

  }

}