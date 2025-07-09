import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const [signingOutEverywhere, setSigningOutEverywhere] = useState(false);

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
      // Only include address info if user actually filled in address fields
      const hasAddressData = addressInfo.addressLine1?.trim() || 
                            addressInfo.city?.trim() || 
                            addressInfo.state?.trim() || 
                            addressInfo.postalCode?.trim() || 
                            addressInfo.country?.trim();

      const requestBody: any = {
        personalInfo,
      };

      if (hasAddressData) {
        requestBody.addressInfo = addressInfo;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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

  async function handleSignOutEverywhere() {
    if (!confirm("Are you sure you want to sign out on all devices? You'll need to sign in again on each device.")) {
      return;
    }

    setSigningOutEverywhere(true);
    setError(null);

    try {
      // First invalidate all sessions on the server
      const res = await fetch("/api/user/invalidate-sessions", {
        method: "POST",
      });

      if (res.ok) {
        // Then sign out from current device
        await signOut();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to sign out everywhere");
      }
    } catch {
      setError("Network error while signing out everywhere");
    } finally {
      setSigningOutEverywhere(false);
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
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    type="email"
                    id="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    type="text"
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    type="text"
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday *</Label>
                  <Input
                    type="date"
                    id="birthday"
                    value={personalInfo.birthday}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, birthday: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>
                If you&apos;ve already set an address, it won&apos;t be shown here for security reasons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address (Line 1)</Label>
                  <Input
                    type="text"
                    id="addressLine1"
                    value={addressInfo.addressLine1}
                    onChange={(e) => setAddressInfo(prev => ({ ...prev, addressLine1: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">
                    Address (Line 2) <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    type="text"
                    id="addressLine2"
                    value={addressInfo.addressLine2}
                    onChange={(e) => setAddressInfo(prev => ({ ...prev, addressLine2: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      value={addressInfo.city}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                      type="text"
                      id="state"
                      value={addressInfo.state}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">ZIP / Postal Code</Label>
                    <Input
                      type="text"
                      id="postalCode"
                      value={addressInfo.postalCode}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      type="text"
                      id="country"
                      value={addressInfo.country}
                      onChange={(e) => setAddressInfo(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Sign Out Everywhere Section */}
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Sign Out Everywhere</CardTitle>
              <CardDescription>
                This will sign you out on all devices where you're currently logged in. You'll need to sign in again on each device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleSignOutEverywhere}
                disabled={signingOutEverywhere}
                className="w-full"
              >
                {signingOutEverywhere ? "Signing Out..." : "Sign Out Everywhere"}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
} 