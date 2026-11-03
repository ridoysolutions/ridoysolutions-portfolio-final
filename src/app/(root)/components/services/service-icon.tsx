import {
  FaCode,
  FaFacebookF,
  FaGoogle,
  FaImages,
  FaMapMarkerAlt,
  FaUsers,
  FaVideo,
  FaYoutube,
} from "react-icons/fa";

const iconMap = {
  users: FaUsers,
  facebook: FaFacebookF,
  google: FaGoogle,
  youtube: FaYoutube,
  location: FaMapMarkerAlt,
  video: FaVideo,
  code: FaCode,
  thumbnails: FaImages,
} as const;

export function ServiceIcon({ name }: { name: string }) {
  const Icon = iconMap[name as keyof typeof iconMap] || FaImages;

  return <Icon className="h-8 w-8" aria-hidden="true" />;
}
