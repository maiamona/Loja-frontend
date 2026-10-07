import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  produto: string;
  tipo: string;
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

export interface EntradaEstoque {
  produtoId: number;
  tipo: 'ENTRADA';
  quantidade: number;
  motivo: string;
  pedidoId?: number | null;
}

export interface RespostaOperacao {
  sucesso: boolean;
  mensagem: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {

  private apiUrl =
    'http://localhost:3000/api/movimentacoes-estoque';

  constructor(private http: HttpClient) {}

  // =====================================================
  // LISTAR MOVIMENTAÇÕES
  // =====================================================

  listarMovimentacoes(): Observable<RespostaMovimentacoes> {

    return this.http.get<RespostaMovimentacoes>(
      this.apiUrl
    );

  }

  // =====================================================
  // BUSCAR MOVIMENTAÇÃO POR ID
  // =====================================================

  buscarMovimentacao(
    id: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );

  }

  // =====================================================
  // REGISTAR ENTRADA DE ESTOQUE
  // =====================================================

  registrarEntrada(
    dados: EntradaEstoque
  ): Observable<RespostaOperacao> {

    return this.http.post<RespostaOperacao>(
      this.apiUrl,
      dados
    );

  }

}