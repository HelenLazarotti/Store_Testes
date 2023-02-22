/* eslint-disable prettier/prettier */
/* eslint-disable spaced-comment */
import { mount } from '@vue/test-utils';
import ProductCard from '@/components/ProductCard';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

describe('Card do Produto - Teste Unitário', () => {
  
  let server;

  beforeEach(() => {
    //subo um novo servidor ANTES de TUDO
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    //encerra server / fecha
    server.shutdown();
  });

  const mountProductCard = () => {

    const product = server.create('product', {
      title: 'Relógio bonito',
      price: '23.00',
      image:
        'https://images.unsplash.com/photo-1532667449560-72a95c8d381b?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
    });

    const cartManager = new CartManager();//gerenciador de carrinhos

    const wrapper = mount(ProductCard, {//monta card de produtos
      propsData: {
        product,
      },
      mocks: {
        $cart: cartManager,
      },
    });
    return {
      wrapper,
      product,
      cartManager,
    };
  };

  
  //deve corresponder ao html pegando todos elementos de produtos
  test('should match snapshot', () => {
    const { wrapper } = mountProductCard();//monta produto

    expect(wrapper.element).toMatchSnapshot();//espera que o elemento retornado, combine c/ o passado pro snapshot
  });

  //deve montar o componente
  test('should mount the component', () => {
    const { wrapper } = mountProductCard();//monta produto

    expect(wrapper.vm).toBeDefined();

    expect(wrapper.text()).toContain('Relógio bonito');//o texto do produto, contenha esse titulo

    expect(wrapper.text()).toContain('$23.00');//o txt do produto tenha esse preço
  });

  //deve add item no cartState ao clicar no botão
  test('should add item to cartState on button click', async () => {
    const { wrapper, cartManager, product } = mountProductCard();//monto produto

    const spy1 = jest.spyOn(cartManager, 'open');//espia e abre o localStorange do carrinho
    
    const spy2 = jest.spyOn(cartManager, 'addProduct');//espia o produto add

    await wrapper.find('button').trigger('click');//enconta um btn que tenha função de clique

    expect(spy1).toHaveBeenCalledTimes(1);//espera que tenha sido chamado 1 vez
    
    expect(spy2).toHaveBeenCalledTimes(1);//espera que tenha sido chamado 1 vez
    
    expect(spy2).toHaveBeenCalledWith(product);//espera que tenha sido chamado com o produto.
  });
});
