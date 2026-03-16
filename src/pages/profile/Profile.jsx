import { useState } from "react"
import { motion } from "motion/react"
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave, FiX,
  FiSettings, FiLogOut, FiPackage, FiHeart,
} from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useCartStore } from "../../store/cartStore"
import { useApiQuery, useApiMutation } from "../../api/adapter"
import Button from "../../utilities/Button.jsx"
import Card from "../../utilities/Card.jsx"
import ProfileInput from "../../utilities/ProfileInput.jsx"
import ProfileSkeleton from "../../components/loaders/ProfileSkeleton.jsx"

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    danger: "bg-red-100 text-red-800",
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clearCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: user, isLoading, isError, refetch } = useApiQuery("/auth/profile", null, {
    enabled: isAuthenticated,
  });

  const { mutate: updateProfile } = useApiMutation("/auth/profile", "PUT");

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    email: "", fullName: "", bio: "",
    address: { city: "", street: "", state: "", zip: "", country: "" },
    contact: ""
  });

  const [initialized, setInitialized] = useState(false);
  if (user && !initialized) {
    setFormData({
      email: user.email || "",
      fullName: user.fullName || "",
      bio: user.bio || "",
      address: user.address || { city: "", street: "", state: "", zip: "", country: "" },
      contact: user.contact || ""
    });
    setInitialized(true);
  }

  if (!isAuthenticated) {
    navigate("/signin");
    return null;
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleAddressInputChange = (field, value, parent = null) => {
    if (parent) {
      setFormData((prev) => ({
        ...prev, [parent]: { ...prev[parent], [field]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    updateProfile(formData, {
      onSuccess: (res) => {
        if (res?.profile) setUser(res.profile)
        setIsEditing(false)
        refetch()
      },
    });
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email || "",
        fullName: user.fullName || "",
        bio: user.bio || "",
        address: user.address || { city: "", street: "", country: "", state: "", zip: "" },
        contact: user.contact || ""
      });
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout();
    clearCart();
    navigate("/signin");
  };

  if (isError) return <p className="text-red-500 mx-[25px] bg-red-100 py-[4px] px-[15px] rounded-lg">Failed to load profile</p>;
  if (isLoading) return <div className="h-screen w-screen"><ProfileSkeleton /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiUser className="mr-3 text-red-600" />
            <span>My <span className="text-red-600">Profile</span></span>
          </h1>
          <p className="text-gray-600 text-[14px] mt-2">Manage your account information and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-3">
                  <FiUser className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{formData.fullName || user?.fullName}</h2>
                <p className="text-gray-500 text-sm">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
              </div>
              <nav className="space-y-1">
                <Link to="/profile" className="flex items-center px-4 py-3 text-red-600 bg-red-50 rounded-lg font-medium">
                  <FiUser className="mr-3" /> Profile Information
                </Link>
                <Link to="/orders-tracking" className="flex items-center px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <FiPackage className="mr-3" /> Order History
                </Link>
                <Link to="/wishlist" className="flex items-center px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <FiHeart className="mr-3" /> Wishlist
                </Link>
                <p className="flex items-center px-4 py-3 text-gray-400 rounded-lg transition-colors cursor-not-allowed">
                  <FiSettings className="mr-3 mt-[2px] text-gray-400" /> Settings
                </p>
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <FiLogOut className="mr-3" /> Sign Out
                </button>
              </nav>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge variant="info">Customer</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Role{user?.role?.length > 1 ? "s" : ""}</span>
                  <div className="flex gap-1">
                    {user?.role?.map((r) => (
                      <Badge key={r} variant="default">{r}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-3">
            <Card className="p-8">
              <div className="flex md:flex-row flex-col gap-y-2 md:items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <FiEdit3 className="mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={handleCancel}><FiX className="mr-2" /> Cancel</Button>
                    <Button variant="red" onClick={handleSave}><FiSave className="mr-2" /> Save Changes</Button>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiUser className="mr-2 text-red-600" /> Personal Details
                    </h3>
                    <div className="space-y-4">
                      <ProfileInput label="Full Name" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                      <ProfileInput label="Email Address" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                      <ProfileInput label="Phone Number" type="tel" value={formData.contact} onChange={(e) => handleInputChange("contact", e.target.value)} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                      <ProfileInput label="Bio" value={formData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiMapPin className="mr-2 text-red-600" /> Address Information
                    </h3>
                    <div className="space-y-4">
                      <ProfileInput label="Street Address" value={formData.address.street} onChange={(e) => handleAddressInputChange("street", e.target.value, "address")} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                      <div className="grid grid-cols-2 gap-4">
                        <ProfileInput label="City" value={formData.address.city} onChange={(e) => handleAddressInputChange("city", e.target.value, "address")} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                        <ProfileInput label="State" value={formData.address.state} onChange={(e) => handleAddressInputChange("state", e.target.value, "address")} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <ProfileInput label="Zip Code" value={formData.address.zip} onChange={(e) => handleAddressInputChange("zip", e.target.value, "address")} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                        <ProfileInput label="Country" value={formData.address.country} onChange={(e) => handleAddressInputChange("country", e.target.value, "address")} disabled={!isEditing} className={!isEditing ? "bg-gray-50" : ""} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 pt-4 border-t-[3px] border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Contact Info</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl shadow-sm">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><FiMail className="w-5 h-5 text-red-600" /></div>
                      <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-[14px] text-gray-900 truncate">{formData.email}</p></div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl shadow-sm">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><FiPhone className="w-5 h-5 text-red-600" /></div>
                      <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium text-gray-900">{formData.contact || "N/A"}</p></div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl shadow-sm">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><FiMapPin className="w-5 h-5 text-red-600" /></div>
                      <div><p className="text-sm text-gray-500">Address</p><p className="font-medium text-[14px] text-gray-900">{formData.address.street}, {formData.address.city}</p></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
