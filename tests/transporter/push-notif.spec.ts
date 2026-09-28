import { definePushNotifTests } from '../push-notif.shared';

definePushNotifTests({
  peran: 'Transporter/Bidder',
  landingPath: '/lelang/listlelang',
  kategori: ['Kategori Lelang', 'Kategori Order', 'Kategori Akun'],
  tampilPenerima: false,
});
