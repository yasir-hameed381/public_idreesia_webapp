"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TranslationKeys } from "@/app/constants/translationKeys";
//import { fetchImages } from "@/services/gallery-service";
import LoadingSpinner from "../../../../components/ui/Loadingspinner";

// Placeholder function until gallery service is implemented
const fetchImages = async () => {
  // TODO: Implement gallery service
  return [];
};

export default function Gallery() {
  const t = useTranslations(TranslationKeys.GALLERY);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const images: any = await fetchImages();
        setGalleryImages(images);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  // Function to handle image click
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {galleryImages.map((image: any) => (
          <div
            key={image.id}
            className="relative w-full h-64 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Modal for displaying full-size image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={closeModal} // Close modal when clicking outside the image
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={800}
              height={600}
              className="object-contain"
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg"
              onClick={closeModal} // Close modal when clicking the button
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
