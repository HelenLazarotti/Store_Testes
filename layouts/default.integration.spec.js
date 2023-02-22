/* eslint-disable prettier/prettier */
/* eslint-disable spaced-comment */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import axios from 'axios';
import DefaultLayout from '@/layouts/default';
import Cart from '@/components/Cart';
import { CartManager } from '@/managers/CartManager';
import { makeServer } from '@/miragejs/server';

jest.mock('axios', () => ({
  post: jest.fn(() => ({ order: { id: 111 } })),
  setHeader: jest.fn(),
}));

const cartManager = new CartManager();

function mountComponent(
  providedCartManager = cartManager,
  providedAxios = axios
) {
  return mount(DefaultLayout, {
    mocks: {
      $cart: providedCartManager,
      $axios: providedAxios,
    },
    stubs: {
      Nuxt: true,
    },
  });
}

//Layout Padrão
describe('Default Layout', () => {
  let server;
  let products;

  beforeEach(() => {//antes de tudo
    server = makeServer({ environment: 'test' });
    products = server.createList('product', 2);
  });

  afterEach(() => {//depois de tudo
    server.shutdown();
    jest.clearAllMocks();
  });

  //deve definir o header do email no axios quando o carro emitir o evento checkout
  test('should set email header on Axios when Cart emmits checkout event', async () => {
    const wrapper = mountComponent();//monta componente

    const cartComponent = wrapper.findComponent(Cart).vm;//encontra componente carro

    const email = 'helen.lazarotti@gmail.com';//email aleatório

    await cartComponent.$emit('checkout', { email });//espera o componente emitir checkout, pra colocar email

    expect(axios.setHeader).toHaveBeenCalledTimes(1);//espera que seja chamado 1x

    expect(axios.setHeader).toHaveBeenCalledWith('email', email);//e que seja chamado com o email
  });

  //deve chamar axios.post com o endpoint certo e mandar os produtos
  test('should call Axios.post with the right endpoint and send products', async () => {
    jest.spyOn(cartManager, 'getState').mockReturnValue({
      items: products,
    });//espia ai o gerencia carro, pega o estado dele, retorna o valor, com base nos itens do carro

    jest.spyOn(cartManager, 'clearProducts');//espia o gerenciador de limpar produtos

    const wrapper = mountComponent(cartManager);//monto componente, de param o gerenciador

    const cartComponent = wrapper.findComponent(Cart).vm;////encontra componente carro

    const email = 'helen.lazarotti@gmail.com';

    await cartComponent.$emit('checkout', { email });

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith('/api/order', { products });
  });

  //deve chamar gerenciador.limpar produtos no sucesso
  test('should call cartManager.clearProducts on success', async () => {
    jest.spyOn(cartManager, 'getState').mockReturnValue({
      items: products,
    });//espia o estado do gerenciador

    jest.spyOn(cartManager, 'clearProducts');

    const wrapper = mountComponent(cartManager);
    const cartComponent = wrapper.findComponent(Cart).vm;
    const email = 'helen.lazarotti@gmail.com';

    await cartComponent.$emit('checkout', { email });

    expect(cartManager.clearProducts).toHaveBeenCalledTimes(1);
  });

  //deve mostrar erro quando o axios.post falhar
  test('should display error notice when Axios.post fails', async () => {
    jest.spyOn(cartManager, 'getState').mockReturnValue({
      items: products,
    });

    jest.spyOn(axios, 'post').mockRejectedValue({});

    const wrapper = mountComponent(cartManager, axios);
    const cartComponent = wrapper.findComponent(Cart).vm;

    await cartComponent.$emit('checkout', { email: 'helen.lazarotti@gmail.com' });
    await flushPromises();

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
  });
});
