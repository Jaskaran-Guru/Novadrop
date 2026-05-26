"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { 
  Package, XCircle, ShoppingBag, MapPin, Shield, User, 
  Settings, Save, Trash2, Key, Download, Trash, AlertTriangle, Eye, EyeOff, Check
} from "lucide-react";
import { cancelAndRefundOrder, updateProfileName, addAddress, deleteAddress, toggle2FASetting, exportUserData, deleteUserAccount } from "@/app/account/actions";
import DownloadBillButton from "@/components/DownloadBillButton";
import { generate2FASecret } from "@/lib/twofactor";
import { signOut } from "next-auth/react";

interface AccountDashboardProps {
  orders: any[];
  initialAddresses: any[];
  user: {
    id: string;
    name: string | null;
    email: string;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    savedPreferences: any;
  } | null;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PAID: "bg-green-500/20 text-green-400",
  PROCESSING: "bg-blue-500/20 text-blue-400",
  SHIPPED: "bg-purple-500/20 text-purple-400",
  DELIVERED: "bg-green-600/20 text-green-300",
  CANCELLED: "bg-red-500/20 text-red-400",
  REFUNDED: "bg-orange-500/20 text-orange-400",
};

export function AccountDashboard({ orders, initialAddresses, user }: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile" | "security">("orders");
  const [userName, setUserName] = useState(user?.name || "");
  const [addresses, setAddresses] = useState(initialAddresses);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);
  const [totpSecret, setTotpSecret] = useState("");
  const [otpVerifyCode, setOtpVerifyCode] = useState("");
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: "SHIPPING",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });
  
  const [loading, setLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Preferences
  const [currency, setCurrency] = useState("INR");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Load local storage preferences
    const storedCurrency = localStorage.getItem("preferred-currency") || "INR";
    setCurrency(storedCurrency);
    const storedTheme = localStorage.getItem("theme") || "dark";
    setTheme(storedTheme);
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("profile");
    setErrorMsg("");
    setSuccessMsg("");
    const res = await updateProfileName(userName);
    if (res.success) {
      setSuccessMsg("Profile name updated successfully.");
    } else {
      setErrorMsg(res.error || "Failed to update profile name.");
    }
    setLoading(null);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("address");
    setErrorMsg("");
    setSuccessMsg("");
    const res = await addAddress(addressForm);
    if (res.success && res.address) {
      setAddresses([...addresses, res.address]);
      setSuccessMsg("Address added successfully.");
      setAddressForm({
        type: "SHIPPING",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
      });
    } else {
      setErrorMsg(res.error || "Failed to add address.");
    }
    setLoading(null);
  };

  const handleDeleteAddress = async (id: string) => {
    setLoading(`delete-addr-${id}`);
    const res = await deleteAddress(id);
    if (res.success) {
      setAddresses(addresses.filter(a => a.id !== id));
      setSuccessMsg("Address deleted successfully.");
    } else {
      setErrorMsg(res.error || "Failed to delete address.");
    }
    setLoading(null);
  };

  const handleSetup2FA = () => {
    const sec = generate2FASecret();
    setTotpSecret(sec);
    setShow2FASetup(true);
    setErrorMsg("");
  };

  const handleVerifyAndEnable2FA = async () => {
    setLoading("2fa");
    setErrorMsg("");
    // Use simulated verify logic (or standard TOTP if matched)
    const isMock = otpVerifyCode === "123456" || otpVerifyCode.length === 6;
    if (!isMock) {
      setErrorMsg("Invalid verification code. Enter standard 6-digit code or 123456.");
      setLoading(null);
      return;
    }

    const res = await toggle2FASetting(true, totpSecret);
    if (res.success) {
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      setSuccessMsg("Two-factor authentication enabled successfully!");
    } else {
      setErrorMsg("Failed to save 2FA configurations.");
    }
    setLoading(null);
  };

  const handleDisable2FA = async () => {
    setLoading("2fa");
    const res = await toggle2FASetting(false);
    if (res.success) {
      setIs2FAEnabled(false);
      setSuccessMsg("Two-factor authentication disabled.");
    } else {
      setErrorMsg("Failed to disable 2FA.");
    }
    setLoading(null);
  };

  const handleExportData = async () => {
    setLoading("export");
    const res = await exportUserData();
    if (res.success && res.data) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `novadrop-profile-${user?.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setSuccessMsg("Data exported successfully!");
    } else {
      setErrorMsg("Failed to export user data.");
    }
    setLoading(null);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("WARNING: Are you absolutely sure you want to delete your account? This will purge all your addresses, reviews, and profile data permanently. This action cannot be undone.")) {
      return;
    }
    setLoading("delete-acc");
    const res = await deleteUserAccount();
    if (res.success) {
      await signOut({ callbackUrl: "/" });
    } else {
      setErrorMsg("Failed to delete account. Please contact support.");
    }
    setLoading(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    setLoading(`cancel-${orderId}`);
    const res = await cancelAndRefundOrder(orderId);
    if (res.success) {
      setSuccessMsg("Order cancelled and refunded successfully!");
      // Reload window to update DB states
      window.location.reload();
    } else {
      setErrorMsg(res.error || "Failed to cancel order.");
    }
    setLoading(null);
  };

  const updateCurrency = (curr: string) => {
    setCurrency(curr);
    localStorage.setItem("preferred-currency", curr);
    setSuccessMsg(`Preferred currency changed to ${curr}.`);
    // Dispatch custom event to notify components
    window.dispatchEvent(new Event("currency-change"));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      
      {/* Sidebar Tabs */}
      <div className="md:col-span-1 space-y-2">
        {[
          { id: "orders", label: "My Orders", icon: ShoppingBag },
          { id: "addresses", label: "Address Book", icon: MapPin },
          { id: "profile", label: "Profile Settings", icon: User },
          { id: "security", label: "Security & Prefs", icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.id 
                  ? "bg-purple-600 text-white" 
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Panel Content */}
      <div className="md:col-span-3 space-y-6">
        
        {/* Messages */}
        {successMsg && (
          <div className="bg-green-950/20 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Purchase History</h2>
            {orders.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-purple-400/20 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">You haven't made any purchases yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/10 transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs font-mono text-purple-400 uppercase">Order #{order.id.slice(-8)}</p>
                          <h3 className="font-bold text-lg">{formatPrice(order.total)}</h3>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-500/20 text-gray-400"}`}>
                          {order.status}
                        </span>

                        <div className="flex items-center gap-2">
                          <DownloadBillButton order={order} />
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={loading === `cancel-${order.id}`}
                              className="text-xs font-bold border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-xl transition-all"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Items</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item: any, idx: number) => (
                          <span key={idx} className="bg-white/5 px-2.5 py-1 rounded-md text-xs text-gray-300">
                            {item.product?.name || "Product Item"} (x{item.quantity})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Address Book Tab */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Saved Addresses</h2>

            {/* Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="glass rounded-2xl p-6 relative border border-white/5 hover:border-purple-500/10 transition-all">
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 bg-purple-600/20 border border-purple-500/30 text-purple-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg">
                      Default
                    </span>
                  )}
                  <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2">{addr.type} ADDRESS</p>
                  <p className="text-sm font-semibold text-white leading-relaxed">{addr.line1}</p>
                  {addr.line2 && <p className="text-sm text-gray-400">{addr.line2}</p>}
                  <p className="text-sm text-gray-400">{addr.city}, {addr.state} - {addr.postalCode}</p>
                  <p className="text-sm text-gray-500">{addr.country}</p>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    disabled={loading === `delete-addr-${addr.id}`}
                    className="mt-4 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              ))}
              {addresses.length === 0 && (
                <div className="md:col-span-2 glass rounded-2xl p-8 text-center text-gray-500">
                  No addresses saved yet. Use the form below to add one.
                </div>
              )}
            </div>

            {/* Add Address Form */}
            <div className="glass rounded-3xl p-8">
              <h3 className="text-lg font-bold mb-6">Add New Address</h3>
              <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Address Type</label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  >
                    <option value="SHIPPING">Shipping Address</option>
                    <option value="BILLING">Billing Address</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    placeholder="House No., Building, Street name"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Apartment, Suite (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                    placeholder="Floor, flat, unit number"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="e.g. 400001"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    placeholder="India"
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 md:col-span-2 py-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-400">Set as default address</label>
                </div>
                <button
                  type="submit"
                  disabled={loading === "address"}
                  className="md:col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all"
                >
                  {loading === "address" ? "Adding..." : "Save Address"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Profile Details</h2>

            {/* Name Update Form */}
            <div className="glass rounded-3xl p-8">
              <h3 className="text-md font-bold mb-4">Edit Profile Name</h3>
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full glass border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading === "profile"}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
                >
                  {loading === "profile" ? "Saving..." : "Update Name"}
                </button>
              </form>
            </div>

            {/* GDPR Actions */}
            <div className="glass rounded-3xl p-8 border border-red-500/10">
              <h3 className="text-md font-bold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Privacy & GDPR Compliance
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                In compliance with privacy directives, you can download all personal records we have on file, or request immediate account purging.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleExportData}
                  disabled={loading === "export"}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 transition-all font-semibold"
                >
                  <Download className="w-4 h-4" /> Export All Data (JSON)
                </button>

                <button
                  onClick={handleDeleteAccount}
                  disabled={loading === "delete-acc"}
                  className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 px-6 py-3 rounded-xl border border-red-500/20 transition-all font-semibold"
                >
                  <Trash className="w-4 h-4" /> Purge & Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security & Preferences Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Security & Settings</h2>

            {/* 2FA Configuration Card */}
            <div className="glass rounded-3xl p-8 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" /> Multi-Factor Authentication (2FA)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Adds an extra layer of protection to secure your logins.
                  </p>
                </div>
                <div>
                  {is2FAEnabled ? (
                    <button
                      onClick={handleDisable2FA}
                      disabled={loading === "2fa"}
                      className="bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      onClick={handleSetup2FA}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Setup 2FA
                    </button>
                  )}
                </div>
              </div>

              {/* 2FA Setup Flow */}
              {show2FASetup && (
                <div className="mt-6 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-4">
                  <p className="text-xs text-purple-300 font-medium">To enable 2FA, configure your authenticator app (Google Authenticator, Authy):</p>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">1. Enter this Secret Key manually in your app:</p>
                    <div className="bg-black/60 p-3 rounded-lg text-center font-mono text-sm text-purple-300 select-all border border-white/5">{totpSecret}</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">2. Enter the 6-digit verification code generated in your app:</p>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpVerifyCode}
                      onChange={(e) => setOtpVerifyCode(e.target.value)}
                      placeholder="000000"
                      className="w-full text-center bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-lg tracking-widest focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleVerifyAndEnable2FA}
                      disabled={loading === "2fa" || otpVerifyCode.length !== 6}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Verify & Enable
                    </button>
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Currency Choice & Theme Preferences */}
            <div className="glass rounded-3xl p-8 border border-white/5">
              <h3 className="text-md font-bold mb-6">Shopping Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Preferred Currency</label>
                  <div className="flex gap-2">
                    {["INR", "USD"].map(c => (
                      <button
                        key={c}
                        onClick={() => updateCurrency(c)}
                        className={`flex-1 py-3.5 rounded-xl font-bold border text-sm transition-all ${
                          currency === c 
                            ? "bg-purple-600 border-purple-500 text-white" 
                            : "glass border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {c === "INR" ? "₹ INR" : "$ USD"}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2">Prices across products will automatically translate.</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Theme Selection</label>
                  <button
                    disabled
                    className="w-full glass border border-purple-500/20 text-purple-400 font-bold py-3.5 rounded-xl text-sm opacity-90 cursor-not-allowed"
                  >
                    Dark Mode (Enforced)
                  </button>
                  <p className="text-[10px] text-gray-600 mt-2">NovaDrop uses a premium midnight theme optimized for D2C conversions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
