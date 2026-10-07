import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Produto {

  id: number;
  codigoBarras: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  estoque: number;
  estoqueMinimo: number;
  dataCadastro: string;
  imagem?: string;

}

interface RespostaProdutos {

  sucesso: boolean;
  total: number;
  produtos: Produto[];

}

export interface NovoProduto {

  codigoBarras: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  estoque: number;

}

export interface RespostaCadastroProduto {

  sucesso: boolean;
  mensagem: string;
  produto?: Produto;

}

export interface RespostaImagem {

  sucesso: boolean;
  mensagem: string;
  produtoId: number;
  nomeProduto?: string;
  nomeArquivo?: string;
  tipo?: string;
  tamanho?: number;
  erro?: string;

}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  private apiUrl =
    'http://localhost:3000/api/produtos';

  constructor(
    private http: HttpClient
  ) {}

  // =====================================================
  // LISTAR
  // =====================================================

  listar(): Observable<Produto[]> {

    return this.http
      .get<RespostaProdutos>(this.apiUrl)
      .pipe(
        map(
          resposta => resposta.produtos
        )
      );

  }

  // =====================================================
  // CADASTRAR
  // =====================================================

  cadastrar(
    produto: NovoProduto
  ): Observable<RespostaCadastroProduto> {

    return this.http.post<RespostaCadastroProduto>(
      this.apiUrl,
      produto
    );

  }

  // =====================================================
  // ENVIAR IMAGEM
  // =====================================================

  enviarImagem(
    produtoId: number,
    arquivo: File
  ): Observable<RespostaImagem> {

    const formData =
      new FormData();

    formData.append(
      'imagem',
      arquivo
    );

    return this.http.post<RespostaImagem>(
      `${this.apiUrl}/${produtoId}/imagem`,
      formData
    );

  }

  // =====================================================
  // URL DA IMAGEM
  // =====================================================

  obterUrlImagem(
    produtoId: number
  ): string {

    return `${this.apiUrl}/${produtoId}/imagem`;

  }

}