// Utility functions to filter sensitive data from database queries
// This ensures user privacy and data protection

import type { Tables } from "@/integrations/supabase/types";

/**
 * Filters sensitive fields from profile data
 * Only returns publicly visible profile information
 */
export const filterPublicProfile = (profile: Tables<"profiles"> | null): Partial<Tables<"profiles">> | null => {
  if (!profile) return null;

  return {
    id: profile.id,
    avatar_url: profile.avatar_url,
    first_name: profile.first_name,
    last_name: profile.last_name,
    full_name: profile.full_name,
    city: profile.city,
    country: profile.country,
    verified_seller: profile.verified_seller,
    rating_average: profile.rating_average,
    rating_count: profile.rating_count,
    total_sales: profile.total_sales,
    response_rate: profile.response_rate,
    avg_response_time_minutes: profile.avg_response_time_minutes,
    followers_count: profile.followers_count,
    created_at: profile.created_at,
    is_online: profile.is_online,
    last_seen: profile.last_seen,
  };
};

/**
 * Filters phone number from listing based on visibility settings and user permissions
 * @param listing - The listing object
 * @param currentUserId - The ID of the current user (null if not authenticated)
 * @param isInConversation - Whether the current user has an active conversation about this listing
 */
export const filterListingPhone = (
  listing: Tables<"listings"> | null,
  currentUserId: string | null,
  isInConversation: boolean = false
): Partial<Tables<"listings">> | null => {
  if (!listing) return null;

  const isOwner = currentUserId && listing.user_id === currentUserId;
  const canSeePhone = listing.phone_visible || isOwner || isInConversation;

  return {
    ...listing,
    phone: canSeePhone ? listing.phone : null,
    // Hide moderation details from non-owners
    moderation_notes: isOwner ? listing.moderation_notes : null,
    moderated_by: isOwner ? listing.moderated_by : null,
  };
};

/**
 * Select clause for public profile fields
 * Use this in Supabase queries to only fetch public data
 */
export const PUBLIC_PROFILE_SELECT = `
  id,
  avatar_url,
  first_name,
  last_name,
  full_name,
  city,
  country,
  verified_seller,
  rating_average,
  rating_count,
  total_sales,
  response_rate,
  avg_response_time_minutes,
  followers_count,
  created_at,
  is_online,
  last_seen
`;

/**
 * Select clause for listing fields (excludes phone by default)
 * Use this for public listing queries
 */
export const PUBLIC_LISTING_SELECT = `
  id,
  title,
  description,
  price,
  currency,
  condition,
  location,
  images,
  category_id,
  user_id,
  status,
  created_at,
  updated_at,
  views,
  delivery_available,
  delivery_price,
  delivery_zone,
  whatsapp_available,
  phone_visible
`;
