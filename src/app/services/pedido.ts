import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
}

export interface Produto {
  id: number;
  codigoBarras: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco: number;
  estoque: number;
  dataCadastro?: string;
}

export interface ItemPedido {
  produtoId: number;
  quantidade: number;
}

export interface Pedido {
  ID: number;
  CLIENTE_ID: number;
  NUMERO: string;
  DATA_PEDIDO: string;
  STATUS: string;
  FORMA_PAGAMENTO: string;
  SUBTOTAL: number;
  TAXA_ENTREGA: number;
  TOTAL: number;
}

export interface RespostaClientes {
  sucesso: boolean;
  total: number;
  clientes: Cliente[];
}

export interface RespostaProdutos {
  sucesso: boolean;
  total: number;
  produtos: Produto[];
}

export interface RespostaPedidos {
  sucesso: boolean;
  total: number;
  pedidos: Pedido[];
}

export interface RespostaCriarPedido {
  sucesso: boolean;
  mensagem: string;
  pedido: Pedido;
  pedidoId: number;
  numeroPedido: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  listarPedidos(): Observable<Pedido[]> {
    return this.http
      .get<RespostaPedidos>(`${this.apiUrl}/pedidos`)
      .pipe(
        map(resposta => resposta.pedidos)
      );
  }

  listarClientes(): Observable<Cliente[]> {
    return this.http
      .get<RespostaClientes>(`${this.apiUrl}/clientes`)
      .pipe(
        map(resposta => resposta.clientes)
      );
  }

  listarProdutos(): Observable<Produto[]> {
    return this.http
      .get<RespostaProdutos>(`${this.apiUrl}/produtos`)
      .pipe(
        map(resposta => resposta.produtos)
      );
  }

  criarPedido(dados: {
    clienteId: number;
    formaPagamento: string;
    taxaEntrega: number;
    itens: ItemPedido[];
  }): Observable<RespostaCriarPedido> {

    return this.http.post<RespostaCriarPedido>(
      `${this.apiUrl}/pedidos`,
      dados
    );
  }

  gerarFatura(pedidoId: number): Observable<any> {

  return this.http.post(
    'http://localhost:3000/api/faturas',
    {
      pedido_id: pedidoId
    }
  );

}

buscarFaturaPorPedido(pedidoId: number): Observable<any> {

  return this.http.get(
    `http://localhost:3000/api/faturas/pedido/${pedidoId}`
  );

}
}