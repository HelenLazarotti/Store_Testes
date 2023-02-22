/* eslint-disable prettier/prettier */
/* eslint-disable spaced-comment */

import { mount } from '@vue/test-utils';
import CartItem from '@/components/CartItem';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

describe('Item do carrinho', () => {
  let server;

  beforeEach(() => {//antes de tudo cria um server
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {//depois de tudo fecha o server
    server.shutdown();
  });

  const mountCartItem = () => {//monta o item do carrinho

    const cartManager = new CartManager();

    const product = server.create('product', {//crio produto de teste
      title: 'Lindo relogio',
      price: '22.33',
    });

    const wrapper = mount(CartItem, {//chamo componente Vue q tem o templete e monta
      propsData: {
        product, //com produto q descrevi acima
      },
      mocks: {
        $cart: cartManager,//gerencia meu car
      },
    });

    return { wrapper, product, cartManager };
  };

  //deve montar o componente
  test('should mount the component', () => {
    const { wrapper } = mountCartItem();
    expect(wrapper.vm).toBeDefined();
  });

  //deve mostrar as infos do produto
  test('should display product info', () => {
    const {
      wrapper,
      product: { title, price },
    } = mountCartItem();
    const content = wrapper.text();

    expect(content).toContain(title);
    expect(content).toContain(price);
  });

  //deve mostrar quantidade 1 quando produto é exibido pela 1° vez
  test('should display quantity 1 when product is first displayed', () => {
    const { wrapper } = mountCartItem();
    const quantity = wrapper.find('[data-testid="quantity"]');

    expect(quantity.text()).toContain('1');
  });

  //deve aumentar a quantidade quando o botão + for clicado
  test('should increase quantity when + button gets clicked', async () => {
    const { wrapper } = mountCartItem();
    const quantity = wrapper.find('[data-testid="quantity"]');
    const button = wrapper.find('[data-testid="+"]');

    await button.trigger('click');
    expect(quantity.text()).toContain('2');
    await button.trigger('click');
    expect(quantity.text()).toContain('3');
    await button.trigger('click');
    expect(quantity.text()).toContain('4');
  });

  //deve diminuir quantidade quando btn - é clicado
  test('should decrease quantity when - button gets clicked', async () => {
    const { wrapper } = mountCartItem();
    const quantity = wrapper.find('[data-testid="quantity"]');
    const button = wrapper.find('[data-testid="-"]');

    await button.trigger('click');
    expect(quantity.text()).toContain('0');
  });

  //deve não ir abaixo de 0 qnd btn - é clicado
  test('should not go below zero when button - is repeatedly clicked', async () => {
    const { wrapper } = mountCartItem();
    const quantity = wrapper.find('[data-testid="quantity"]');
    const button = wrapper.find('[data-testid="-"]');

    await button.trigger('click');
    await button.trigger('click');

    expect(quantity.text()).toContain('0');
  });

  //deve mostrar botão de remover item do carrinho
  test('should display a button to remove item from cart', () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="remove-button"]');

    expect(button.exists()).toBe(true);
  });

  //deve chamar gerencia de car e o removeProdutct quando btn é clicado
  test('should call cart manager removeProduct() when button gets clicked', async () => {
    const { wrapper, cartManager, product } = mountCartItem();
    const spy = jest.spyOn(cartManager, 'removeProduct');
    await wrapper.find('[data-testid="remove-button"]').trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(product.id);
  });
});
