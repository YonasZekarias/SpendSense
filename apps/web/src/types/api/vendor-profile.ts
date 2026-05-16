export interface VendorProfileResponse {
  id: string;
  owner: number;
  owner_name: string;
  shop_name: string;
  city: string;
  address: string;
  contact_phone: string;
  is_verified: boolean;
  verification_status: 'unrequested' | 'pending' | 'verified' | 'rejected';
  business_license: string | null;
  tin_number: string;
  rating_avg: number;
  rating_count: number;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  theme_image: string | null;
  joined_at: string;
}
