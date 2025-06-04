"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon, X, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import ButterflyLoader from "@/components/butterfly-loader";
import Image  from "next/image";

interface CreateGymFormData {
  name: string;
  address: string;
  description: string;
  contactInfo: string;
}

export default function CreateGymPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<CreateGymFormData>({
    name: "",
    address: "",
    description: "",
    contactInfo: "",
  });

  const { isAuthorized, isLoading } = useRoleProtection({
    allowedRoles: [UserRole.ADMIN, UserRole.GYM_OWNER],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      const submitData = new FormData();

      submitData.append("name", formData.name);
      submitData.append("address", formData.address);
      submitData.append("description", formData.description);
      submitData.append("contactInfo", formData.contactInfo);

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      await api.post("/gyms", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Gym created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error creating gym:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to create gym. Please try again."
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
              Create New Gym
            </h1>
            <p className="text-muted-foreground text-lg">
              Fill in the details below to create your gym profile
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-medium">
                  Gym Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter gym name"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-base font-medium">
                  Address *
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter gym address"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="contactInfo" className="text-base font-medium">
                  Contact Information *
                </Label>
                <Input
                  id="contactInfo"
                  name="contactInfo"
                  type="text"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  placeholder="Enter contact information (email, phone, etc.)"
                  required
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
              Description
            </h2>
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-medium">
                Tell us about your gym *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your gym, facilities, atmosphere, and what makes it special..."
                required
                className="min-h-[150px] text-base resize-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
              Gym Image
            </h2>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 bg-muted/20 hover:bg-muted/30 transition-colors">
              {imagePreview ? (
                <div className="relative max-w-2xl mx-auto">
                  <img
                    src={imagePreview}
                    alt="Gym preview"
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
                  <span className="ml-3">Creating...</span>
                </div>
              ) : (
                "Create Gym"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
