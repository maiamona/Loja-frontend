import {
  Component, OnInit, inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  MovimentacaoEstoque,
  MovimentacaoEstoqueService
} from '../services/movimentacao-estoque';

@Component({
  selector: 'app-movimentacoes-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimentacoes-estoque.html',
  styleUrl: './movimentacoes-estoque.scss'
})
export class MovimentacoesEstoqueComponent implements OnInit {

  private movimentacaoService = inject(
    MovimentacaoEstoqueService
  );

  private cdr = inject(ChangeDetectorRef);

  movimentacoes: MovimentacaoEstoque[] = [];

  carregando = false;
  erro = '';
  filtroProduto = '';
  filtroTipo = 'TODOS';

  ngOnInit(): void {
    this.carregarMovimentacoes();
  }

  carregarMovimentacoes(): void {

    this.carregando = true;
    this.erro = '';

    console.log('A consultar API de movimentações...');

    this.movimentacaoService.listar()
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
          console.log('Consulta finalizada.');
        })
      )
      .subscribe({

        next: (resposta) => {

          console.log(
            'Resposta recebida da API:',
            resposta
          );

          if (
            resposta &&
            resposta.sucesso &&
            Array.isArray(resposta.movimentacoes)
          ) {

            this.movimentacoes =
              resposta.movimentacoes;

            console.log(
              'Total de movimentações:',
              this.movimentacoes.length
            );
            this.cdr.detectChanges();
          } else {

            console.warn(
              'Resposta inválida da API:',
              resposta
            );

            this.erro =
              'Não foi possível carregar as movimentações.';
          }
        },

        error: (erro) => {

          console.error(
            'Erro ao carregar movimentações:',
            erro
          );

          this.erro =
            'Erro de comunicação com o servidor.';
        }
      });
  }

  get movimentacoesFiltradas(): MovimentacaoEstoque[] {

  return this.movimentacoes.filter((movimentacao) => {

    const correspondeProduto =
      movimentacao.produto
        .toLowerCase()
        .includes(this.filtroProduto.toLowerCase());

    const correspondeTipo =
      this.filtroTipo === 'TODOS' ||
      movimentacao.tipo === this.filtroTipo;

    return correspondeProduto && correspondeTipo;
  });
}

limparFiltros(): void {
  this.filtroProduto = '';
  this.filtroTipo = 'TODOS';
}

  obterClasseTipo(tipo: string): string {

    switch (tipo) {

      case 'ENTRADA':
        return 'badge bg-success';

      case 'SAIDA':
        return 'badge bg-danger';

      case 'AJUSTE':
        return 'badge bg-warning text-dark';

      case 'DEVOLUCAO':
        return 'badge bg-info text-dark';

      default:
        return 'badge bg-secondary';
    }
  }

  obterNomeTipo(tipo: string): string {

    switch (tipo) {

      case 'ENTRADA':
        return 'Entrada';

      case 'SAIDA':
        return 'Saída';

      case 'AJUSTE':
        return 'Ajuste';

      case 'DEVOLUCAO':
        return 'Devolução';

      default:
        return tipo;
    }
  }

  formatarData(data: string): string {

    return new Date(data).toLocaleString('pt-PT');
  }
}