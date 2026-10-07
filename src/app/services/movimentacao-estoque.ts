import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  produto: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO';
  quantidade: number;
  estoqueAnterior: number;
  estoqueAtual: number;
  motivo: string;
  pedidoId: number | null;
  pedido: string | null;
  dataMovimentacao: string;
}

export interface RespostaMovimentacoes {
  sucesso: boolean;
  total: number;
  movimentacoes: MovimentacaoEstoque[];
}

@Injectable({
  providedIn: 'root'
})
export class MovimentacaoEstoqueService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:3000/api/movimentacoes-estoque';

  listar(): Observable<RespostaMovimentacoes> {
    return this.http.get<RespostaMovimentacoes>(
      this.apiUrl
    );
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );
  }
}
