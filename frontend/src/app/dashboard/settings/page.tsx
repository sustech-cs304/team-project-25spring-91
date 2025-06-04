"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon, X, ArrowLeft, User, Mail } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import ButterflyLoader from "@/components/butterfly-loader";
import Image from "next/image";

interface SettingsFormData {
  displayName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  heightCm: number;
  weightKg: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<SettingsFormData>({
    displayName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    heightCm: 0,
    weightKg: 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        heightCm: Number(user.heightCm) || 0, 
        weightKg: Number(user.weightKg) || 0,  
      });
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let processedValue: string | number = value;

    if (name === 'heightCm' || name === 'weightKg') {
      processedValue = value === '' ? 0 : Math.round(Number(value));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.put("/users/profile", formData);

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        await api.put("/users/profile/image", imageFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast.success("Settings updated successfully!");

      window.location.href = "/dashboard";

    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to update settings. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Update your profile information and preferences
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
              Profile Image
            </h2>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 bg-muted/20 hover:bg-muted/30 transition-colors">
              {imagePreview ? (
                <div className="relative max-w-2xl mx-auto">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-3 right-3 shadow-lg"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-20 w-20 text-muted-foreground/50 mb-6" />
                  <div className="space-y-4">
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      <Upload className="h-5 w-5 mr-3" />
                      Choose Image
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    PNG, JPG, or GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="displayName" className="text-base font-medium flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Display Name *
                </Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Enter your display name"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="dateOfBirth" className="text-base font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="gender" className="text-base font-medium">
                  Gender
                </Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="h-12 text-base w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="heightCm" className="text-base font-medium">
                  Height (cm)
                </Label>
                <Input
                  id="heightCm"
                  name="heightCm"
                  type="number"
                  value={formData.heightCm}
                  onChange={handleInputChange}
                  placeholder="Enter your height in cm"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="weightKg" className="text-base font-medium">
                  Weight (kg)
                </Label>
                <Input
                  id="weightKg"
                  name="weightKg"
                  type="number"
                  value={formData.weightKg}
                  onChange={handleInputChange}
                  placeholder="Enter your weight in kg"
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-8 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <span className="ml-3">Updating...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}