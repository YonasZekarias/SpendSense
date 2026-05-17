export interface AdminVendor {
  id: string;
  shop_name: string;
  city: string;
  address: string;
  contact_phone: string;
  latitude: string | null;
  longitude: string | null;
  is_verified: boolean;
  verification_status: "unrequested" | "requested" | "pending" | "verified" | "rejected";
  business_license: string | null;
  tin_number: string;
  rating_avg: string;
  rating_count: number;
  joined_at: string;
  owner_name: string;
  owner_email: string;
}

export interface AdminVendorPagination {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
}

export interface AdminVendorListResponse {
  pagination: AdminVendorPagination;
  results: AdminVendor[];
}
