/* eslint-disable prettier/prettier */
/* eslint-disable spaced-comment */

import { CartManager } from '@/managers/CartManager';
import { makeServer } from '@/miragejs/server';

//Gerenciador de carrinho
describe('CartManager', () => {
  let server;
  let manager;

  beforeEach(() => {
    manager = new CartManager();//crio uma nova classe de gerenciamento
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  //deve retornar o estado
  test('should return the state', () => {
    const product = server.create('product');//crio produto

    manager.open();//abro gerenci.

    manager.addProduct(product);//add produto no geren

    const state = manager.getState();//pego o estado da classe

    expect(state).toBe({//espero que o estado, seja com produtos e esteja aberto
      items: [product],
      open: true,
    });
  });

  //deve definir carro p abrir
  test('should set cart to open', () => {
    const state = manager.open();//abro o gerenciador

    expect(state.open).toBe(true);//espero que esteja aberto
  });

  //deve definir carro p fechar
  test('should set cart to closed', () => {
    const state = manager.close();

    expect(state.open).toBe(false);
  });

  //deve add produto no carro apenas 1x
  test('should add product to the cart only once', () => {
    const product = server.create('product');//crio produto no server

    manager.addProduct(product);//add produto no gerenc.

    const state = manager.addProduct(product);//vejo estado do produto add

    expect(state.items).toHaveLength(1);//espero que o estado dos itens que possue os produtos dentro tenha apenas 1 item
  });

  //deve remover produto do carrinho
  test('should remove product from the cart', () => {
    const product = server.create('product');
    const state = manager.removeProduct(product.id);//removo do gerenc. o produto pelo seu id

    expect(state.items).toHaveLength(0);//espero que tenha nada em itens
  });

  //deve limpar produtos
  test('should clear products', () => {
    const product1 = server.create('product');
    const product2 = server.create('product');
    //criei 2 produtos

    manager.addProduct(product1);
    manager.addProduct(product2);
    //add 2 produtos

    const state = manager.clearProducts();//limpei

    expect(state.items).toHaveLength(0);//espero que os itens esteja zerado
  });

  //deve limpar carrinho
  test('should clear cart', () => {
    const product1 = server.create('product');
    const product2 = server.create('product');
    //criei produtos

    manager.addProduct(product1);
    manager.addProduct(product2);
    //add produtos

    manager.open();//abri gerenc.

    const state = manager.clearCart();//limpei

    expect(state.items).toHaveLength(0);//espero que esteja zerado
    expect(state.open).toBe(false);//espero que não abra quando zerado
  });

  //deve retornar true se o carro não está vazio
  test('should return true if cart is not empty', () => {
    const product1 = server.create('product');
    const product2 = server.create('product');

    manager.addProduct(product1);
    manager.addProduct(product2);

    expect(manager.hasProducts()).toBe(true);//espero que tenhas produtos
  });

  //deve retornar true se o produto já existe no carrinho
  test('should return true if product is already in the cart', () => {
    const product = server.create('product');
    manager.addProduct(product);

    expect(manager.productIsInTheCart(product)).toBe(true);
  });
});
