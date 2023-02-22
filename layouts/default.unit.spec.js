/* eslint-disable prettier/prettier */
/* eslint-disable spaced-comment */

import { mount } from '@vue/test-utils';
import DefaultLayout from '@/layouts/default';
import Cart from '@/components/Cart';
import { CartManager } from '@/managers/CartManager';

//Layout padrão
describe('Default Layout', () => {
  const mountLayout = () => {//monta layout
    const wrapper = mount(DefaultLayout, {
      mocks: {
        $cart: new CartManager(),
      },
      stubs: {
        Nuxt: true,
      },
    });

    return { wrapper };
  };

  //deve montar carrinho
  test('should mount Cart', () => {
    const { wrapper } = mountLayout();
    expect(wrapper.findComponent(Cart).exists()).toBe(true);
  });

  //deve mostrar/esconder carrinho
  test('should toggle Cart visibility', async () => {
    const { wrapper } = mountLayout();
    const button = wrapper.find('[data-testid="toggle-button"]');

    await button.trigger('click');
    expect(wrapper.vm.isCartOpen).toBe(true);
    await button.trigger('click');
    expect(wrapper.vm.isCartOpen).toBe(false);
  });
});
