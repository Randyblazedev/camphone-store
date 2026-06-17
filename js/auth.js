// ============================================
// CamPhone Store - Supabase Auth
// ============================================

const Auth = {
  async signIn(email, password) {
    if (!supabase) {
      // Demo mode: accept demo@camphone.cm / admin123
      if (email === 'demo@camphone.cm' && password === 'admin123') {
        localStorage.setItem('camphone_admin', 'true');
        return { success: true, demo: true };
      }
      return { success: false, error: 'Invalid credentials. Demo: demo@camphone.cm / admin123' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('camphone_admin');
  },

  isAdmin() {
    return localStorage.getItem('camphone_admin') === 'true';
  },

  async checkSession() {
    if (!supabase) return this.isAdmin();

    const { data: { session } } = await supabase.auth.getSession();
    return !!session || this.isAdmin();
  }
};
