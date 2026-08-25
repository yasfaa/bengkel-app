import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ServiceQcModal from '../src/components/ServiceQcModal.vue';
import { SwalConfirm } from '../src/utils/swal';

describe('ServiceQcModal.vue Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockService = {
    id: 201,
    nomorPkb: 'PKB-20260825-002',
    nopol: 'B 9876 XYZ',
    motorType: 'Yamaha NMAX 155 (155 cc)',
    customerName: 'Ahmad Dahlan',
    phone: '081398765432',
    status: 'Dikerjakan',
    keluhan: 'Suara CVT berisik dan rem kurang pakem',
  };

  it('1. should render modal with correct PKB metadata and 5 SOP checklist items unchecked initially', () => {
    const wrapper = mount(ServiceQcModal, {
      props: {
        modelValue: true,
        service: mockService,
      },
    });

    expect(wrapper.text()).toContain('Pemeriksaan Akhir & Kendali Mutu (QC)');
    expect(wrapper.text()).toContain('PKB-20260825-002');
    expect(wrapper.text()).toContain('B 9876 XYZ');
    expect(wrapper.text()).toContain('Yamaha NMAX 155');
    expect(wrapper.text()).toContain('0 / 5 Butir Selesai');

    const checklistItems = wrapper.findAll('.qc-item');
    expect(checklistItems.length).toBe(5);
  });

  it('2. should toggle checklist item status and update count when clicked', async () => {
    const wrapper = mount(ServiceQcModal, {
      props: {
        modelValue: true,
        service: mockService,
      },
    });

    const checklistItems = wrapper.findAll('.qc-item');
    expect(checklistItems[0].classes()).not.toContain('active');

    // Click to check first item
    await checklistItems[0].trigger('click');
    expect(checklistItems[0].classes()).toContain('active');
    expect(wrapper.text()).toContain('1 / 5 Butir Selesai');

    // Click again to uncheck
    await checklistItems[0].trigger('click');
    expect(checklistItems[0].classes()).not.toContain('active');
    expect(wrapper.text()).toContain('0 / 5 Butir Selesai');
  });

  it('3. should show SwalConfirm before emitting confirm when submitting QC', async () => {
    const fireSpy = vi.spyOn(SwalConfirm, 'fire').mockResolvedValue({ isConfirmed: true });

    const wrapper = mount(ServiceQcModal, {
      props: {
        modelValue: true,
        service: mockService,
      },
    });

    // Check all 5 items
    const checklistItems = wrapper.findAll('.qc-item');
    for (const item of checklistItems) {
      await item.trigger('click');
    }
    expect(wrapper.text()).toContain('5 / 5 Butir Selesai');

    const submitBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Simpan & Selesaikan'));
    expect(submitBtn).toBeDefined();

    await submitBtn.trigger('click');

    expect(fireSpy).toHaveBeenCalledTimes(1);
    expect(fireSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Konfirmasi Selesai Servis & QC',
        confirmButtonText: 'Ya, Selesaikan',
      })
    );

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      kelistrikan_ok: true,
      rem_ok: true,
      gas_ok: true,
      test_ride_ok: true,
      part_bekas_diserahkan: true,
    });
  });

  it('4. should NOT emit confirm if user cancels the SwalConfirm dialog', async () => {
    vi.spyOn(SwalConfirm, 'fire').mockResolvedValue({ isConfirmed: false });

    const wrapper = mount(ServiceQcModal, {
      props: {
        modelValue: true,
        service: mockService,
      },
    });

    const submitBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Simpan & Selesaikan'));
    await submitBtn.trigger('click');

    expect(wrapper.emitted('confirm')).toBeFalsy();
  });
});
