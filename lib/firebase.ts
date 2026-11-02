
// تم إيقاف الربط بـ Firebase والتحول للنظام المحلي
export const auth = {
  signOut: () => {
    localStorage.removeItem('nebras_demo_user');
    window.location.reload();
  }
};
export const db = {};
