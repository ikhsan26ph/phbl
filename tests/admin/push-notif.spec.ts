import { definePushNotifTests } from '../push-notif.shared';

definePushNotifTests({
  peran: 'Admin',
  landingPath: '/lelang/listlelang',
  kategori: ['Kategori Lelang', 'Kategori Order Baru', 'Kategori Order', 'Kategori Akun', 'Kategori Tracking'],
  tampilPenerima: true,
  ujiAksesibilitasIkon: true,
});
