import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface ItemFatura {
    ITEM_ID: number;
    PRODUTO_ID: number;
    PRODUTO: string;
    QUANTIDADE: number;
    PRECO_UNITARIO: number;
    SUBTOTAL: number;
}
export interface Fatura {
    id: number;
    numero_fatura: string;
    data_emissao: string;
    status: string;
    pedido: {
        id: number;
        numero: string;
        data: string;
        status: string;
    };
    cliente: {
        id: number;
        nome: string;
        telefone?: string;
        email?: string;
        endereco?: string;
        cidade?: string;
    };
    itens: ItemFatura[];
    valores: {
        subtotal: number;
        taxa_entrega: number;
        total: number;
    };
    forma_pagamento: string;
}
export interface RespostaFatura {
    sucesso: boolean;
    mensagem?: string;
    fatura: {
        id: number;
        pedido_id: number;
        numero_fatura: string;
    };
}
export interface RespostaFaturaDetalhe {
    sucesso: boolean;
    mensagem?: string;
    fatura: Fatura;
}
@Injectable({
    providedIn: 'root'
})
export class FaturaService {
    private apiUrl = 'http://localhost:3000/api/faturas';
    constructor(private http: HttpClient) { }
    /** * Gera uma nova fatura para um pedido. */
    gerarFatura(pedidoId: number): Observable<RespostaFatura> {
        return this.http.post<RespostaFatura>(this.apiUrl,
            {
                pedido_id: pedidoId
            });
    }
    /** * Obtém os detalhes de uma fatura pelo ID. */
    obterFatura(id: number): Observable<RespostaFaturaDetalhe> {
        return this.http.get<RespostaFaturaDetalhe>(`${this.apiUrl}/${id}`);
    }
    /** * Procura a fatura associada a um pedido. */
    buscarFaturaPorPedido(pedidoId: number): Observable<RespostaFaturaDetalhe> {
        return this.http.get<RespostaFaturaDetalhe>(`${this.apiUrl}/pedido/${pedidoId}`);
    }
}