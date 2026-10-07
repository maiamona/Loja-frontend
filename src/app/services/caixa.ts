import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProdutoCaixa {
  id: number;
  codigoBarras: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco: number;
  estoque: number;
  dataCadastro?: string;
}

export interface ClienteCaixa {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  dataCadastro?: string;
}

export interface ItemCaixa {
  produtoId: number;
  nome: string;
  codigoBarras: string;
  preco: number;
  quantidade: number;
  subtotal: number;
}

export interface RespostaProdutos {
  sucesso: boolean;
  total: number;
  produtos: ProdutoCaixa[];
}

export interface RespostaClientes {
  sucesso: boolean;
  total: number;
  clientes: ClienteCaixa[];
}

export interface RespostaCriarCliente {
  sucesso: boolean;
  mensagem: string;
  cliente: ClienteCaixa;
}

export interface RespostaCriarPedido {
  sucesso: boolean;
  mensagem: string;

  pedido: {
    ID: number;
    CLIENTE_ID: number | null;
    NUMERO: string;
    DATA_PEDIDO: string;
    STATUS: string;
    FORMA_PAGAMENTO: string;
    SUBTOTAL: number;
    TAXA_ENTREGA: number;
    TOTAL: number;
  };

  pedidoId: number;
  numeroPedido: string;
}

export interface RespostaFinalizarVenda {
  sucesso: boolean;
  mensagem: string;
  pedido: {
    ID: number;
    CLIENTE_ID: number | null;
    NUMERO: string;
    DATA_PEDIDO: string;
    STATUS: string;
    FORMA_PAGAMENTO: string;
    SUBTOTAL: number;
    TAXA_ENTREGA: number;
    TOTAL: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CaixaService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // =====================================================
  // PRODUTOS
  // =====================================================

  listarProdutos(): Observable<RespostaProdutos> {
    return this.http.get<RespostaProdutos>(
      `${this.apiUrl}/produtos`
    );
  }

  // =====================================================
  // CLIENTES
  // =====================================================

  listarClientes(): Observable<RespostaClientes> {
    return this.http.get<RespostaClientes>(
      `${this.apiUrl}/clientes`
    );
  }

  // =====================================================
  // CADASTRAR CLIENTE
  // =====================================================

  cadastrarCliente(dados: {
    nome: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    cidade?: string;
  }): Observable<RespostaCriarCliente> {

    return this.http.post<RespostaCriarCliente>(
      `${this.apiUrl}/clientes`,
      dados
    );
  }

  // =====================================================
  // CRIAR PEDIDO
  // =====================================================

  criarPedido(dados: {
    clienteId: number | null;
    formaPagamento: string;
    taxaEntrega: number;
    itens: {
      produtoId: number;
      quantidade: number;
    }[];
  }): Observable<RespostaCriarPedido> {

    return this.http.post<RespostaCriarPedido>(
      `${this.apiUrl}/pedidos`,
      dados
    );
  }

  finalizarVendaCaixa(
  pedidoId: number
): Observable<RespostaFinalizarVenda> {

  return this.http.post<RespostaFinalizarVenda>(
    `${this.apiUrl}/caixa/finalizar/${pedidoId}`,
    {}
  );

}

  // =====================================================
  // GERAR FATURA
  // =====================================================

  gerarFatura(pedidoId: number): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/faturas`,
      {
        pedido_id: pedidoId
      }
    );
  }
}