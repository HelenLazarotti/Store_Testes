/* eslint-disable prettier/prettier */
/* eslint-disable spaced-comment */

import { mount } from '@vue/test-utils';
import Search from '@/components/Search';

describe('Campo de pesquisa - Unitário', () => {

  //deve montar componente
  test('should mount the component', () => {
    const wrapper = mount(Search);
    expect(wrapper.vm).toBeDefined();
  });

  //deve emitir evento de busca quando form é enviado
  test('should emit search event when form is submitted', async () => {
    const wrapper = mount(Search);
    const term = 'termo para busca';

    await wrapper.find('input[type="search"]').setValue(term);
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted().doSearch).toBeTruthy();
    expect(wrapper.emitted().doSearch.length).toBe(1);
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term }]);
  });

  //deve emitir evento de busca quando o input busca é limpo
  test('should emit search event when search input is cleared', async () => {
    const wrapper = mount(Search);
    const term = 'termo para busca';
    const input = wrapper.find('input[type="search"]');

    await input.setValue(term);
    await input.setValue('');

    expect(wrapper.emitted().doSearch).toBeTruthy();
    expect(wrapper.emitted().doSearch.length).toBe(1);
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term: '' }]);
  });
});
