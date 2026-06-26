const STORAGE_KEY = "ornacore.admin.session";

export const authStorage = {
  read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  write(session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  clear() {
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
