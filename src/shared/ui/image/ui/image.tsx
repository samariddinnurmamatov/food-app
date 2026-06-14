import { useState } from "react";
import Image, { ImageProps, StaticImageData } from "next/image";

interface Props {
  imageSrc: string | StaticImageData;
  width: number;
  height: number;
  style?: React.CSSProperties;
  alt: string; 
  className?: string;
  title?: string;
  ariaLabel?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
}

export const CustomImage = ({
  imageSrc,
  width,
  height,
  style,
  alt, // default value
  className,
  title,
  ariaLabel,
  priority = false,
  loading,
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  const imageProps: ImageProps = {
    src: imageSrc || "/placeholder.svg",
    alt, // fallback alt
    width,
    height,
    className: `${className || ""} duration-700 ease-in-out group-hover:opacity-75 ${
      isLoading ? "scale-105 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"
    }`,
    quality: 100,
    onLoad: () => setIsLoading(false),
    style,
    title,
    "aria-label": ariaLabel,
  };

  if (priority) {
    imageProps.priority = true;
  } else if (loading) {
    imageProps.loading = loading;
  }

  return <Image {...imageProps} alt={alt} />;
};
