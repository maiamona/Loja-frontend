import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FaturaService,
  Fatura
} from '../../services/fatura';

@Component({
  selector: 'app-fatura-detalhe',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './fatura-detalhe.html',
  styleUrl: './fatura-detalhe.scss'
})
export class FaturaDetalhe implements OnInit {

  fatura: Fatura | null = null;

  carregando = true;

  erro = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private faturaService: FaturaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    console.log('📄 FaturaDetalhe iniciado');

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    console.log('🆔 ID recebido pela rota:', id);

    if (!id) {

      this.erro = 'ID da fatura inválido.';

      this.carregando = false;

      this.cdr.detectChanges();

      return;
    }

    this.carregarFatura(id);
  }

  carregarFatura(id: number): void {

    console.log(
      '🔎 Buscando fatura ID:',
      id
    );

    this.carregando = true;

    this.erro = '';

    this.faturaService.obterFatura(id).subscribe({

      next: resposta => {

        console.log(
          '✅ RESPOSTA DA FATURA:',
          resposta
        );

        this.fatura = resposta.fatura;

        console.log(
          '📄 FATURA CARREGADA:',
          this.fatura
        );

        this.carregando = false;

        console.log(
          '⏳ carregando:',
          this.carregando
        );

        console.log(
          '📦 fatura:',
          this.fatura
        );

        this.cdr.detectChanges();

      },

      error: erro => {

        console.error(
          '❌ ERRO AO CARREGAR FATURA:',
          erro
        );

        this.erro =
          erro?.error?.mensagem ||
          erro?.error?.erro ||
          'Não foi possível carregar a fatura.';

        this.carregando = false;

        this.cdr.detectChanges();

      }

    });
  }

  voltar(): void {

    this.router.navigate([
      '/pedidos'
    ]);

  }

  imprimir(): void {

    window.print();

  }

}