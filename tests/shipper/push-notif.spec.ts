import { definePushNotifTests } from '../push-notif.shared';

definePushNotifTests({
  peran: 'Shipper/Bid Owner',
  landingPath: '/lelang/carirute',
  kategori: ['Kategori Lelang', 'Kategori Order', 'Kategori Akun', 'Kategori Tracking'],
  tampilPenerima: false,
});
