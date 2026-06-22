import { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, backendConnected } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveMsgType, setSaveMsgType] = useState('success');

  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: (user.phone || '').replace(/^\+91/, ''),
    gender: user.gender || '',
  });

  // Password change state
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdMsgType, setPwdMsgType] = useState('success');
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const showToast = (msg, type = 'success') => {
    setSaveMsg(msg);
    setSaveMsgType(type);
    setTimeout(() => setSaveMsg(''), 3500);
  };

  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Avatar = e.target.result;
      setSaving(true);
      const result = await updateProfile({ ...formData, phone: formData.phone ? `+91${formData.phone.replace(/^\+91/, "")}` : "", avatar: base64Avatar });
      setSaving(false);
      if (result?.success) {
        showToast(result.local ? '✅ Photo updated (offline)' : '✅ Photo updated!');
      } else {
        showToast(result?.message || '❌ Failed to update photo', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setSaving(true);
    const result = await updateProfile({ ...formData, phone: formData.phone ? `+91${formData.phone.replace(/^\+91/, "")}` : "", avatar: "" });
    setSaving(false);
    if (result?.success) {
      showToast(result.local ? '✅ Photo removed (offline)' : '✅ Photo removed!');
    } else {
      showToast(result?.message || '❌ Failed to remove photo', 'error');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setSaving(true);
    const result = await updateProfile({ ...formData, phone: formData.phone ? `+91${formData.phone.replace(/^\+91/, "")}` : "" });
    setSaving(false);
    if (result?.success) {
      setIsEditing(false);
      showToast(result.local ? '✅ Profile saved (offline mode)' : '✅ Profile updated successfully!');
    } else {
      showToast(result?.message || '❌ Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      setPwdMsg('❌ Please fill in all fields');
      setPwdMsgType('error');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdMsg('❌ New password must be at least 6 characters');
      setPwdMsgType('error');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg('❌ New passwords do not match');
      setPwdMsgType('error');
      return;
    }
    setPwdSaving(true);
    setPwdMsg('');
    const result = await changePassword(pwdForm.currentPassword, pwdForm.newPassword);
    setPwdSaving(false);
    if (result?.success) {
      setPwdMsg('✅ Password changed successfully!');
      setPwdMsgType('success');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { setPwdMsg(''); setShowPwdForm(false); }, 2500);
    } else {
      setPwdMsg('❌ ' + (result?.message || 'Failed to change password'));
      setPwdMsgType('error');
    }
  };

  const isGoogleUser = !!(user.googleId || user.avatar?.includes('googleusercontent'));

  return (
    <div className="min-h-screen bg-[#F5F5DC] dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile & Security</h1>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${backendConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {backendConnected ? '🟢 Backend Connected' : '🟡 Offline Mode'}
          </span>
        </div>

        {/* Toast */}
        {saveMsg && (
          <div className={`mb-5 p-3 rounded-lg text-sm font-medium ${saveMsgType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {saveMsg}
          </div>
        )}

        <div className="space-y-6">

          {/* Avatar Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full flex-shrink-0 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-full h-full rounded-full overflow-hidden bg-[#E63946] flex items-center justify-center">
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : <span className="text-white text-3xl font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                }
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name || 'User'}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email || ''}</p>
              {isGoogleUser && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Signed in with Google
                </span>
              )}
              {user.avatar && (
                <button onClick={handleRemoveAvatar} disabled={saving} className="mt-3 block text-xs text-red-500 hover:text-red-700 font-medium transition-colors border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg shadow-sm w-max disabled:opacity-50">
                  🗑️ Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Profile Information</h2>
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946] disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email" value={user.email || ''} disabled
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  placeholder="Email cannot be changed"
                />
                <p className="text-xs text-gray-400 mt-1">Email address cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-2.5 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm">+91</span>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    disabled={!isEditing}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none focus:border-[#E63946] disabled:bg-gray-50 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="9876543210" maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                <div className="flex gap-6">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="gender" value={g}
                        checked={formData.gender === g} onChange={handleChange}
                        disabled={!isEditing}
                        className="w-4 h-4 text-[#E63946] border-gray-300 focus:ring-[#E63946]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      type="submit" disabled={saving}
                      className="bg-[#E63946] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {saving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button" onClick={() => {
                        setIsEditing(false);
                        setFormData({ name: user.name || '', phone: (user.phone || '').replace(/^\+91/, ''), gender: user.gender || '' });
                      }}
                      className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button" onClick={() => setIsEditing(true)}
                    className="bg-[#1A1A1A] dark:bg-white dark:text-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Security Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Security</h2>

            <div className="space-y-4">
              {/* Change Password */}
              <div className="border-b dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isGoogleUser ? 'Password change not available for Google accounts' : 'Update your password regularly for safety'}
                    </p>
                  </div>
                  {!isGoogleUser && (
                    <button
                      onClick={() => { setShowPwdForm(v => !v); setPwdMsg(''); }}
                      className="text-[#E63946] font-medium hover:underline text-sm"
                    >
                      {showPwdForm ? 'Cancel' : 'Change'}
                    </button>
                  )}
                </div>

                {showPwdForm && !isGoogleUser && (
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
                    {pwdMsg && (
                      <div className={`p-3 rounded-lg text-sm font-medium ${pwdMsgType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                        {pwdMsg}
                      </div>
                    )}
                    {[
                      { key: 'currentPassword', label: 'Current Password' },
                      { key: 'newPassword', label: 'New Password' },
                      { key: 'confirmPassword', label: 'Confirm New Password' },
                    ].map(({ key, label }) => (
                      <div key={key} className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                        <div className="relative">
                          <input
                            type={showPwd[key.replace('Password','').toLowerCase() === '' ? 'current' : key.replace('Password','').toLowerCase()] ? 'text' : 'password'}
                            value={pwdForm[key]}
                            onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#E63946] dark:bg-gray-700 dark:text-white pr-10"
                            placeholder={label}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const k = key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm';
                              setShowPwd(p => ({ ...p, [k]: !p[k] }));
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {(() => {
                              const k = key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm';
                              return showPwd[k] ? '🙈' : '👁️';
                            })()}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="submit" disabled={pwdSaving}
                      className="bg-[#E63946] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2 mt-2"
                    >
                      {pwdSaving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                      {pwdSaving ? 'Changing...' : '🔐 Change Password'}
                    </button>
                  </form>
                )}
              </div>

              {/* Login Method */}
              <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Login Method</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isGoogleUser ? 'Google OAuth' : 'Email & Password'}</p>
                </div>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {isGoogleUser ? '🔵 Google' : '📧 Email'}
                </span>
              </div>

              {/* Account Status */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Account Status</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your account is active and secure</p>
                </div>
                <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-semibold text-sm">✅ Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
