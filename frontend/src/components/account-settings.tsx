import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface PersonalInfo {
  email: string;
  firstName: string;
  lastName: string;
  birthday: string;
}

interface AddressInfo {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AccountSettingsProps {
  onClose?: () => void;
}

export default function AccountSettings({ onClose }: AccountSettingsProps) {
  const { data: session } = useSession();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: "",
    firstName: "",
    lastName: "",
    birthday: "",
  });
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session]);

  async function loadUserData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      
      if (res.ok) {
        setPersonalInfo({
          email: data.email || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          birthday: data.birthday || "",
        });
        // Note: Address data is never loaded from the server for security
      } else {
        setError(data.error || "Failed to load profile data");
      }
    } catch {
      setError("Network error while loading profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo,
          addressInfo,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage("Profile updated successfully!");
        // Clear address form after successful save for security
        setAddressInfo({
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        });
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Network error while updating profile");
    } finally {
      setSaving(false);
    }
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <div className="text-center text-muted-foreground">
          Please sign in to access account settings
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading profile data...</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium mb-1">
                  Birthday
                </label>
                <input
                  type="date"
                  id="birthday"
                  value={personalInfo.birthday}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, birthday: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">
                  Address (Line 1)
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  value={addressInfo.addressLine1}
                  onChange={(e) => setAddressInfo(prev => ({ ...prev, addressLine1: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">
                  Address (Line 2) <span className="text-muted-foreground">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  value={addressInfo.addressLine2}
                  onChange={(e) => setAddressInfo(prev => ({ ...prev, addressLine2: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={addressInfo.city}
                    onChange={(e) => setAddressInfo(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={addressInfo.state}
                    onChange={(e) => setAddressInfo(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                      id="postalCode"
                    value={addressInfo.postalCode}
                    onChange={(e) => setAddressInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={addressInfo.country}
                    onChange={(e) => setAddressInfo(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            
            {message && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
                {message}
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
} 