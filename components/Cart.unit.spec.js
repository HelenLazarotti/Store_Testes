/* eslint-disable prettier/prettier */
/* eslint-disable spaced-comment */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import Cart from '@/components/Cart';
import CartItem from '@/components/CartItem';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

describe('Carrinho', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  const mountCart = () => {
    const products = server.createList('product', 2);//crio uma lista produto, com 2 itens???

    const cartManager = new CartManager();

    const wrapper = mount(Cart, {
      propsData: {
        products,
      },
      mocks: {
        $cart: cartManager,
      },
    });

    return { wrapper, products, cartManager };
  };

  //deve montar um componente
  test('should mount the component', () => {
    const { wrapper } = mountCart();

    expect(wrapper.vm).toBeDefined();
  });

  //deve não exibir o botão de carrinho vazio quando não há produtos
  test('should not display empty cart button when there are no products', () => {
    const { cartManager } = mountCart();

    const wrapper = mount(Cart, {
      mocks: {
        $cart: cartManager,
      },
    });

    expect(wrapper.find('[data-testid="clear-cart-button"]').exists()).toBe(false);
  });

  //deve emitir evento de fechar quando btn for clicado
  test('should emit close event when button gets clicked', async () => {
    const { wrapper } = mountCart();
    const button = wrapper.find('[data-testid="close-button"]');

    await button.trigger('click');

    expect(wrapper.emitted().close).toBeTruthy();
    expect(wrapper.emitted().close).toHaveLength(1);
  });

  //deve esconder o carrinho quando nenhuma props 'isOpen' é passada
  test('should hide the cart when no prop isOpen is passed', () => {
    const { wrapper } = mountCart();

    expect(wrapper.classes()).toContain('hidden');
  });

  //deve mostrar o carrinho quando a props isOpen é passada
  test('should display the cart when prop isOpen is passed', async () => {
    const { wrapper } = mountCart();

    await wrapper.setProps({
      isOpen: true,
    });

    expect(wrapper.classes()).not.toContain('hidden');
  });

  //deve mostrar 'Carrinho está vazio" quando não tiver produtos
  test('should display "Cart is empty" when there are no products', async () => {
    const { wrapper } = mountCart();

    wrapper.setProps({
      products: [],
    });

    await Vue.nextTick();//uso qnd precisa manipular o DOM(HTML) com uma ação não relacionada à reatividade o Vue ou ao seu ciclo de vida.

    expect(wrapper.text()).toContain('Cart is empty');
  });

  //deve mostrar 2 instancias do CartItem quando 2 produtos são fornecidos
  test('should display 2 instances of CartItem when 2 products are provided', () => {
    const { wrapper } = mountCart();

    expect(wrapper.findAllComponents(CartItem)).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Cart is empty');
  });

  //deve mostrar um btn para limpar carrinho
  test('should display a button to clear cart', () => {
    const { wrapper } = mountCart();
    const button = wrapper.find('[data-testid="clear-cart-button"]');

    expect(button.exists()).toBe(true);
  });

  //deve chamar gerenciador de carrinho -> clearProdutos quando btn é clicado
  test('should call cart manager clearProducts() when button gets clicked', async () => {
    const { wrapper, cartManager } = mountCart();
    const spy = jest.spyOn(cartManager, 'clearProducts');
    await wrapper.find('[data-testid="clear-cart-button"]').trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
  });

  //deve mostrar um input do tipo email quando tiver itens no carrinho
  test('should display an input type e-mail when there are items in the cart', () => {
    const { wrapper } = mountCart();
    const input = wrapper.find('input[type="email"]');

    expect(input.exists()).toBe(true);
  });

  //deve esconder o input tipo email quando não tiver itens no carro
  test('should hide the input type e-mail when there are NO items in the cart', async () => {
    const { wrapper } = mountCart();

    wrapper.setProps({
      products: [],
    });

    await Vue.nextTick();

    const input = wrapper.find('input[type="email"]');

    expect(input.exists()).toBe(false);
  });

  //deve emitir evento de checkout e enviar email quando o btn checkout é clicado
  test('should emit checkout event and send email when checkout button is clicked', async () => {
    const { wrapper } = mountCart();
    const form = wrapper.find('[data-testid="checkout-form"]');
    const input = wrapper.find('input[type="email"]');
    const email = 'helen@email.com';

    input.setValue(email);

    await form.trigger('submit');

    expect(wrapper.emitted().checkout).toBeTruthy();
    expect(wrapper.emitted().checkout).toHaveLength(1);
    expect(wrapper.emitted().checkout[0][0]).toEqual({
      email,
    });
  });

  //NÃO deve emitir evento checkout quando input email é vazio
  test('should NOT emit checkout event when input email is empty', async () => {
    const { wrapper } = mountCart();
    const button = wrapper.find('[data-testid="checkout-button"]');

    await button.trigger('click');

    expect(wrapper.emitted().checkout).toBeFalsy();
  });
});
