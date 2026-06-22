with open('UserContext.jsx', 'r') as f:
    content = f.read()

old = """  useEffect(() => {
    const token = localStorage.getItem('sc_token');
    const saved = localStorage.getItem('sc_user');
    const savedPayments = localStorage.getItem('sc_payments');
    const savedAddresses = localStorage.getItem('sc_addresses');
    const savedOrders = localStorage.getItem('sc_orders');
    if (token && saved) {
      try { setUser({ ...JSON.parse(saved), isLoggedIn: true }); } catch {}
    }
    if (savedPayments) { try { setPaymentMethods(JSON.parse(savedPayments)); } catch {} }
    if (savedAddresses) { try { setAddresses(JSON.parse(savedAddresses)); } catch {} }
    if (savedOrders) { try { setOrders(JSON.parse(savedOrders)); } catch {} }
    setLoading(false);
  }, []);"""

new = """  useEffect(() => {
    const token = localStorage.getItem('sc_token');
    const saved = localStorage.getItem('sc_user');
    const savedPayments = localStorage.getItem('sc_payments');
    const savedAddresses = localStorage.getItem('sc_addresses');
    const savedOrders = localStorage.getItem('sc_orders');
    if (token && saved) {
      try { setUser({ ...JSON.parse(saved), isLoggedIn: true }); } catch {}
    }
    if (savedPayments) { try { setPaymentMethods(JSON.parse(savedPayments)); } catch {} }
    if (savedAddresses) { try { setAddresses(JSON.parse(savedAddresses)); } catch {} }
    if (savedOrders) { try { setOrders(JSON.parse(savedOrders)); } catch {} }

    // Handle Google redirect result (when popup was blocked and redirect was used)
    getRedirectResult(auth).then(async (result) => {
      if (result && result.user) {
        const firebaseUser = result.user;
        try {
          const res = await fetch(`${API}/auth/google`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL || '',
              googleId: firebaseUser.uid,
            }),
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('sc_token', data.token);
            localStorage.setItem('sc_user', JSON.stringify(data.user));
            setUser({ ...data.user, isLoggedIn: true });
            setBackendConnected(true);
            window.dispatchEvent(new CustomEvent('sc_login'));
          }
        } catch(e) {}
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);"""

if old in content:
    content = content.replace(old, new)
    with open('UserContext.jsx', 'w') as f:
        f.write(content)
    print("Patched successfully!")
else:
    print("Pattern not found!")
    print(repr(content[800:1100]))
