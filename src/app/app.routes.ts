import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard')
            .then(m => m.Dashboard)
    },
    {
        path: 'produtos',
        loadComponent: () => import('./pages/produtos/produtos')
            .then(m => m.Produtos)
    },
    {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes')
            .then(m => m.Clientes)
    },
    {
        path: 'caixa',
        loadComponent: () =>
            import('./pages/caixa/caixa')
                .then(m => m.Caixa)
    },
    {
        path: 'pedidos',
        loadComponent: () => import('./pages/pedidos/pedidos')
            .then(m => m.Pedidos)
    },
    {
        path: 'faturas',
        loadComponent: () => import('./pages/faturas/faturas')
            .then(m => m.Faturas)
    },
    {
        path: 'faturas/:id',
        loadComponent: () => import('./pages/fatura-detalhe/fatura-detalhe')
            .then(m => m.FaturaDetalhe)
    },
    {
  path: 'estoque',
  loadComponent: () =>
    import('./pages/estoque/estoque')
      .then(m => m.EstoqueComponent)
},
    {
  path: 'movimentacoes-estoque',
  loadComponent: () =>
    import('./movimentacoes-estoque/movimentacoes-estoque')
      .then(m => m.MovimentacoesEstoqueComponent)
},
    { path: '**', redirectTo: 'dashboard' }
];
