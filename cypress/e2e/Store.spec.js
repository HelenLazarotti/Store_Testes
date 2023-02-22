/* eslint-disable spaced-comment */
/* eslint-disable prettier/prettier */

import { makeServer } from '../../miragejs/server';

//Contexto é a loja
context('Store', () => {
  let server;
  const g = cy.get;
  const gid = cy.getByTestId;

  beforeEach(() => {//antes de tudo crio um server
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {//depois de tudo fecho ele
    server.shutdown();
  });

  //TESTES:

  //deve mostrar a loja
  test('should display the store', () => {
    cy.visit('/');

    //pega do html o body.deve conter uma Brand
    g('body').contains('Brand');
    g('body').contains('Wrist Watch');
  });

  //contexto é a loja > Carrinho de compras
  context('Store > Shopping Cart', () => {
    const quantity = 10;// defini uma qtde

    beforeEach(() => {//antes de tudo crio um server de lista para os produtos e a quantidade
      server.createList('product', quantity);
      cy.visit('/');
    });

    //TESTES

    //não deve mostrar carrinho de compras quando a página carrega
    test('should not display shopping cart when page first loads', () => {
      gid('shopping-cart').should('have.class', 'hidden');//deve estar com a classe posta de escondida
    });

    //deve esconder/mostrar o carrinho quando btn é clicado
    test('should toggle shopping cart visibility when button is clicked', () => {
      gid('toggle-button').as('toggleButton');
      g('@toggleButton').click();
      gid('shopping-cart').should('not.have.class', 'hidden');
      g('@toggleButton').click({ force: true });
      gid('shopping-cart').should('have.class', 'hidden');
    });

    //não deve mostrar o btn'Limpar carro', quando carro estiver vazio
    test('should not display "Clear cart" button when cart is empty', () => {
      gid('toggle-button').as('toggleButton');
      g('@toggleButton').click();
      gid('clear-cart-button').should('not.be.visible');
    });

    //deve mostrar msg 'Carro está vazio' quando não tiver produtos
    test('should display "Cart is empty" message when there are no products', () => {
      gid('toggle-button').as('toggleButton');
      g('@toggleButton').click();
      gid('shopping-cart').contains('Cart is empty');
    });

    //deve abrir carrinho de compras quando um produto é add
    test('should open shopping cart when a product is added', () => {
      gid('product-card').first().find('button').click();
      gid('shopping-cart').should('not.have.class', 'hidden');
    });

    //deve add 1° produto no carrinho
    test('should add first product to the cart', () => {
      gid('product-card').first().find('button').click();
      gid('cart-item').should('have.length', 1);
    });

    //deve add 3 produtos no carro
    test('should add 3 products to the cart', () => {
      cy.addToCart({ indexes: [1, 3, 5] });

      gid('cart-item').should('have.length', 3);
    });

    //deve add 1 produto no carro
    test('should add 1 product to the cart', () => {
      cy.addToCart({ index: 6 });

      gid('cart-item').should('have.length', 1);
    });

    //deve add todos produtos no carro
    test('should add all products to the cart', () => {
      cy.addToCart({ indexes: 'all' });

      gid('cart-item').should('have.length', quantity);
    });

    //deve mostrar quantidade 1 quando produto é add no carro
    test('should display quantity 1 when product is added to cart', () => {
      cy.addToCart({ index: 1 });
      gid('quantity').contains(1);
    });

    //deve aumentar quantidade quando btn + for clicado
    test('should increase quantity when button + gets clicked', () => {
      cy.addToCart({ index: 1 });
      gid('+').click();
      gid('quantity').contains(2);
      gid('+').click();
      gid('quantity').contains(3);
    });

    //deve diminuit qtde quando btn - for clicado
    test('should decrease quantity when button - gets clicked', () => {
      cy.addToCart({ index: 1 });
      gid('+').click();
      gid('+').click();
      gid('quantity').contains(3);
      gid('-').click();
      gid('quantity').contains(2);
      gid('-').click();
      gid('quantity').contains(1);
    });

    //não deve diminuir abaixo de 0, qnd btn - for clicado
    test('should not decrease below zero when button - gets clicked', () => {
      cy.addToCart({ index: 1 });
      gid('-').click();
      gid('-').click();
      gid('quantity').contains(0);
    });

    //deve remover o produto do carro
    test('should remove a product from cart', () => {
      cy.addToCart({ index: 2 });

      gid('cart-item').as('cartItems');
      g('@cartItems').should('have.length', 1);
      g('@cartItems').first().find('[data-testid="remove-button"]').click();
      g('@cartItems').should('have.length', 0);
    });

    //deve limpar carro quando btn 'ClearCart ser clicado
    test('should clear cart when "Clear cart" button is clicked', () => {
      cy.addToCart({ indexes: [1, 2, 3] });

      gid('cart-item').should('have.length', 3);
      gid('clear-cart-button').click();
      gid('cart-item').should('have.length', 0);
    });
  });

  //contexto é loja -> Lista de produtos
  context('Store > Product List', () => {

    //TESTES:

    //deve mostrar '0 produtos' quando nenhum produto é retornado
    test('should display "0 Products" when no product is returned', () => {
      cy.visit('/');
      gid('product-card').should('have.length', 0);
      g('body').contains('0 Products');
    });

    //deve mostrar '1 produto' quando ' produto é retornado
    test('should display "1 Product" when 1 product is returned', () => {
      server.create('product');

      cy.visit('/');
      gid('product-card').should('have.length', 1);
      g('body').contains('1 Product');
    });

    //deve mostrar 10 produtos qnd 10 produtos são retornados
    test('should display "10 Products" when 10 products are returned', () => {
      server.createList('product', 10);

      cy.visit('/');
      gid('product-card').should('have.length', 10);
      g('body').contains('10 Products');
    });
  });

  //contexto loja -> Procurar por produtos
  context('Store > Search for Products', () => {

    //TESTES

    //deve digitar no campo de pesquisa
    test('should type in the search field', () => {
      cy.visit('/');

      g('input[type="search"]')
        .type('Some text here')
        .should('have.value', 'Some text here');
    });

    //deve retornar 1 produto quando 'Relógio bon..' é usado como termo de pesquisa.
    test('should return 1 product when "Relógio bonito" is used as search term', () => {
      server.create('product', {
        title: 'Relógio bonito',
      });
      server.createList('product', 10);

      cy.visit('/');
      g('input[type="search"]').type('Relógio bonito');
      gid('search-form').submit();
      gid('product-card').should('have.length', 1);
    });

    //não deve retornar nenhum produto
    test('should not return any product', () => {
      server.createList('product', 10);

      cy.visit('/');
      g('input[type="search"]').type('Relógio bonito');
      gid('search-form').submit();
      gid('product-card').should('have.length', 0);
      g('body').contains('0 Products');
    });
  });
});
